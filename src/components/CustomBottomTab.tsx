import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image'; // FastImage ile PNG gösterimi

import { Paths } from '@/navigation/paths';

import ImageIcon from '../assets/icons/image.png';
import StarIcon from '../assets/icons/star.png';
import ProfileIcon from '../assets/icons/profile.png';
interface CustomBottomTabProps {
  navigation: any; // Navigation objesi (navigation.navigate için)
}

const CustomBottomTab: React.FC<CustomBottomTabProps> = ({ navigation }) => {
  return (
    <View style={styles.tabContainer}>
      {/* Home */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => navigation.replace(Paths.Home)}
      >
        <FastImage
          style={{
            width: 25,
            height: 25,
          }}
          source={ImageIcon}
        />
        {/*    <ImageIcon width={25} height={25} /> */}
      </TouchableOpacity>

      {/* Search */}
      {/*    <TouchableOpacity
        style={styles.tabButton}
        onPress={() => navigation.navigate('Search')}
      >
        <ImageIcon width={25} height={25} />
      </TouchableOpacity> */}

      {/* Notifications */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => navigation.replace(Paths.Leaderboard)}
      >
        {/*       <StarIcon width={25} height={25} /> */}
        <FastImage
          style={{
            width: 25,
            height: 25,
          }}
          source={StarIcon}
        />
      </TouchableOpacity>

      {/* Profile */}
      {/*    <TouchableOpacity
        style={styles.tabButton}
        onPress={() => navigation.navigate('Profile')}
      >
        <Settings width={25} height={25} />
      </TouchableOpacity> */}

      {/* Settings */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => navigation.replace(Paths.Settings)}
      >
        {/*   <ProfileIcon width={20} height={20} /> */}
        <FastImage
          style={{
            width: 20,
            height: 20,
          }}
          source={ProfileIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: '100%',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    borderRadius: 60,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 24,
    height: 24,
  },
  tabLabel: {
    fontSize: 12,
    color: 'gray',
    marginTop: 4,
  },
});

export default CustomBottomTab;
