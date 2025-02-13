import NetInfo from '@react-native-community/netinfo';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';

const Empty = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const checkInternetConnection = () => {
      NetInfo.fetch().then((state) => {
        if (!state.isConnected) {
          setIsConnected(false);
          Alert.alert(
            'İnternet Bağlantısı Hatası',
            'İnternet bağlantınız bulunamamıştır. Lütfen internet bağlantınızı kontrol ediniz.',
            [{ text: 'Tamam', onPress: () => {} }]
          );
        }
      });
    };

    checkInternetConnection();
  }, []);

  if (!isConnected) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>İnternet Bağlantısı Yok</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        height: heightPercentageToDP(100),
      }}
    >
      <FastImage
        source={require('../assets/images/logo2.png')}
        style={{
          width: widthPercentageToDP(90),
          height: widthPercentageToDP(90),
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8d7da',
  },
  errorText: {
    color: '#721c24',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default Empty;
