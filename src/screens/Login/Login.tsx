import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { heightPercentageToDP } from 'react-native-responsive-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Paths } from '@/navigation/paths';
import { RootScreenProps } from '@/navigation/types';

import IconButton from '@/components/buttons/IconButton';
import { API } from '@/services/implementations/api/API';

const Login = ({ navigation }: RootScreenProps) => {
  const api = new API();
  const insets = useSafeAreaInsets();
  const [showEmailLogin, setShowEmailLogin] = useState(false);

  // State for email login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');

  // Forgot Password Flow States
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [newPasswordStep, setNewPasswordStep] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');

  const handleEmailLogin = async () => {
    // Simple validation
    if (!email || !password) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    try {
      const response = await api.user.login(email, password);
      if (response.access_token) {
        navigation.replace(Paths.Home);
      } else {
        setError('E-posta veya şifre hatalı.');
      }
    } catch (err) {
      setError('E-posta veya şifre hatalı.');
    }
  };

  const handleForgotPassword = async () => {
    // E-posta ile OTP gönderme
    if (!email) {
      setError('Lütfen e-posta adresinizi girin.');
      return;
    }
    try {
      const response = await api.user.sendOtp(email);
      console.log('response', response);
      if (response) {
        setOtpSent(true);
        setError('');
      } else {
        setError('OTP gönderilemedi1. Lütfen e-postanızı kontrol edin.');
      }
    } catch (err) {
      console.log('err', err);
      setError('OTP gönderilemedi5. Lütfen tekrar deneyin.');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setOtpError('Lütfen kodu girin.');
      return;
    }
    try {
      const response = await api.user.verifyOtp(email, otp);
      if (response) {
        setOtpError('');
        setNewPasswordStep(true);
      } else {
        setOtpError('Girilen kod hatalı.');
      }
    } catch (err) {
      setOtpError('Kod doğrulanamadı. Lütfen tekrar deneyin.');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmNewPassword) {
      setNewPasswordError('Lütfen tüm alanları doldurun.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setNewPasswordError('Şifreler eşleşmiyor.');
      return;
    }

    try {
      const response = await api.user.resetPassword(
        email,
        newPassword,
        confirmNewPassword
      );
      if (response) {
        // Şifre başarıyla güncellendi, şimdi giriş yap ve anasayfaya git
        const loginResponse = await api.user.login(email, newPassword);
        if (loginResponse.access_token) {
          navigation.replace(Paths.Home);
        } else {
          setNewPasswordError('Giriş yapılamadı. Lütfen tekrar deneyin.');
        }
      } else {
        setNewPasswordError('Şifre güncellenemedi. Lütfen tekrar deneyin.');
      }
    } catch (err) {
      setNewPasswordError('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const renderInitialLogin = () => (
    <>
      {/* Logo and Title */}
      <View
        style={[
          styles.logoContainer,
          { marginBottom: heightPercentageToDP(5) },
        ]}
      >
        <FastImage
          source={require('../../assets/images/logo2.png')}
          style={{
            width: 90,
            height: 90,
          }}
        />
        <Text style={styles.logoText}>YETERLINGO</Text>
      </View>

      {/* Login Options */}
      <View style={styles.loginOptions}>
        <IconButton
          image={require('../../theme/assets/images/mail.png')}
          text="E-postayla ile giriş yap"
          onClick={() => {
            setShowEmailLogin(true);
          }}
        />
      </View>

      {/* Register Link */}
      <View
        style={[
          styles.registerLinkContainer,
          {
            marginTop: heightPercentageToDP(3),
          },
        ]}
      >
        <Text
          style={{
            color: '#000',
          }}
        >
          Hesabınız yok mu?
        </Text>
        <TouchableOpacity
          onPress={() => {
            navigation.replace(Paths.Register);
          }}
        >
          <Text style={styles.registerLinkText}>Kayıt ol</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderEmailLoginForm = () => (
    <>
      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Merhaba, hoş geldin!</Text>
      </View>

      {/* Input Fields */}
      <View style={styles.inputContainer}>
        {/* Email Input */}
        <TextInput
          style={styles.textInput}
          placeholder="E-posta adresi"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Password Input */}
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

        {/* Error Message */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Forgot Password */}
        <TouchableOpacity
          onPress={() => {
            setShowForgotPassword(true);
            setShowEmailLogin(false);
            setError('');
          }}
        >
          <Text style={styles.forgotPasswordText}>Şifremi unuttum</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleEmailLogin}>
          <Text style={styles.loginButtonText}>Giriş Yap</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderForgotPassword = () => {
    if (!otpSent && !newPasswordStep) {
      // E-posta girme ve OTP gönderme aşaması
      return (
        <>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Şifremi Unuttum</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="E-posta adresiniz"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleForgotPassword}
            >
              <Text style={styles.loginButtonText}>Kod Gönder</Text>
            </TouchableOpacity>
          </View>
        </>
      );
    }

    if (otpSent && !newPasswordStep) {
      // OTP girme aşaması
      return (
        <>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Doğrulama Kodu</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="6 haneli kod"
              placeholderTextColor="#888"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
              maxLength={6}
            />
            {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleVerifyOtp}
            >
              <Text style={styles.loginButtonText}>Onayla</Text>
            </TouchableOpacity>
          </View>
        </>
      );
    }

    if (newPasswordStep) {
      // Yeni şifre belirleme aşaması
      return (
        <>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Yeni Şifre Belirle</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Yeni Şifre"
              placeholderTextColor="#888"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={true}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.textInput}
              placeholder="Yeni Şifre (Tekrar)"
              placeholderTextColor="#888"
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              secureTextEntry={true}
              autoCapitalize="none"
            />
            {newPasswordError ? (
              <Text style={styles.errorText}>{newPasswordError}</Text>
            ) : null}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleResetPassword}
            >
              <Text style={styles.loginButtonText}>Şifreyi Güncelle</Text>
            </TouchableOpacity>
          </View>
        </>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 10 + insets.top,
          left: 10,
        }}
        onPress={() => {
          if (showForgotPassword || showEmailLogin) {
            // Geriye dönüldüğünde başlangıç ekranına dön
            setShowForgotPassword(false);
            setShowEmailLogin(false);
            setOtpSent(false);
            setNewPasswordStep(false);
            setError('');
            setOtp('');
            setNewPassword('');
            setConfirmNewPassword('');
            setNewPasswordError('');
            setOtpError('');
          } else {
            navigation.goBack();
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

      {!showEmailLogin && !showForgotPassword && renderInitialLogin()}
      {showEmailLogin && !showForgotPassword && renderEmailLoginForm()}
      {showForgotPassword && renderForgotPassword()}
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0F3FB',
    flex: 1,
    justifyContent: 'center',
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
  loginOptions: {
    marginHorizontal: 20,
    gap: 10,
  },
  registerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    paddingBottom: heightPercentageToDP(2),
  },
  registerLinkText: {
    color: '#3C5594',
    fontWeight: 'bold',
  },
  titleContainer: {
    marginTop: heightPercentageToDP(10),
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3C5594',
  },
  inputContainer: {
    marginHorizontal: 20,
    marginTop: 30,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#000',
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  eyeIcon: {
    width: 20,
    height: 20,
  },
  forgotPasswordText: {
    marginTop: 10,
    color: '#3C5594',
    alignSelf: 'flex-end',
    fontSize: 14,
  },
  loginButton: {
    marginTop: 30,
    backgroundColor: '#000',
    height: heightPercentageToDP(6.5),
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  errorText: {
    color: 'red',
    marginTop: 5,
  },
});
