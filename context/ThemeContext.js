import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColor = Appearance.getColorScheme(); // 'light' or 'dark'
  const [theme, setTheme] = useState(systemColor || 'light');
  const [useSystem, setUseSystem] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      const saved = await AsyncStorage.getItem('appTheme');
      const useSys = await AsyncStorage.getItem('useSystemTheme');
      if (saved) setTheme(saved);
      if (useSys !== null) setUseSystem(useSys === 'true');
    };
    loadTheme();
  }, []);

  useEffect(() => {
    if (useSystem) {
      setTheme(systemColor || 'light');
    }
  }, [useSystem, systemColor]);

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    setUseSystem(false);
    await AsyncStorage.setItem('appTheme', newTheme);
    await AsyncStorage.setItem('useSystemTheme', 'false');
  };

  const toggleUseSystem = async () => {
    const newVal = !useSystem;
    setUseSystem(newVal);
    if (newVal) {
      const sysTheme = Appearance.getColorScheme() || 'light';
      setTheme(sysTheme);
    }
    await AsyncStorage.setItem('useSystemTheme', newVal.toString());
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, useSystem, toggleUseSystem }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
