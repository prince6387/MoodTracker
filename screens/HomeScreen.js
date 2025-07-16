import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Audio } from 'expo-av';

const moods = [
  { emoji: '🌞', label: 'Energetic', color: ['#FDC830', '#F37335'] },
  { emoji: '😴', label: 'Tired', color: ['#4facfe', '#00f2fe'] },
  { emoji: '😡', label: 'Frustrated', color: ['#f857a6', '#ff5858'] },
  { emoji: '🧘‍♂️', label: 'Calm', color: ['#43e97b', '#38f9d7'] },
  { emoji: '💭', label: 'Reflective', color: ['#30cfd0', '#330867'] },
];

export default function HomeScreen({ navigation }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [sound, setSound] = useState();

  async function playCelebrationSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/celebrate.mp3')
      );
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.log('🔈 Sound play error:', error);
    }
  }

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const handleSave = async () => {
    if (!selectedMood) {
      Alert.alert('Pick a mood first!');
      return;
    }

    const moodEntry = {
      id: Date.now(),
      mood: selectedMood,
      note,
      date: new Date().toLocaleString(),
    };

    try {
      const prev = await AsyncStorage.getItem('moodHistory');
      const data = prev ? JSON.parse(prev) : [];
      data.push(moodEntry);
      await AsyncStorage.setItem('moodHistory', JSON.stringify(data));

      setShowConfetti(true);
      playCelebrationSound(); // 🔈 play sound
      setTimeout(() => setShowConfetti(false), 3000);
      Alert.alert('🎉 Mood saved!');

      if (data.length === 3) {
        Alert.alert('🔥 Streak!', '3-day mood streak unlocked!');
      } else if (data.length === 10) {
        Alert.alert('🏆 MoodMaster!', '10 moods logged!');
      }

      setSelectedMood(null);
      setNote('');
    } catch (e) {
      console.error('Save error', e);
    }
  };

  return (
    <LinearGradient colors={['#a18cd1', '#fbc2eb']} style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.heading}>🌟 Today's Mood</Text>

        <View style={styles.moodRow}>
          {moods.map((mood, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedMood(mood.label)}
              style={{ width: '45%', margin: 10 }}
            >
              <LinearGradient
                colors={mood.color}
                style={[
                  styles.moodCard,
                  selectedMood === mood.label && styles.selectedMood,
                ]}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={styles.moodLabel}>{mood.label}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.noteLabel}>📝 Mood Notes</Text>
        <View style={styles.noteContainer}>
          <TextInput
            placeholder="Write something..."
            placeholderTextColor="#aaa"
            style={styles.noteInput}
            multiline
            value={note}
            onChangeText={setNote}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save Mood</Text>
        </TouchableOpacity>

        <View style={styles.footerLinks}>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={styles.link}>📜 History</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Analytics')}>
            <Text style={styles.link}>📊 Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.link}>⚙️ Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {showConfetti && <ConfettiCannon count={100} origin={{ x: 200, y: 0 }} />}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  moodCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
  },
  selectedMood: {
    borderWidth: 2,
    borderColor: '#fff',
    transform: [{ scale: 1.05 }],
  },
  moodEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  moodLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  noteLabel: {
    fontSize: 18,
    color: '#fff',
    marginTop: 30,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  noteContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 15,
    minHeight: 100,
    marginBottom: 20,
  },
  noteInput: {
    color: '#fff',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  saveText: {
    color: '#7A5CFA',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
  },
  link: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
