// ProgressCircle.tsx

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface ProgressCircleProps {
  size: number;
  strokeWidth: number;
  progress: number; // 0 ile 100 arasında bir değer
  children?: React.ReactNode;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({
  size,
  strokeWidth,
  progress,
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (circumference * progress) / 100;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* Arka plan çemberi */}
        <Circle
          stroke="#eee"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* İlerleme çemberi */}
        <Circle
          stroke="#b86aed"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      {/* İçerik */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        {children}
      </View>
    </View>
  );
};

export default ProgressCircle;
