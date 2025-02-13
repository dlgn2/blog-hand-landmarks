// App.tsx

import React, { useState } from 'react';
import { View } from 'react-native';

import { RootScreenProps } from '@/navigation/types';

import LevelProgression from './LevelProgression';

const HomeMain = ({ navigation, route }: RootScreenProps) => {
  return (
    <View style={{}}>
      <LevelProgression navigation={navigation} />
    </View>
  );
};

export default HomeMain;
