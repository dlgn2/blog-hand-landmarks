import React, { useState } from 'react';
import {
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Paths } from '@/navigation/paths';
import { RootScreenProps } from '@/navigation/types';

import IconButton from '@/components/buttons/IconButton';
import { API } from '@/services/implementations/api/API';

/**
 * Checkbox satırı oluştururken "linkUrl" yerine
 * bir fonksiyon alarak PDF Viewer'a yönlendiriyoruz.
 */
const Register = ({ navigation }: RootScreenProps) => {
  const api = new API();
  const insets = useSafeAreaInsets();
  const [showEmailRegister, setShowEmailRegister] = useState(false);

  // State for registration form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [name, setName] = useState('');

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    generalError: '',
  });

  // Modal state
  const [showModal, setShowModal] = useState(false);

  // Checkbox states (manual)
  const [cookiePolicy, setCookiePolicy] = useState(false);
  const [ticariElektronik, setTicariElektronik] = useState(false);
  const [kisiselVeri, setKisiselVeri] = useState(false);
  const [termsAndConditions, setTermsAndConditions] = useState(false);
  const [gizlilikPolitikasi, setGizlilikPolitikasi] = useState(false);
  const [disclosureStatement, setDisclosureStatement] = useState(false);

  const allChecked =
    cookiePolicy &&
    ticariElektronik &&
    kisiselVeri &&
    termsAndConditions &&
    gizlilikPolitikasi &&
    disclosureStatement;

  const handleRegister = async () => {
    let valid = true;
    let newErrors = {
      email: '',
      password: '',
      confirmPassword: '',
      generalError: '',
    };

    // Email validation
    if (!email) {
      newErrors.email = 'E-posta adresi gerekli.';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin.';
      valid = false;
    }

    // Password validation
    if (password.length < 8) {
      newErrors.password = 'Şifre en az 8 karakter olmalıdır.';
      valid = false;
    }

    // Confirm Password validation
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor.';
      valid = false;
    }

    setErrors(newErrors);

    if (valid && allChecked) {
      try {
        const response = await api.user.register(
          email,
          password,
          name,
          'BASIC',
          'profile_photo'
        );
        console.log('response', response);
        if (response && response.access_token) {
          setShowModal(true);
        } else {
          setErrors({
            ...newErrors,
            generalError: 'Hesap oluşturulurken bir hata oluştu.',
          });
        }
      } catch (error) {
        console.log('err2', JSON.stringify('error'));
        if (error instanceof Error) {
          console.log('errrr1', error.message);
          if (error.message === 'Email already registered') {
            setErrors({
              ...newErrors,
              generalError: 'Bu e-posta adresi zaten kayıtlı.',
            });
          } else {
            setErrors({
              ...newErrors,
              generalError: 'Hesap oluşturulurken bir hata oluştu.',
            });
          }
        } else if (typeof error === 'object' && error !== null) {
          console.log('errrr2', JSON.stringify(error, null, 2));
        } else {
          setErrors({
            ...newErrors,
            generalError: 'Hesap oluşturulurken bir hata oluştu.',
          });
          console.log('errrr3', error);
        }
      }
    }
  };

  /**
   * PDF Viewer'a yönlendirirken pdfKey parametresi gönderiyoruz.
   * Hangi PDF açılacaksa pdfKey'i ona göre belirliyoruz.
   */
  const handleOpenPdf = (pdfKey: string) => {
    //@ts-ignore
    navigation.replace(Paths.PdfViewer, { pdfKey });
  };

  const renderCustomCheckboxLine = (
    checked: boolean,
    setChecked: (val: boolean) => void,
    text: string,
    onPressPdf: () => void
  ) => (
    <View style={styles.checkboxLine}>
      <TouchableOpacity
        onPress={() => setChecked(!checked)}
        style={styles.customCheckbox}
        activeOpacity={0.7}
      >
        {checked && <View style={styles.checkboxInner} />}
      </TouchableOpacity>
      <TouchableOpacity onPress={onPressPdf}>
        <Text style={styles.checkboxText}>{text}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <SafeAreaView style={styles.container}>
        {/* Geri Butonu */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 10 + insets.top,
            left: 10,
            zIndex: 999,
          }}
          onPress={() => {
            if (showEmailRegister) {
              setShowEmailRegister(false);
            } else {
              navigation.replace(Paths.Splash);
            }
          }}
        >
          <FastImage
            source={require('../../theme/assets/images/back-icon.png')}
            style={{
              width: 25,
              height: 25,
            }}
          />
        </TouchableOpacity>

        {!showEmailRegister ? (
          // İlk Kayıt Ekranı
          <>
            <View style={styles.logoContainer}>
              <FastImage
                source={require('../../theme/assets/images/logo-icon.png')}
                style={{
                  width: 90,
                  height: 90,
                }}
              />
              <Text style={styles.logoText}>YETERLINGO</Text>
            </View>

            <View style={styles.registerOptions}>
              <IconButton
                image={require('../../theme/assets/images/mail.png')}
                text="E-postayla kayıt ol"
                onClick={() => {
                  setShowEmailRegister(true);
                }}
              />
            </View>

            <View style={styles.loginLinkContainer}>
              <Text style={{ color: '#000' }}>Zaten bir hesabın var mı?</Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.replace(Paths.Login);
                }}
              >
                <Text style={styles.loginLinkText}>Giriş yap</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          // Email ile Kayıt Formu
          <>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Hesap Oluştur</Text>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="İsim"
                  placeholderTextColor="#888"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="E-posta adresi"
                  placeholderTextColor="#888"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Şifre"
                  placeholderTextColor="#888"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!passwordVisible}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setPasswordVisible(!passwordVisible)}
                >
                  <FastImage
                    source={
                      passwordVisible
                        ? require('../../theme/assets/images/eye-open.png')
                        : require('../../theme/assets/images/eye-closed.png')
                    }
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Şifre Tekrar"
                  placeholderTextColor="#888"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!passwordVisible}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setPasswordVisible(!passwordVisible)}
                >
                  <FastImage
                    source={
                      passwordVisible
                        ? require('../../theme/assets/images/eye-open.png')
                        : require('../../theme/assets/images/eye-closed.png')
                    }
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword ? (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              ) : null}

              {errors.generalError ? (
                <Text style={styles.errorText}>{errors.generalError}</Text>
              ) : null}
            </View>

            {/* Checkbox'lar - Artık PDF'leri uygulama içinde göstereceğiz */}
            <View style={styles.inputContainer}>
              {renderCustomCheckboxLine(
                cookiePolicy,
                setCookiePolicy,
                'Çerez Politikası',
                () => handleOpenPdf('cerezPolitikasi')
              )}
              {renderCustomCheckboxLine(
                ticariElektronik,
                setTicariElektronik,
                'TSL Hakkında Bilgilendirme',
                () => handleOpenPdf('tslBilgilendirme')
              )}
              {renderCustomCheckboxLine(
                kisiselVeri,
                setKisiselVeri,
                'Açık Rıza Metni',
                () => handleOpenPdf('acikRizaMetni')
              )}
              {renderCustomCheckboxLine(
                termsAndConditions,
                setTermsAndConditions,
                'Hizmet ve Kullanım Koşulları (TSL)',
                () => handleOpenPdf('hizmetKosullari')
              )}
              {renderCustomCheckboxLine(
                gizlilikPolitikasi,
                setGizlilikPolitikasi,
                'Gizlilik Politikası (KVKK)',
                () => handleOpenPdf('gizlilikPolitikasi')
              )}
              {renderCustomCheckboxLine(
                disclosureStatement,
                setDisclosureStatement,
                'Aydınlatma Metni (TSL)',
                () => handleOpenPdf('aydinlatmaMetni')
              )}
            </View>

            {/* Kayıt Ol Butonu */}
            <View style={styles.inputContainer}>
              <TouchableOpacity
                style={[
                  styles.registerButton,
                  { backgroundColor: allChecked ? '#000' : '#888' },
                ]}
                onPress={handleRegister}
                disabled={!allChecked}
              >
                <Text style={styles.registerButtonText}>Kayıt Ol</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </SafeAreaView>

      {/* Kayıt Başarılı Modal */}
      <Modal visible={showModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Teşekkürler!</Text>
            <Text style={styles.modalMessage}>
              Kaydınızı başarıyla tamamladık. Şimdi size birkaç soru soracağız.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowModal(false);
                navigation.replace(Paths.Onboarding);
              }}
            >
              <Text style={styles.modalButtonText}>Devam Et</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0F3FB',
    flex: 1,
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingTop: heightPercentageToDP(2),
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3C5594',
  },
  registerOptions: {
    marginHorizontal: 10,
    gap: 5,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    paddingBottom: heightPercentageToDP(2),
  },
  loginLinkText: {
    color: '#3C5594',
    fontWeight: 'bold',
  },
  titleContainer: {
    marginTop: heightPercentageToDP(3),
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  inputContainer: {
    marginHorizontal: 20,
    marginTop: 30,
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 15,
    marginTop: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 20,
    fontSize: 16,
    color: '#000',
  },
  eyeIcon: {
    width: 20,
    height: 20,
  },
  registerButton: {
    marginTop: 30,
    marginBottom: 20,
    height: heightPercentageToDP(6.5),
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  errorText: {
    color: 'red',
    marginTop: 5,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)', // yarı şeffaf siyah
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    // gölge veya elevation özellikleri ekleyebilirsiniz
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#000',
  },
  modalButton: {
    backgroundColor: '#943C8B',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
});
