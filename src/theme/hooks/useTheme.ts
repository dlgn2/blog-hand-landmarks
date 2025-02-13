import { useContext } from 'react';

import { ThemeContext } from '../ThemeProvider/ThemeProvider';

const useTheme = () => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    console.warn('useTheme must be used within a ThemeProvider');
    return null;
  }

  return context;
};

export default useTheme;
