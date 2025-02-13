import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

import { Paths } from '@/navigation/paths';
import { RootScreenProps } from '@/navigation/types';

import { storage } from '@/App';
import MainButton from '@/components/buttons/MainButton';

const Splash = ({ navigation, route }: RootScreenProps) => {
  useEffect(() => {
    storage.set('isTutorialShowed', false);
  }, []);

  const getUserStatus = async () => {};
  return (
    <SafeAreaView
      style={{
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: hp(100),
        backgroundColor: '#F0F3FB',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: hp(2),
        }}
      >
        <FastImage
          source={require('../../assets/images/logo2.png')}
          style={{
            width: widthPercentageToDP(90),
            height: widthPercentageToDP(90),
          }}
        />
      </View>

      <View
        style={{
          marginHorizontal: wp(5),
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: 'regular',
            textAlign: 'center',
            color: '#000',
          }}
        >
          YETERLINGO’YA HOŞ GELDİNİZ.
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontWeight: 'regular',
            lineHeight: 24,
            paddingTop: hp(2),
            textAlign: 'center',
            color: '#000',
          }}
        >
          TÜRK İŞARET DİLİ VERİ SETİ GELİŞTİRMEK İÇİN OLUŞTURULAN UYGULAMADA
          BELİRLİ GÖREVLERİ YERİNE GETİREREK SÜRPRİZ HEDİYELERE SAHİP
          OLABİLİRSİNİZ.
        </Text>
      </View>

      <View
        style={{
          marginBottom: hp(2),
        }}
      >
        <View
          style={{
            marginHorizontal: wp(5),
            marginTop: hp(5),
          }}
        >
          <MainButton
            buttonText={'Giriş Yap'}
            onClick={function (): void {
              navigation.replace(Paths.Login);
            }}
            isActive={true}
            type={'contained'}
          />
        </View>

        <View
          style={{
            marginHorizontal: wp(5),
            marginTop: hp(2),
          }}
        >
          <MainButton
            buttonText={'Kayıt Ol'}
            onClick={function (): void {
              navigation.replace(Paths.Register);
            }}
            isActive={true}
            type={'outlined'}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Splash;

const styles = StyleSheet.create({});
