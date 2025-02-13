import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { heightPercentageToDP } from 'react-native-responsive-screen';

export interface IconButtonProps {
  image: any;
  text: string;
  onClick: () => void;
}
const IconButton = ({ image, text, onClick }: IconButtonProps) => {
  return (
    <TouchableOpacity style={{}} onPress={onClick}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 15,
          borderWidth: 1,
          borderRadius: 12,
          borderColor: '#D8DADC',
          height: heightPercentageToDP(6.5),
          backgroundColor: 'white',
        }}
      >
        <FastImage
          source={image}
          style={{
            width: 25,
            height: 25,
          }}
        />
        <View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '500',
              color: '#000',
            }}
          >
            {text}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default IconButton;

const styles = StyleSheet.create({});
