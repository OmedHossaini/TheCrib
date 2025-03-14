/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	FUNCTION_RECEIPTPROCESSOR_NAME
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();

exports.handler = async (event) => {
  console.log('Received S3 event:', JSON.stringify(event, null, 2));
  
  try {
    // Pass the S3 event to the main receipt processor
    const params = {
      FunctionName: process.env.FUNCTION_RECEIPTPROCESSOR_NAME,
      InvocationType: 'Event',
      Payload: JSON.stringify(event)
    };
    
    await lambda.invoke(params).promise();
    
    return {
      statusCode: 200,
      body: JSON.stringify('S3 event forwarded to receipt processor')
    };
  } catch (error) {
    console.error('Error invoking receipt processor:', error);
    return {
      statusCode: 500,
      body: JSON.stringify('Error processing S3 event')
    };
  }
};