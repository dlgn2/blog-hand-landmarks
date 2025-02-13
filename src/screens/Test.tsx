// Test.tsx
import { start } from 'repl';
import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Video from 'react-native-video';
import {
  Camera,
  Frame,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
  useFrameProcessor,
  VideoFile,
  VisionCameraProxy,
} from 'react-native-vision-camera';
import { useSharedValue } from 'react-native-worklets-core';

import { Paths } from '@/navigation/paths';

import Overlay from '../assets/images/overlay.png';

// Initialize the frame processor plugin
const plugin = VisionCameraProxy.initFrameProcessorPlugin(
  'handLandmarks',
  {}
);

// Ortalama omuz genişliği (cm cinsinden)
const AVERAGE_SHOULDER_WIDTH = 40; // Bu değeri hedef kitlenize göre ayarlayabilirsiniz

// Odak uzaklığı ve sensör genişliği (mm cinsinden)
// Bu değerler cihazınıza özeldir ve kesin değerler için cihaz üreticisinin verilerine bakmalısınız
const FOCAL_LENGTH = 4.25; // Örnek değer
const SENSOR_WIDTH = 6.17; // Örnek değer (iPhone 11 için)

export function handAndPoseLandmarks(frame: Frame) {
  'worklet';

  if (!plugin) {
    console.warn(
      'Frame Processor Plugin yüklenemedi, işleme devam edilemiyor.'
    );
    return null; // Hata yerine `null` döndürerek crash olmasını önlüyoruz
  }

  try {
    return plugin.call(frame);
  } catch (error) {
    console.error('Frame Processor çalıştırılırken hata oluştu:', error);
    return null; // Hata durumunda `null` döndürerek crash'i engelliyoruz
  }
}

// Function to check if required landmarks are present
const areRequiredLandmarksPresent = (handData) => {
  'worklet';

  const handsDetected = handData.length >= 2;
  return handsDetected;
};

