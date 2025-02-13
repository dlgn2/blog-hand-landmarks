// LevelProgression.tsx
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { heightPercentageToDP } from 'react-native-responsive-screen';
import Svg, { Line } from 'react-native-svg';

import { Paths } from '@/navigation/paths';

import { API } from '@/services/implementations/api/API';

import ProgressCircle from './ProgressCircle';

export interface ITasks {
  category: string;
  chapter: string;
  finished: boolean;
  level: number;
  word: string;
}

export interface ITask {
  category: string;
  chapter: string;
  finished: boolean;
  level: number;
  word: string;
  example_gif_url: string;
  created_at: string;
  updated_at: string;
}

const LevelProgression: React.FC<{ navigation: any }> = ({ navigation }) => {
  const api = new API();

  const screenWidth = Dimensions.get('window').width;
  const circleSize = 70;
  const circleSpacing = 150;

  // Tüm seviyelerin görevleri (API'den çekilecek)
  const [levelTasks, setLevelTasks] = useState<{ [level: number]: ITasks[] }>(
    {}
  );
  // Kullanıcının mevcut ilerlemesi (seviye bilgisi vb.)
  const [progressMe, setProgressMe] = useState<ITask | null>(null);
  // Modal kontrolü (örn. “Tekrar Hoşgeldiniz”)
  const [isModalVisible, setModalVisible] = useState(false);

  const fetchData = async () => {
    try {
      // 1) Tüm görevleri al (örneğin, getProgressAll API çağrısı)
      const fetchedLevels = await api.user.getProgressAll();
      // 2) Kullanıcının ilerlemesini al (getProgressMe API çağrısı)
      const fetchedProgressMe = await api.user.getProgressMe();
      setProgressMe(fetchedProgressMe);

      // 3) Görevleri seviye bazında grupla
      const grouped = fetchedLevels.reduce((acc, task) => {
        const { level } = task;
        if (!acc[level]) acc[level] = [];
        acc[level].push(task);
        return acc;
      }, {} as { [level: number]: ITasks[] });
      setLevelTasks(grouped);
    } catch (error) {
      Alert.alert('Hata', 'Seviyeler yüklenirken bir hata oluştu.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  // Kullanıcının geçerli seviyesi
  const userCurrentLevel = progressMe?.level || 1;

  // "Devam Et" butonuna basıldığında: Sadece selectedLevel aktararak TaskList ekranına geçiş yapıyoruz.
  const handleContinueTask = () => {
    if (!progressMe) {
      setModalVisible(false);
      return;
    }
    navigation.replace(Paths.Gorev_Listesi, {
      selectedLevel: userCurrentLevel,
    });
    setModalVisible(false);
  };

  // "Anasayfaya Dön" butonu
  const handleGoHome = () => {
    setModalVisible(false);
  };

  return (
    <>
      {/* Welcome Back Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Tekrar Hoşgeldiniz!</Text>
            <Text style={styles.modalDescription}>
              Kaldığınız yerden devam etmek ister misiniz?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleContinueTask}
              >
                <Text style={styles.buttonText}>Göreve Devam Et</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleGoHome}
              >
                <Text style={styles.buttonText}>Anasayfaya Dön</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {/* Arka planda SVG ile çizgiler */}
          <Svg
            height={Object.keys(levelTasks).length * circleSpacing}
            width={screenWidth}
            style={StyleSheet.absoluteFill}
          >
            {Object.keys(levelTasks).map((levelKey, index) => {
              if (index === 0) return null; // ilk daire için çizgi yok
              const isPrevLeft = (index - 1) % 2 === 0;
              const isCurrentLeft = index % 2 === 0;
              const prevY = (index - 1) * circleSpacing + circleSize / 2;
              const currentY = index * circleSpacing + circleSize / 2;
              const prevX = isPrevLeft
                ? 50 + circleSize / 2
                : screenWidth - 50 - circleSize / 2;
              const currentX = isCurrentLeft
                ? 50 + circleSize / 2
                : screenWidth - 50 - circleSize / 2;
              return (
                <Line
                  key={`line-${levelKey}`}
                  x1={prevX}
                  y1={prevY}
                  x2={currentX}
                  y2={currentY}
                  stroke="#000"
                  strokeWidth={0.5}
                />
              );
            })}
          </Svg>

          {Object.keys(levelTasks).map((levelStr, index) => {
            const level = parseInt(levelStr, 10);
            const tasks = levelTasks[level] || [];
            const completedCount = tasks.filter((t) => t.finished).length;
            const totalCount = tasks.length;
            const actualProgress =
              totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
            const isCompleted = level < userCurrentLevel;
            const isLocked = level > userCurrentLevel;
            const displayProgress = isCompleted ? 100 : actualProgress;
            const circleColor = isLocked ? '#D8DADC' : '#9B00FF';
            // Sol/sağ konumlandırma
            const xPosition =
              index % 2 === 0 ? 50 : screenWidth - circleSize - 50;
            return (
              <View
                key={level}
                style={[
                  styles.levelWrapper,
                  { marginTop: index === 0 ? 0 : circleSpacing },
                ]}
              >
                <View
                  style={[
                    styles.levelContainer,
                    { left: xPosition, backgroundColor: circleColor },
                  ]}
                >
                  <TouchableOpacity
                    disabled={isLocked}
                    onPress={() => {
                      if (displayProgress === 100) {
                        Alert.alert(
                          'Tebrikler!',
                          'Bu seviyeyi tamamladınız. Sonraki seviyeye geçebilirsiniz.'
                        );
                      } else {
                        navigation.replace(Paths.Gorev_Listesi, {
                          selectedLevel: level,
                        });
                      }
                    }}
                  >
                    <ProgressCircle
                      size={circleSize}
                      strokeWidth={5}
                      progress={displayProgress}
                    >
                      {displayProgress === 100 ? (
                        <Image
                          source={require('../../theme/assets/images/star.png')}
                          style={styles.icon}
                        />
                      ) : (
                        <Text style={styles.levelText}>{level}</Text>
                      )}
                    </ProgressCircle>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </>
  );
};

export default LevelProgression;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingTop: 30,
    paddingBottom: heightPercentageToDP(20),
  },
  container: {
    position: 'relative',
  },
  levelWrapper: {
    position: 'relative',
  },
  levelContainer: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelText: {
    fontSize: 18,
    color: '#fff',
  },
  icon: {
    width: 30,
    height: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
  },
  continueButton: {
    flex: 1,
    backgroundColor: '#9B00FF',
    padding: 12,
    borderRadius: 8,
    marginRight: 5,
    alignItems: 'center',
  },
  closeButton: {
    flex: 1,
    backgroundColor: '#8b8b8b',
    padding: 12,
    borderRadius: 8,
    marginLeft: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
  },
});
