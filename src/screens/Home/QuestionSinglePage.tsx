// QuestionSinglePage.tsx
import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import RNFS from 'react-native-fs';
import {heightPercentageToDP} from 'react-native-responsive-screen';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Video from 'react-native-video';

import {Paths} from '@/navigation/paths';

import {storage} from '@/App';
import GenericModal from '@/components/modals/GenericModal';
import {API} from '@/services/implementations/api/API';

export interface ITask {
  id: number;
  category: string;
  chapter: number;
  finished: boolean;
  level: number;
  word: string;
  example_gif_url: string;
  // Diğer alanlar...
}

export interface ITaskGroup {
  level: number;
  chapter: number;
  tasks: ITask[];
}

const QuestionSinglePage: React.FC<{navigation: any; route: any}> = ({
  navigation,
  route,
}) => {
  const api = new API();
  const insets = useSafeAreaInsets();

  // Artık route.params üzerinden; yalnızca chapter ve selectedLevel aktarılıyor.
  const {
    chapter,
    selectedLevel,
    progress,
    videoUri: initialVideoUri,
  } = route.params;

  // Yerel state'ler:
  const [taskGroup, setTaskGroup] = useState<ITaskGroup | null>(
    route.params.taskGroup || null,
  );
  const [videoUri, setVideoUri] = useState<string | null>(
    initialVideoUri || null,
  );
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [completedTasks, setCompletedTasks] = useState<number>(0);
  const [progressMe, setProgressMe] = useState<ITask | null>(progress || null);
  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);
  const recordButtonRef = useRef<TouchableOpacity>(null);

  // Toplam görev sayısı (taskGroup varsa)
  const totalTasks = taskGroup?.tasks?.length || 0;

  const findNextUnfinishedIndex = (group: ITaskGroup): number => {
    return group.tasks.findIndex(task => !task.finished);
  };

  // Initialization: API’den hem kullanıcının ilerlemesini hem de bu seviyeye ait görevleri çekelim.
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        if (!isMounted) return;
        console.log('progress:', progress);
        if (!progress) {
          console.log('progress yok');
          const fetchedProgressMe = await api.user.getProgressMe();
          setProgressMe(fetchedProgressMe);
        }

        // Tüm görevleri al ve sadece bu seviye ve chapter'a ait olanları filtrele.
        const allTasks = await api.user.getProgressAll();
        const filteredTasks = allTasks.filter(
          task => task.level === selectedLevel && task.chapter === chapter,
        );
        if (filteredTasks.length === 0) {
          Alert.alert('Hata', 'Görev verisi bulunamadı.');
          navigation.replace(Paths.Gorev_Listesi, {selectedLevel});
          return;
        }
        const group: ITaskGroup = {
          level: selectedLevel,
          chapter,
          tasks: filteredTasks,
        };
        setTaskGroup(group);

        const doneCount = filteredTasks.filter(t => t.finished).length;
        setCompletedTasks(doneCount);
        const initialIndex = findNextUnfinishedIndex(group);
        if (initialIndex === -1) {
          Alert.alert('Tebrikler', 'Tüm görevleri tamamladınız! 🎉', [
            {
              text: 'Tamam',
              onPress: () =>
                navigation.replace(Paths.Gorev_Listesi, {selectedLevel}),
            },
          ]);
        } else {
          setCurrentTaskIndex(initialIndex);
        }

        const checkFirstTime = storage.getBoolean('isFirstTimeQuestionSingle');
        if (!checkFirstTime) {
          setShowFirstTimeModal(true);
          storage.set('isFirstTimeQuestionSingle', true);
        }
      } catch (error) {
        console.error('init error:', error);
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, [chapter, selectedLevel, navigation, progress]);

  // Eğer videoUri parametresi geldiyse, set et ve temizle.
  useEffect(() => {
    if (initialVideoUri) {
      const timeout = setTimeout(() => {
        setVideoUri(initialVideoUri);
        navigation.setParams({videoUri: null});
      }, 250);
      return () => clearTimeout(timeout);
    }
  }, [initialVideoUri, navigation]);

  const onVideoLoad = (data: {duration: number}) => {
    setVideoDuration(data.duration);
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Kamera İzni',
          message: 'Video kaydı için kameraya erişim izni gerekiyor.',
          buttonNeutral: 'Daha Sonra Sor',
          buttonNegative: 'İptal',
          buttonPositive: 'Tamam',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const recordVideo = async () => {
    const hasPermission = await requestCameraPermission();
    if (hasPermission) {
      // Artık sadece chapter ve selectedLevel aktararak VideoRecord ekranına geçiş yapıyoruz.
      navigation.replace(Paths.VideoRecord, {
        chapter,
        selectedLevel,
        progress: progressMe,
      });
    }
  };

  const handleSave = async () => {
    if (!videoUri) {
      console.error('Video kaydı yapılmadan görev tamamlanamaz');
      return;
    }

    try {
      setIsUploading(true);
      console.log('Görev Tamamlandı Video:', videoUri);

      const fileExists = await RNFS.exists(videoUri);
      if (!fileExists) {
        console.error('File does not exist:', videoUri);
        Alert.alert('Hata', 'Yüklemek istediğiniz dosya bulunamadı.');
        return;
      }

      if (progressMe && progressMe.id) {
        await api.user.uploadVideo(progressMe.id, videoUri, videoDuration);
        console.log('videoUploaded');
      }

      const updatedProgress = await api.user.getProgressMe();
      setProgressMe(updatedProgress);
      const newCompletedCount = completedTasks + 1;

      if (newCompletedCount >= totalTasks) {
        Alert.alert('Tebrikler', 'Bölümü tamamladınız!', [
          {
            text: 'Tamam',
            onPress: () =>
              navigation.replace(Paths.Gorev_Listesi, {selectedLevel}),
          },
        ]);
        return;
      }

      setCompletedTasks(newCompletedCount);
      setVideoUri(null);
      setVideoDuration(null);

      const nextIndex = findNextUnfinishedIndex(taskGroup!);
      if (nextIndex === -1) {
        Alert.alert('Tebrikler', 'Bölümü tamamladınız!', [
          {
            text: 'Tamam',
            onPress: () =>
              navigation.replace(Paths.Gorev_Listesi, {selectedLevel}),
          },
        ]);
      } else {
        setCurrentTaskIndex(nextIndex);
      }
    } catch (error) {
      console.error('Video yüklenirken hata oluştu', error);
      Alert.alert('Hata', 'Video yüklenirken bir hata oluştu.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFirstTimeModalClose = () => {
    setShowFirstTimeModal(false);
  };

  if (!progressMe || !taskGroup) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator style={{marginTop: 40}} />
      </SafeAreaView>
    );
  }

  const currentWord = progressMe.word || '';
  const exampleUrl = progressMe.example_gif_url || '';

  return (
    <>
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 10 + insets.top,
          left: 10,
          zIndex: 999,
        }}
        onPress={() => {
          navigation.replace(Paths.Gorev_Listesi, {selectedLevel});
        }}>
        <FastImage
          source={require('../../theme/assets/images/back-icon.png')}
          style={{width: 25, height: 25}}
        />
      </TouchableOpacity>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.questionText}>{currentWord}</Text>
          {!videoUri ? (
            <>
              {exampleUrl ? (
                <Video
                  source={{uri: exampleUrl}}
                  style={styles.recordedVideo}
                  onLoad={onVideoLoad}
                  controls
                />
              ) : (
                <View style={styles.emptyVideoPlaceholder}>
                  <Text>Örnek video yüklenemedi</Text>
                </View>
              )}
              <TouchableOpacity
                ref={recordButtonRef}
                style={styles.recordButton}
                onPress={recordVideo}>
                <Text style={styles.buttonText}>Videonu Kaydet</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Video
                source={{uri: videoUri}}
                style={styles.recordedVideo}
                onLoad={onVideoLoad}
                controls
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={isUploading}>
                {isUploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    Kaydet ve Görevi Tamamla
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>

      <GenericModal
        visible={showFirstTimeModal}
        onClose={handleFirstTimeModalClose}
        title="Kelime kaydı rehberi"
        text="Ekranda görmüş olduğunuz kelimenin örnek videosu hemen altında bulunmaktadır. Sağ üst köşede bulunduğunuz görev ve toplam görevi görebilirsiniz."
      />
    </>
  );
};

export default QuestionSinglePage;

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#fff'},
  container: {padding: 16, marginTop: 40, flex: 1},
  questionText: {fontSize: 24, marginBottom: 20, textAlign: 'center'},
  progressContainer: {position: 'absolute', top: 10, right: 20, zIndex: 1000},
  progressText: {fontSize: 18, fontWeight: 'bold'},
  recordButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
  },
  recordedVideo: {
    width: '100%',
    height: heightPercentageToDP(50),
    marginTop: 20,
    backgroundColor: '#000',
  },
  emptyVideoPlaceholder: {
    width: '100%',
    height: heightPercentageToDP(50),
    marginTop: 20,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
  },
  buttonText: {color: '#fff', textAlign: 'center', fontSize: 16},
});
