import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface MainButtonProps {
  buttonText: string;
  onClick: () => void;
  isActive?: boolean;
  type?: 'contained' | 'outlined';
}

const MainButton = ({
  buttonText,
  onClick,
  isActive = true,
  type = 'contained',
}: MainButtonProps) => {
  const containerStyles = [
    styles.commonContainer,
    type === 'contained'
      ? {
          backgroundColor: isActive ? '#943C8B' : '#BDBDBD',
        }
      : {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: isActive ? '#943C8B' : '#BDBDBD',
        },
  ];

  const textStyles = [
    styles.commonText,
    type === 'contained'
      ? {
          color: isActive ? '#FFFFFF' : '#000000',
        }
      : {
          color: isActive ? '#943C8B' : '#BDBDBD',
        },
  ];

  return (
    <TouchableOpacity disabled={!isActive} onPress={onClick}>
      <View style={containerStyles}>
        <Text style={textStyles}>{buttonText}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default MainButton;

const styles = StyleSheet.create({
  commonContainer: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
