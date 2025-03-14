import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Alert,
  SafeAreaView
} from 'react-native';
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ScanReceiptScreen = () => {
  const navigation = useNavigation();
  const cameraRef = useRef(null);
  
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [capturedImage, setCapturedImage] = useState(null);
  const [processingImage, setProcessingImage] = useState(false);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        
        // Process the image
        const processedImage = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 1000 } }], // Resize to reduce file size
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        
        setCapturedImage(processedImage);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      }
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
  };

  const toggleFlash = () => {
    setFlashMode(
      flashMode === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.on
        : Camera.Constants.FlashMode.off
    );
  };

  const useReceipt = async () => {
    if (!capturedImage) return;
    
    setProcessingImage(true);
    
    try {
      // In a real app with Textract integration, we would send the image to the backend here
      // For simplicity, we'll simulate extraction with dummy data
      
      // Simulate some processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate back to add expense with the receipt data
      navigation.navigate('AddExpense', {
        receiptData: {
          imageUri: capturedImage.uri,
          extractedText: "Sample Store\nReceipt #12345\nDate: " + new Date().toLocaleDateString(),
          extractedAmount: Math.floor(Math.random() * 100) + 10, // Random amount between 10-110
        }
      });
    } catch (error) {
      console.error('Error processing receipt:', error);
      Alert.alert('Error', 'Failed to process receipt. Please try again.');
    } finally {
      setProcessingImage(false);
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No access to camera</Text>
        <Text style={styles.errorSubtext}>
          Please enable camera permissions in your device settings to scan receipts.
        </Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {capturedImage ? (
        <View style={styles.previewContainer}>
          <Image 
            source={{ uri: capturedImage.uri }} 
            style={styles.previewImage} 
            resizeMode="contain"
          />
          
          <View style={styles.previewControls}>
            <TouchableOpacity 
              style={[styles.controlButton, styles.retakeButton]} 
              onPress={retakePicture}
            >
              <Text style={styles.controlButtonText}>Retake</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.controlButton, styles.useButton]} 
              onPress={useReceipt}
              disabled={processingImage}
            >
              {processingImage ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.controlButtonText}>Use Receipt</Text>
              )}
            </TouchableOpacity>
          </View>
          
          {processingImage && (
            <View style={styles.processingOverlay}>
              <ActivityIndicator color="#0066cc" size="large" />
              <Text style={styles.processingText}>Processing receipt...</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.cameraContainer}>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            type={cameraType}
            flashMode={flashMode}
            ratio="4:3"
          >
            <View style={styles.cameraControls}>
              <TouchableOpacity 
                style={styles.flashButton} 
                onPress={toggleFlash}
              >
                <AntDesign 
                  name={flashMode === Camera.Constants.FlashMode.on ? "unlock" : "lamp"} 
                  size={24} 
                  color="white" 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.captureButton} 
                onPress={takePicture}
              />
              
              <TouchableOpacity 
                style={styles.backToAddButton}
                onPress={() => navigation.goBack()}
              >
                <AntDesign name="back" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </Camera>
          
          <View style={styles.guidance}>
            <Text style={styles.guidanceText}>
              Position the receipt within the frame and take a picture
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 30,
  },
  flashButton: {
    padding: 15,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    borderWidth: 5,
    borderColor: '#ccc',
  },
  backToAddButton: {
    padding: 15,
  },
  guidance: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 8,
  },
  guidanceText: {
    color: 'white',
    textAlign: 'center',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  previewImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  previewControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  controlButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retakeButton: {
    backgroundColor: '#6c757d',
  },
  useButton: {
    backgroundColor: '#0066cc',
  },
  controlButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 100,
  },
  errorSubtext: {
    color: 'white',
    textAlign: 'center',
    margin: 20,
  },
  backButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default ScanReceiptScreen;