const Test: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { chapter, selectedLevel, progress } = route.params;
  // Remove the onVideoRecorded function from route.params
  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission();

  const lastTimeAllLandmarksDetected = useSharedValue(Date.now());
  const allLandmarksDetected = useSharedValue(0); // 0: not detected, 1: detected
  const [cameraActive, setCameraActive] = useState(true);

  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(false);

  const [showModals, setShowModals] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingCountdown, setRecordingCountdown] = useState(3);
  const [showRecordingCountdown, setShowRecordingCountdown] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const camera = useRef<Camera>(null); // Camera reference
  const recordingCountdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [recordingTime, setRecordingTime] = useState(15);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  // Countdown when the camera starts
  useEffect(() => {
    if (cameraActive) {
      setShowCountdown(true);
      let counter = 3;
      setCountdown(counter);

      const countdownInterval = setInterval(() => {
        counter -= 1;
        if (counter === 0) {
          clearInterval(countdownInterval);
          setShowCountdown(false);
          // Start the controls
          setShowModals(true);
        } else {
          setCountdown(counter);
        }
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [cameraActive]);

  // Landmark detection and state update
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (allLandmarksDetected.value === 1) {
        // All landmarks detected
        if (showModals) {
          setShowModals(false);
        }

        if (!isRecording && !showRecordingCountdown) {
          // Start recording countdown
          setShowRecordingCountdown(true);
          let counter = 3;
          setRecordingCountdown(counter);

          recordingCountdownIntervalRef.current = setInterval(() => {
            // Check if conditions are still valid
            if (allLandmarksDetected.value === 0) {
              // Conditions not met, cancel countdown
              if (recordingCountdownIntervalRef.current != null) {
                clearInterval(recordingCountdownIntervalRef.current);
                recordingCountdownIntervalRef.current = null;
              }
              setShowRecordingCountdown(false);
              setShowModals(true);
              return;
            }

            counter -= 1;
            if (counter === 0) {
              if (recordingCountdownIntervalRef.current != null) {
                clearInterval(recordingCountdownIntervalRef.current);
                recordingCountdownIntervalRef.current = null;
              }
              setShowRecordingCountdown(false);
              // Start recording
              startRecording();
            } else {
              setRecordingCountdown(counter);
            }
          }, 1000);
        }
      } else {
        // Required landmarks not detected
        if (!showModals) {
          setShowModals(true);
        }

        if (isRecording) {
          if (now - lastTimeAllLandmarksDetected.value > 3000) {
            // Stop recording if landmarks not detected for 3 seconds
            stopRecording();
          }
        }

        if (showRecordingCountdown) {
          // Cancel recording countdown if conditions not met
          if (recordingCountdownIntervalRef.current != null) {
            clearInterval(recordingCountdownIntervalRef.current);
            recordingCountdownIntervalRef.current = null;
          }
          setShowRecordingCountdown(false);
        }
      }
    }, 500);

    return () => {
      clearInterval(interval);
      if (recordingCountdownIntervalRef.current != null) {
        clearInterval(recordingCountdownIntervalRef.current);
      }
    };
  }, [isRecording, showModals, showRecordingCountdown]);

  // Use a standard frame processor (no Skia drawing)
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    const data = handAndPoseLandmarks(frame);
    if (!data) {
      return;
    }

    const frameWidth = frame.width;
    const frameHeight = frame.height;

    console.log('data',data)
    // Extract landmarks
    const handData = data?.handLandmarks || [];

    // Check if required landmarks are detected
    const requiredLandmarksDetected = areRequiredLandmarksPresent(handData);

    if (requiredLandmarksDetected) {
      lastTimeAllLandmarksDetected.value = Date.now();
      allLandmarksDetected.value = 1;
    } else {
      allLandmarksDetected.value = 0;
    }
  }, []);

  const startRecording = async () => {
    if (camera.current == null) {
      console.warn('Camera ref is null! Stopping recording is not possible.');
      return;
    }

    console.log('Recording started');
    setIsRecording(true);
    setRecordingTime(15);

    // Start 15-second countdown timer
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime((prevTime) => {
        if (prevTime <= 1) {
          if (recordingTimerRef.current) {
            clearInterval(recordingTimerRef.current);
          }
          stopRecording();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    await camera.current.startRecording({
      flash: 'off',
      onRecordingFinished: (video: VideoFile) => {
        console.log('Recording finished:', video);
        setVideoUri(video.path); // Save video path to state
        setShowModal(true); // Open modal
        setIsRecording(false);
      },
      onRecordingError: (error) => {
        console.error('Recording error:', error);
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
        }
        setIsRecording(false);
      },
    });
  };

  const stopRecording = async () => {
    if (camera.current == null) {
      console.warn('Camera ref is null! Stopping recording is not possible.');
      return;
    }

    // Clear the timer if it's still running
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }

    console.log('Recording stopped');
    await camera.current.stopRecording();
    setIsRecording(false);
  };

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.text}>Kamera izni verilmedi</Text>
      </SafeAreaView>
    );
  }

  if (device == null) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.text}>Kamera bulunamadı</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {device != null && (
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          frameProcessor={frameProcessor}
      
          pixelFormat="yuv"
        />
      )}
      {showCountdown && (
        <View style={styles.overlay}>
          <Text style={styles.countdownText}>{countdown}</Text>
        </View>
      )}
      {showModals && (
        <View style={styles.overlay}>
          <Text style={styles.warningText}>
            Lütfen çerçeveye girmek için biraz geriye gidin ve ellerinizin
            tamamen göründüğünden emin olun.
          </Text>
        </View>
      )}
      {showModals && (
        <FastImage
          source={Overlay}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            opacity: 0.4,
          }}
        />
      )}
      {showRecordingCountdown && (
        <View style={styles.overlay}>
          <Text style={styles.countdownText}>{recordingCountdown}</Text>
        </View>
      )}
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <Text style={styles.recordingText}>
            Kayıt Yapılıyor... ({recordingTime}s)
          </Text>
        </View>
      )}

      {isRecording && (
        <TouchableOpacity
          style={styles.stopRecordingButton}
          onPress={stopRecording}
        >
          <Text style={styles.stopRecordingButtonText}>Kaydı Durdur</Text>
        </TouchableOpacity>
      )}

      <Modal visible={showModal} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          {videoUri && (
            <Video
              source={{ uri: videoUri }}
              style={styles.videoPlayer}
              controls
              resizeMode="contain"
            />
          )}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              // Delete video and retake
              setVideoUri(null);
              setShowModal(false);
              setCameraActive(true);
            }}
          >
            <Text style={styles.closeButtonText}>Sil ve Yeniden Çek</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => {
              if (videoUri) {
                // **Navigation kısmı sadece burada değiştirilmiştir:**
                navigation.replace(Paths.Gorev, {
                  videoUri,
                  chapter,
                  selectedLevel,
                  progress,
                });
              }
            }}
          >
            <Text style={styles.closeButtonText}>Devam Et</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 10 + insets.top,
          left: 10,
          zIndex: 999,
        }}
        onPress={() =>
          navigation.replace(Paths.Gorev, {
            chapter,
            selectedLevel,
          })
        }
      >
        <FastImage
          source={require('../theme/assets/images/back-icon.png')}
          style={{ width: 25, height: 25 }}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    color: '#000',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  countdownText: {
    fontSize: 80,
    color: '#fff',
  },
  warningText: {
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  recordingText: {
    fontSize: 24,
    color: 'red',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  videoPlayer: {
    width: '90%',
    height: '60%',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 8,
  },
  continueButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'green',
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  stopRecordingButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'red',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    zIndex: 999,
  },
  stopRecordingButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Test;
