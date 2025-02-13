import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';

const AndroidTest = () => {
  const device = useCameraDevice('front');
  const { hasPermission } = useCameraPermission();

  if (!hasPermission)
    return (
      <>
        <Text>Camera 1</Text>
      </>
    );
  if (device == null) return <Text>Camera 2</Text>;

  return (
   <View style={{
    width: '100%',
    height: '100%',
    backgroundColor: 'red',
   }}>
     <Camera style={StyleSheet.absoluteFill} device={device} isActive={true} />
   </View>
  );
};

export default AndroidTest;

const styles = StyleSheet.create({});
