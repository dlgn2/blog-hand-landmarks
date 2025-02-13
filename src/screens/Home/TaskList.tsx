// TaskList.tsx
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  LayoutChangeEvent,
  LayoutRectangle,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
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

import { storage } from '@/App';
import GenericModal from '@/components/modals/GenericModal';
import { API } from '@/services/implementations/api/API';

import Lock from '../../assets/icons/lock.png';

export interface ITask {
  id?: number;
  category: string;
  chapter: number;
  finished: boolean;
  level: number;
  word: string;
  example_gif_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ITaskGroup {
  level: number;
  chapter: number;
  tasks: ITask[];
}

const TaskList: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  // Artık sadece selectedLevel aktarılıyor.
  const { selectedLevel } = route.params || {};
  const api = new API();
  const insets = useSafeAreaInsets();

  const [taskGroups, setTaskGroups] = useState<ITaskGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [progressMe, setProgressMe] = useState<ITask | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showFirstTimeModal, setShowFirstTimeModal] = useState<boolean>(false);

  // Verileri API'den çekip, yalnızca seçilen seviyedeki görevleri filtreleyip bölümlere ayırıyoruz.
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const allTasks = await api.user.getProgressAll();
      const fetchedProgress = await api.user.getProgressMe();
      setProgressMe(fetchedProgress);

      // Sadece selectedLevel'e ait görevleri alalım.
      const levelTasks = allTasks.filter(
        (task) => task.level === selectedLevel
      );

      // Görevleri bölüm (chapter) bazında grupla:
      const grouped = levelTasks.reduce((acc, task) => {
        const { chapter } = task;
        let group = acc.find((g) => g.chapter === chapter);
        if (!group) {
          group = { level: task.level, chapter, tasks: [] };
          acc.push(group);
        }
        group.tasks.push(task);
        return acc;
      }, [] as ITaskGroup[]);
      grouped.sort((a, b) => a.chapter - b.chapter);
      setTaskGroups(grouped);
    } catch (error) {
      Alert.alert('Hata', 'Görevler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedLevel]);

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [selectedLevel])
  );

  // Örnek: Tooltip için layout ölçümü
  const [tooltipLayout, setTooltipLayout] = useState<LayoutRectangle | null>(
    null
  );
  const firstItemRef = useState<View | null>(null)[0];
  const handleItemLayout = (event: LayoutChangeEvent) => {
    if (!firstItemRef) return;
    // Ölçüm yap ve tooltipLayout set et.
  };

  // İlk kez gösterim modali
  useEffect(() => {
    const checkModalShowed = storage.getBoolean('isExplainModalShowed');
    if (!checkModalShowed) {
      setShowModal(true);
      storage.set('isExplainModalShowed', true);
    }
  }, []);

  const handleFirstTimeModalClose = () => {
    setShowFirstTimeModal(false);
  };

  const handleContinue = () => setShowModal(false);

  // Her bölüm (chapter) için render fonksiyonu
  const renderChapter = ({
    item,
    index,
  }: {
    item: ITaskGroup;
    index: number;
  }) => {
    // Kilit kontrolü: progressMe.chapter < item.chapter ise bölüm kilitli.
    const isLocked = progressMe?.chapter < item.chapter;
    return (
      <View style={styles.chapterItemContainer}>
        <TouchableOpacity
          disabled={isLocked}
          style={styles.chapterItem}
          onPress={() =>
            navigation.replace(Paths.Gorev, {
              // Yalnızca selectedLevel ve chapter bilgisini aktaralım.
              chapter: item.chapter,
              selectedLevel,
            })
          }
        >
          <Text style={styles.chapterTitle}>Bölüm: {item.chapter}</Text>
          {isLocked && (
            <Image source={Lock} style={{ width: 20, height: 20 }} />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        {loading ? (
          <Text style={styles.loadingText}>Görevler yükleniyor...</Text>
        ) : (
          <FlatList
            data={taskGroups}
            keyExtractor={(item) => String(item.chapter)}
            renderItem={renderChapter}
            contentContainerStyle={
              taskGroups.length === 0 ? styles.emptyContainer : undefined
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>Görev bulunamadı.</Text>
            }
          />
        )}
      </SafeAreaView>

      {/* Sponsor/Hediye Modal */}
      <Modal visible={showModal} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <FastImage
              source={require('../../assets/images/teknasyon1.png')}
              style={{
                width: widthPercentageToDP(40),
                height: widthPercentageToDP(16),
              }}
            />
            <Text
              style={{ fontSize: 14, fontWeight: 'bold', marginVertical: 16 }}
            >
              Teknasyon sponsorluğunda Migros hediye çekleri
            </Text>
            <FastImage
              source={require('../../assets/images/migros.png')}
              style={{
                width: widthPercentageToDP(40),
                height: widthPercentageToDP(7.75),
              }}
            />
            <Text
              style={{
                fontSize: 28,
                fontWeight: 'bold',
                textAlign: 'center',
                marginTop: 48,
              }}
            >
              Görevleri tamamlayarak sürpriz hediye çeklerini kap!
            </Text>
            <TouchableOpacity
              style={{ position: 'absolute', top: insets.top, right: 0 }}
              onPress={() => setShowModal(false)}
            >
              <FastImage
                source={require('../../assets/icons/close.png')}
                style={{ width: 25, height: 25 }}
              />
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              bottom: insets.bottom + 15,
              width: widthPercentageToDP(100),
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: '#000',
                padding: 15,
                borderRadius: 10,
                width: '90%',
              }}
              onPress={handleContinue}
            >
              <Text style={styles.buttonText}>Devam Et</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Back Button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 10 + insets.top,
          left: 10,
          zIndex: 999,
        }}
        onPress={() => navigation.replace(Paths.Home)}
      >
        <FastImage
          source={require('../../theme/assets/images/back-icon.png')}
          style={{ width: 25, height: 25 }}
        />
      </TouchableOpacity>

      {/* Basit bilgi modali */}
      <GenericModal
        visible={showFirstTimeModal}
        onClose={handleFirstTimeModalClose}
        title="Seviye İlerlemesi"
        text="Seviye 1'e tıklayarak çalışmaya başlayabilirsiniz. Her seviye, yeni görevler içerir."
      />
    </>
  );
};

export default TaskList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: heightPercentageToDP(12),
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#555',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
  },
  chapterItemContainer: {
    marginBottom: 12,
  },
  chapterItem: {
    padding: 16,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
});
