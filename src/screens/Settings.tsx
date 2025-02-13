import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { heightPercentageToDP } from 'react-native-responsive-screen';

import { Paths } from '@/navigation/paths';
import { RootScreenProps } from '@/navigation/types';

import { storage } from '@/App';
import CustomBottomTab from '@/components/CustomBottomTab';
import { useAuth } from '@/context/AuthContext';
import { API } from '@/services/implementations/api/API';

const Settings = ({ navigation }: RootScreenProps) => {
  const api = new API();
  const { user, setUser } = useAuth();

  const [firstName, setFirstName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfo = await api.user.getUser();
        if (userInfo) {
          console.log('userInfo', userInfo);
          setUser(userInfo); // Update user context
          setFirstName(userInfo.name);
          setEmail(userInfo.email);
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleSaveChanges = async () => {
    try {
      const updatedUser = await api.user.updateUser(email, firstName);
      if (updatedUser) {
        setUser(updatedUser); // Update context with new user info
        Alert.alert('Success', 'Your profile has been updated.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
      console.error('Failed to update user:', error);
    }
  };

  const handleChangePassword = async () => {
    if (!password) {
      Alert.alert('Error', 'Please enter a new password.');
      return;
    }
    try {
      const updatedUser = await api.user.updateUser(
        undefined,
        undefined,
        password
      );
      if (updatedUser) {
        Alert.alert('Success', 'Your password has been updated.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update password. Please try again.');
      console.error('Failed to update password:', error);
    }
  };

  const handleLogout = async () => {
    storage.delete('access_token');
    storage.delete('user_id');
    navigation.replace(Paths.Splash);
  };

  return (
    <>
      <SafeAreaView>
        <View style={styles.container}>
          <Text style={styles.header}>Ayarlar</Text>

          <View style={styles.section}>
            <Text style={styles.label}>İsim</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>E-posta</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveChanges}
          >
            <Text style={styles.saveButtonText}>Değişiklikleri Kaydet</Text>
          </TouchableOpacity>

          <View style={styles.section}>
            <Text style={styles.label}>Yeni Şifre</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="Yeni şifrenizi girin"
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleChangePassword}
          >
            <Text style={styles.buttonText}>Şifre Değiştir</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
          </TouchableOpacity>
          <Text
            style={{
              textAlign: 'center',
              marginTop: 20,
              fontSize: 16,
              color: '#000',
            }}
          >
            Soru, dilek ve öneriler:
          </Text>
          <Text
            style={{
              textAlign: 'center',
              marginTop: 20,
              fontSize: 16,
              fontWeight: 'bold',
              color: '#000',
            }}
          >
            iletisim@yeterly.com
          </Text>
        </View>
      </SafeAreaView>
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          height: heightPercentageToDP(10),
        }}
      >
        <CustomBottomTab navigation={navigation} />
      </View>
    </>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    color: '#000',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  divider: {
    borderBottomWidth: 1,
    borderColor: '#ddd',
    marginVertical: 20,
  },
  button: {
    backgroundColor: 'black',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#d9534f',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
