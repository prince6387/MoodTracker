import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Alert,
  TouchableOpacity,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
  const { theme, toggleTheme, useSystem, toggleUseSystem } = useTheme();
  const isDark = theme === 'dark';

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    const loadPrefs = async () => {
      const sound = await AsyncStorage.getItem('soundEnabled');
      const notif = await AsyncStorage.getItem('notificationsEnabled');
      if (sound !== null) setSoundEnabled(sound === 'true');
      if (notif !== null) setNotificationsEnabled(notif === 'true');
    };
    loadPrefs();
  }, []);

  const toggleSound = async () => {
    const newVal = !soundEnabled;
    setSoundEnabled(newVal);
    await AsyncStorage.setItem('soundEnabled', newVal.toString());
  };

  const toggleNotifications = async () => {
    const newVal = !notificationsEnabled;
    setNotificationsEnabled(newVal);
    await AsyncStorage.setItem('notificationsEnabled', newVal.toString());
  };

  const handleClearHistory = async () => {
    Alert.alert(
      '🧽 Clear Mood History',
      'Are you sure you want to delete all saved moods?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Clear',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('moodHistory');
            Alert.alert('✅ Mood history cleared!');
          },
        },
      ]
    );
  };

  const openFeedback = () => {
    Linking.openURL('mailto:your-email@example.com?subject=Mood Tracker Feedback');
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#fff' }]}>
      <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>⚙️ App Settings</Text>

      {/* Theme Controls */}
      <SettingRow label="🌐 Use System Theme" value={useSystem} onToggle={toggleUseSystem} />
      <SettingRow
        label="🌗 Dark Mode"
        value={isDark}
        onToggle={toggleTheme}
        disabled={useSystem}
      />

      {/* Sound & Notification */}
      <SettingRow label="🎵 Mood Sound" value={soundEnabled} onToggle={toggleSound} />
      <SettingRow label="🔔 Notifications (coming soon)" value={notificationsEnabled} onToggle={toggleNotifications} />

      {/* Live Preview */}
      <View style={[styles.previewCard, { backgroundColor: isDark ? '#333' : '#f4f4f4' }]}>
        <Text style={[styles.previewText, { color: isDark ? '#fff' : '#000' }]}>
          {isDark ? '🌑 Dark Mode Preview' : '🌞 Light Mode Preview'}
        </Text>
      </View>

      {/* Clear History */}
      <TouchableOpacity onPress={handleClearHistory} style={styles.clearButton}>
        <Text style={styles.clearText}>🧽 Clear Mood History</Text>
      </TouchableOpacity>

      {/* Feedback */}
      <TouchableOpacity onPress={openFeedback} style={styles.feedbackButton}>
        <Text style={styles.feedbackText}>💌 Send Feedback</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={{ color: isDark ? '#aaa' : '#555' }}>📱 Mood Tracker v1.0</Text>
        <Text style={{ color: isDark ? '#aaa' : '#555' }}>© 2025 Prince Yadav</Text>
      </View>
    </View>
  );
}

const SettingRow = ({ label, value, onToggle, disabled }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View style={styles.card}>
      <Text style={[styles.label, { color: isDark ? '#fff' : '#333' }]}>{label}</Text>
      <Switch value={value} onValueChange={onToggle} disabled={disabled} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  card: {
    backgroundColor: '#EDE7F6',
    borderRadius: 14,
    padding: 15,
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { fontSize: 18 },
  previewCard: {
    marginTop: 20,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
  },
  previewText: {
    fontSize: 18,
    fontStyle: 'italic',
  },
  clearButton: {
    backgroundColor: '#EF5350',
    padding: 14,
    marginTop: 30,
    borderRadius: 14,
    alignItems: 'center',
  },
  clearText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  feedbackButton: {
    backgroundColor: '#4CAF50',
    padding: 14,
    marginTop: 20,
    borderRadius: 14,
    alignItems: 'center',
  },
  feedbackText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
});
