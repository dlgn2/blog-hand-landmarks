import Clipboard from '@react-native-clipboard/clipboard';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { CameraOptions, launchCamera } from 'react-native-image-picker';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Video from 'react-native-video';
import { useCameraPermission } from 'react-native-vision-camera';

import { RootScreenProps } from '@/navigation/types';

import { storage } from '@/App';
import CustomBottomTab from '@/components/CustomBottomTab';
import { API } from '@/services/implementations/api/API';

import HomeMain from './HomeMain';

const words = ['Merhaba', 'Teşekkürler', 'Lütfen', 'Evet', 'Hayır']; // örnek kelimeler
const totalQuestions = words.length;

const Home = ({ navigation, route }: RootScreenProps) => {
  const api = new API();
  const insets = useSafeAreaInsets();
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [showFinalStep, setShowFinalStep] = useState(false); // final step için state
  const { hasPermission, requestPermission } = useCameraPermission();

  // --- Yeni eklenen state ---
  const [showPrizeCodeModal, setShowPrizeCodeModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');

  // ödül (prize) bilgileri
  const [showPrizes, setShowPrizes] = useState(false);
  const [kullanimKosullari, setKullanimKosullari] = useState(false);
  const [prizes, setPrizes] = useState<
    Array<{ is_used: boolean; amount: number; code: string }>
  >([]);
  const [currentPrizeIndex, setCurrentPrizeIndex] = useState(0);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    api.user.myVideos().then((response) => {});
    const isTutorialShowed = storage.getBoolean('isTutorialShowed');
    console.log('isTutorialShowed', isTutorialShowed);
    if (!isTutorialShowed) {
      setShowTutorial(true);
      storage.set('isTutorialShowed', true);
    }
  }, []);

  useEffect(() => {
    const fetchPrizes = async () => {
      const lastPrizeIndex = storage.getNumber('lastPrizeIndex');
      try {
        const prizesResponse = await api.user.getPrizesMe();

        // Kullanılmayan ödülleri filtrele ve state'e kaydet
        const availablePrizes = prizesResponse.filter(
          (prize) => !prize.is_used
        );
        console.log('pricesResponse', prizesResponse);
        setPrizes(prizesResponse);
        if (prizesResponse.length === 1) {
          setCurrentPrizeIndex(0);
        }
        if (prizesResponse.length === 2) {
          setCurrentPrizeIndex(1);
        }

        if (prizesResponse.length > 0) {
          console.log('lastPrizeIndex', lastPrizeIndex);
          if (prizesResponse.length === 1 && lastPrizeIndex === undefined) {
            console.log('aaaa1');
            setShowPrizes(true);
          } else if (prizesResponse.length === 2 && lastPrizeIndex === 0) {
            console.log('aaaa2');
            setShowPrizes(true);
          } else if (prizesResponse.length === 2 && lastPrizeIndex === 1) {
            console.log('aaaa3');
          } else {
            console.log('bu ne ?');
          }
        }
      } catch (error) {
        console.error(error);
        setShowPrizes(false);
      }
    };

    fetchPrizes();
  }, []);

  // Kullanıcının kupon kodunu kopyalaması için fonksiyon
  const handleCopyCode = () => {
    Clipboard.setString(couponCode);
    Alert.alert('Başarılı', 'Kod kopyalandı!');
  };

  // Devam Et butonuna tıklayınca çalışır
  const handleContinue = () => {
    if (!kullanimKosullari) {
      Alert.alert(
        'Uyarı',
        'Lütfen Kullanım Koşullarını okuyup kabul ettiğinizi onaylayın.'
      );
      return;
    }
    // Kullanım koşulları kabul edildiyse:
    setShowPrizes(false); // ana modalı kapat
    setCouponCode(prizes[currentPrizeIndex]?.code || ''); // kodu state'e at
    setShowPrizeCodeModal(true); // ikinci modalı aç (kod görüntüleme)
    storage.set('lastPrizeIndex', currentPrizeIndex);
  };

  const renderCustomCheckboxLine = (
    value: boolean,
    setValue: (val: boolean) => void,
    text: string,
    linkUrl: string
  ) => (
    <View style={styles.checkboxLine}>
      <TouchableOpacity
        onPress={() => setValue(!value)}
        style={styles.customCheckbox}
        activeOpacity={0.7}
      >
        {value && <View style={styles.checkboxInner} />}
      </TouchableOpacity>
      <Text
        onPress={() => Linking.openURL(linkUrl)}
        style={styles.checkboxText}
      >
        {text}
      </Text>
    </View>
  );

  return (
    <>
      <SafeAreaView style={styles.container}>
        {/* Ödül (Prize) Modal */}
        <Modal visible={showPrizes} animationType="slide" transparent={false}>
          <View style={styles.modalContainer}>
            <>
              <View>
                <View
                  style={{
                    marginTop: insets.top + 12,
                    marginBottom: heightPercentageToDP(5),
                  }}
                >
                  <View
                    style={{
                      width: '100%',
                      height: heightPercentageToDP(10),
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    {/* İlk logo alanı: %40 */}
                    <FastImage
                      source={require('../../assets/images/migros.png')}
                      style={{
                        width: '40%',
                        height: '100%',
                      }}
                      resizeMode={FastImage.resizeMode.contain}
                    />

                    {/* Ortadaki boşluk: %20 */}
                    <View style={{ width: '20%' }} />

                    {/* İkinci logo alanı: %40 */}
                    <FastImage
                      source={require('../../assets/images/teknasyon.png')}
                      style={{
                        width: '40%',
                        height: '100%',
                      }}
                      resizeMode={FastImage.resizeMode.contain}
                    />
                  </View>
                  <View
                    style={{
                      marginTop: -heightPercentageToDP(3),
                      flexDirection: 'row-reverse',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                      }}
                    >
                      Sponsorluğunda
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.modalTitle,
                    {
                      fontSize: 20,
                    },
                  ]}
                >
                  Tebrikler!
                </Text>

                <Text
                  style={[
                    styles.modalTitle,
                    {
                      fontSize: 20,
                    },
                  ]}
                >
                  {currentPrizeIndex === 0 ? '3' : '6'} seviye tamamlayarak{' '}
                  {prizes[currentPrizeIndex]?.amount ?? '50'} TL değerinde
                  Migros hediye çeki kazandınız. Kullanım koşullarını kabul
                  ettiğinizde kupon kodunuz e-posta adresinize iletilecektir.
                </Text>

                <View>
                  <FastImage
                    source={require('../../assets/images/reward.png')}
                    style={{
                      width: widthPercentageToDP(80),
                      height: widthPercentageToDP(50),
                      alignSelf: 'center',
                    }}
                  />
                </View>

                <View
                  style={{
                    marginVertical: 20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '500',
                    }}
                  >
                    {currentPrizeIndex === 0
                      ? 'Sürpriz hediye çeklerinin devamı kalan görevlerde seni bekliyor!'
                      : `Veri toplama sürecini başarıyla tamamladınız. Çok teşekkür ederiz!\n\nSoru ve önerileriniz için:\niletisim@yeterly.com`}
                  </Text>
                </View>

                <View style={{ marginBottom: 20 }}>
                  {renderCustomCheckboxLine(
                    kullanimKosullari,
                    setKullanimKosullari,
                    'Kullanım Koşullarını okudum ve kabul ediyorum.',
                    'https://docs.google.com/document/d/1B_XjeU41tGrK2ov6XP-uqHNpEJf6MjPu3VK0KRGgHJw/edit?usp=sharing'
                  )}
                </View>

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleContinue}
                >
                  <Text style={styles.buttonText}>Devam Et</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    top: insets.top,
                    right: 0,
                  }}
                  onPress={() => setShowPrizes(false)}
                >
                  <FastImage
                    source={require('../../assets/icons/close.png')}
                    style={{
                      width: 25,
                      height: 25,
                    }}
                  />
                </TouchableOpacity>
              </View>
            </>
          </View>
        </Modal>

        {/* Kupon Kodunu Gösteren Modal */}
        <Modal
          visible={showPrizeCodeModal}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.prizeCodeModalBackground}>
            <View style={styles.prizeCodeModalContainer}>
              <Text
                style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}
              >
                Kupon Kodunuz:
              </Text>
              <Text style={styles.couponCodeText}>{couponCode}</Text>

              <TouchableOpacity
                style={[styles.button, { marginBottom: 10 }]}
                onPress={handleCopyCode}
              >
                <Text style={styles.buttonText}>Kodu Kopyala</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#999' }]}
                onPress={() => setShowPrizeCodeModal(false)}
              >
                <Text style={styles.buttonText}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <View
          style={{
            height: '100%',
            paddingBottom: '10%',
          }}
        >
          <HomeMain navigation={navigation} route={route} />
        </View>
      </SafeAreaView>

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          width: widthPercentageToDP(100),
          height: heightPercentageToDP(10),
        }}
      >
        <CustomBottomTab navigation={navigation} />
      </View>
    </>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0F3FB',
    height: '100%',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalContent: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  questionNumber: {
    fontSize: 18,
  },
  videoContainer: {
    height: heightPercentageToDP(60),
    borderWidth: 1,
    borderColor: '#000',
    marginVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exampleVideo: {
    width: '100%',
    height: '100%',
  },
  recordContainer: {
    alignItems: 'center',
    height: heightPercentageToDP(60),
  },
  recordButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    width: '100%',
  },
  recordedVideo: {
    width: '100%',
    height: heightPercentageToDP(60),
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#e0386a',
    padding: 15,
    borderRadius: 10,
    width: '48%',
  },
  retakeButton: {
    backgroundColor: '#9c6bef',
    padding: 15,
    borderRadius: 10,
    width: '48%',
  },
  checkboxLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  customCheckbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 10,
    height: 10,
    backgroundColor: '#000',
  },
  checkboxText: {
    color: '#000',
    flexShrink: 1,
    textDecorationLine: 'underline',
    paddingLeft: 5,
  },
  couponCodeText: {
    marginTop: 20,
    marginBottom: 20,
    fontSize: 20,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  prizeCodeModalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  prizeCodeModalContainer: {
    width: '80%',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
});
