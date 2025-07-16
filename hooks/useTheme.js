import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useTheme = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('darkMode');
      setDarkMode(stored === 'true');
    })();
  }, []);

  const toggleDarkMode = async () => {
    const updated = !darkMode;
    setDarkMode(updated);
    await AsyncStorage.setItem('darkMode', JSON.stringify(updated));
  };

  return { darkMode, toggleDarkMode };
};
