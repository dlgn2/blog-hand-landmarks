import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';

import { RootScreenProps } from '@/navigation/types';

import CustomBottomTab from '@/components/CustomBottomTab';
import { useAuth } from '@/context/AuthContext';
import { API } from '@/services/implementations/api/API';

export interface User {
  id: number;
  name: string;
  score: number;
  rank: number;
}

const LeaderBoard = ({ navigation }: RootScreenProps) => {
  const api = new API();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await api.user.getProgressLeaderBoard();
        if (data) {
          const sortedLeaderboard = data
            .map((user: any, index: number) => ({
              id: user.user_id,
              name: user.name,
              score: user.point,
              rank: index + 1,
            }))
            .sort((a: User, b: User) => b.score - a.score);

          setLeaderboard(sortedLeaderboard);

          const currentUserData = sortedLeaderboard.find(
            (u: User) => u.id === user?.id
          );
          setCurrentUser(currentUserData || null);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Sıralama bilgisine ulaşılamadı.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [user]);

  const renderItem = ({ item }: { item: User }) => {
    const isCurrentUser = currentUser && item.id === currentUser.id;

    return (
      <View
        style={[
          styles.itemContainer,
          isCurrentUser && styles.currentUserHighlight,
        ]}
      >
        <Text style={styles.rank}>{item.rank}</Text>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.score}>{item.score}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
        <View style={styles.bottomTabContainer}>
          <CustomBottomTab navigation={navigation} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Liderlik Tablosu</Text>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          <View style={styles.headerContainer}>
            <Text style={styles.headerRank}>Sıra</Text>
            <Text style={styles.headerName}>İsim</Text>
            <Text style={styles.headerScore}>Puan</Text>
          </View>
          <FlatList
            data={leaderboard}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          {currentUser && !leaderboard.some((u) => u.id === currentUser.id) && (
            <View style={styles.currentUserContainer}>
              <Text style={styles.yourRankLabel}>Sıralamanız</Text>
              <View style={[styles.itemContainer, styles.currentUserHighlight]}>
                <Text style={styles.rank}>{currentUser.rank}</Text>
                <Text style={styles.name}>{currentUser.name}</Text>
                <Text style={styles.score}>{currentUser.score}</Text>
              </View>
            </View>
          )}
        </>
      )}

      <View style={styles.bottomTabContainer}>
        <CustomBottomTab navigation={navigation} />
      </View>
    </SafeAreaView>
  );
};

export default LeaderBoard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: widthPercentageToDP(5),
    paddingBottom: heightPercentageToDP(10), // To avoid overlap with bottom tab
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: heightPercentageToDP(2),
    color: '#333',
  },
  headerContainer: {
    flexDirection: 'row',
    paddingVertical: heightPercentageToDP(1.5),
    borderBottomWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
  },
  headerRank: {
    flex: 1,
    fontWeight: '600',
    textAlign: 'center',
    color: '#555',
  },
  headerName: {
    flex: 3,
    fontWeight: '600',
    color: '#555',
  },
  headerScore: {
    flex: 1,
    fontWeight: '600',
    textAlign: 'center',
    color: '#555',
  },
  list: {
    flex: 1,
    marginTop: heightPercentageToDP(1),
  },
  listContent: {
    paddingBottom: heightPercentageToDP(2),
  },
  itemContainer: {
    flexDirection: 'row',
    paddingVertical: heightPercentageToDP(1.2),
    paddingHorizontal: widthPercentageToDP(2),
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderColor: '#eee',
  },
  rank: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
  name: {
    flex: 3,
    fontSize: 16,
    color: '#333',
  },
  score: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
  currentUserHighlight: {
    backgroundColor: '#e6f7ff',
  },
  currentUserContainer: {
    marginTop: heightPercentageToDP(2),
    padding: widthPercentageToDP(2),
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    elevation: 2, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  yourRankLabel: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 18,
    marginBottom: heightPercentageToDP(1),
    color: '#333',
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    marginTop: heightPercentageToDP(2),
    fontSize: 16,
  },
  bottomTabContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: heightPercentageToDP(10),
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: widthPercentageToDP(5),
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: heightPercentageToDP(2),
    fontSize: 18,
    color: '#555',
  },
});
