/* Amplify Params - DO NOT EDIT
	API_THECRIB_GRAPHQLAPIENDPOINTOUTPUT
	API_THECRIB_GRAPHQLAPIIDOUTPUT
	ENV
	REGION
	STORAGE_RECEIPTS_BUCKETNAME
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');
const https = require('https');
const url = require('url');

// Initialize AWS services
const textract = new AWS.Textract();
const s3 = new AWS.S3();

// GraphQL mutations
const updateReceiptMutation = /* GraphQL */ `
  mutation UpdateReceipt($input: UpdateReceiptInput!) {
    updateReceipt(input: $input) {
      id
      extractedText
      extractedAmount
    }
  }
`;

// Function to make GraphQL API calls
const callGraphQL = async (query, variables) => {
  const endpoint = process.env.API_THECRIB_GRAPHQLAPIENDPOINTOUTPUT;
  
  // Create the request
  const parsedUrl = url.parse(endpoint);
  const req = new AWS.HttpRequest(endpoint, process.env.REGION);
  
  req.method = 'POST';
  req.headers.host = parsedUrl.host;
  req.headers['Content-Type'] = 'application/json';
  req.body = JSON.stringify({
    query,
    variables
  });
  
  // Sign the request (IAM auth)
  const signer = new AWS.Signers.V4(req, 'appsync', true);
  signer.addAuthorization(AWS.config.credentials, AWS.util.date.getDate());
  
  // Send the request
  return new Promise((resolve, reject) => {
    const httpRequest = https.request({
      ...parsedUrl,
      method: req.method,
      headers: req.headers
    }, (result) => {
      let data = '';
      result.on('data', (chunk) => {
        data += chunk;
      });
      result.on('end', () => {
        resolve(JSON.parse(data.toString()));
      });
    });
    
    httpRequest.on('error', (error) => {
      reject(error);
    });
    
    httpRequest.write(req.body);
    httpRequest.end();
  });
};

// Extract text from receipt using Textract
const processReceiptWithTextract = async (bucket, key) => {
  const params = {
    Document: {
      S3Object: {
        Bucket: bucket,
        Name: key
      }
    },
    FeatureTypes: ['TABLES', 'FORMS']
  };
  
  try {
    const textractResponse = await textract.analyzeDocument(params).promise();
    
    // Extract all detected text
    let extractedText = '';
    let possibleAmounts = [];
    
    // Process blocks to extract text and identify potential amounts
    textractResponse.Blocks.forEach(block => {
      if (block.BlockType === 'LINE' || block.BlockType === 'WORD') {
        if (block.Text) {
          extractedText += block.Text + ' ';
          
          // Look for potential total amounts
          if (
              block.Text.toLowerCase().includes('total') || 
              block.Text.toLowerCase().includes('amount') ||
              block.Text.toLowerCase().includes('sum') ||
              block.Text.toLowerCase().includes('due')
          ) {
            // Check nearby blocks for numbers
            textractResponse.Blocks.forEach(valueBlock => {
              if (valueBlock.BlockType === 'WORD' && 
                  Math.abs(valueBlock.Geometry.BoundingBox.Top - block.Geometry.BoundingBox.Top) < 0.05) {
                
                // Check if the text resembles a currency amount
                if (valueBlock.Text) {
                  const amountMatch = valueBlock.Text.match(/\$?(\d+(\.\d{2})?)/);
                  if (amountMatch) {
                    possibleAmounts.push(parseFloat(amountMatch[1]));
                  }
                }
              }
            });
          }
          
          // Look for currency patterns
          const currencyMatch = block.Text.match(/\$(\d+\.\d{2})/);
          if (currencyMatch) {
            possibleAmounts.push(parseFloat(currencyMatch[1]));
          }
        }
      }
    });
    
    // Find the highest amount, which is likely the total
    let extractedAmount = possibleAmounts.length > 0 ? Math.max(...possibleAmounts) : null;
    
    return {
      extractedText: extractedText.trim(),
      extractedAmount
    };
  } catch (error) {
    console.error('Error processing receipt with Textract:', error);
    throw error;
  }
};

// Main handler function
exports.handler = async (event) => {
  try {
    // Get object information from the event
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    
    console.log(`Processing receipt from ${bucket}/${key}`);
    
    // Extract receipt ID from the key (assuming format: receipts/receiptId_timestamp.jpg)
    const keyParts = key.split('/');
    const fileName = keyParts[keyParts.length - 1];
    const receiptId = fileName.split('_')[0];
    
    // Process the receipt with Textract
    const { extractedText, extractedAmount } = await processReceiptWithTextract(bucket, key);
    
    console.log(`Extracted text: ${extractedText}`);
    console.log(`Extracted amount: ${extractedAmount}`);
    
    // Update the receipt record in the database
    if (receiptId) {
      await callGraphQL(updateReceiptMutation, {
        input: {
          id: receiptId,
          extractedText,
          extractedAmount
        }
      });
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Receipt processed successfully',
        receiptId,
        extractedText,
        extractedAmount
      })
    };
  } catch (error) {
    console.error('Error in lambda function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error processing receipt',
        error: error.message
      })
    };
  }
};