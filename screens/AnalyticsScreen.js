import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LineChart,
  PieChart,
  BarChart,
} from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const moodScores = {
  Energetic: 5,
  Calm: 4,
  Reflective: 3,
  Tired: 2,
  Frustrated: 1,
};

const moodColors = {
  Energetic: '#FFD700',
  Tired: '#00BFFF',
  Frustrated: '#FF6347',
  Calm: '#32CD32',
  Reflective: '#9370DB',
};

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AnalyticsScreen() {
  const [weeklyData, setWeeklyData] = useState(Array(7).fill(0));
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const json = await AsyncStorage.getItem('moodHistory');
        const data = json ? JSON.parse(json) : [];

        setHistory(data);
        processWeeklyData(data);
      } catch (err) {
        console.log('Error loading mood data:', err);
      }
    };

    loadData();
  }, []);

  const processWeeklyData = (data) => {
    const moodPerDay = Array(7).fill([]); // 0 = Sun, 6 = Sat

    data.forEach(entry => {
      const date = new Date(entry.date);
      const day = date.getDay();
      const score = moodScores[entry.mood] || 0;
      moodPerDay[day] = [...moodPerDay[day], score];
    });

    const averagePerDay = moodPerDay.map(dayMoods => {
      if (dayMoods.length === 0) return 0;
      const sum = dayMoods.reduce((a, b) => a + b, 0);
      return parseFloat((sum / dayMoods.length).toFixed(2));
    });

    setWeeklyData(averagePerDay);
  };

  const getPieData = () => {
    const moodCount = {};
    history.forEach(entry => {
      moodCount[entry.mood] = (moodCount[entry.mood] || 0) + 1;
    });

    return Object.entries(moodCount).map(([mood, count]) => ({
      name: mood,
      population: count,
      color: moodColors[mood] || '#ccc',
      legendFontColor: '#333',
      legendFontSize: 14,
    }));
  };

  const getHourlyData = () => {
    const hours = Array(24).fill(0);

    history.forEach(entry => {
      const hour = new Date(entry.date).getHours();
      hours[hour]++;
    });

    return {
      labels: hours.map((_, i) => (i % 3 === 0 ? `${i}:00` : '')),
      datasets: [{ data: hours }],
    };
  };

  const getWeekAverage = (weekOffset = 0) => {
    const now = new Date();
    const currentDay = now.getDay();
    const startOfWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - currentDay - (7 * weekOffset)
    );
    const endOfWeek = new Date(
      startOfWeek.getFullYear(),
      startOfWeek.getMonth(),
      startOfWeek.getDate() + 7
    );

    const weekData = history.filter(entry => {
      const date = new Date(entry.date);
      return date >= startOfWeek && date < endOfWeek;
    });

    if (weekData.length === 0) return 0;

    const sum = weekData.reduce((acc, e) => acc + (moodScores[e.mood] || 0), 0);
    return (sum / weekData.length).toFixed(2);
  };

  const thisWeekAvg = getWeekAverage(0);
  const lastWeekAvg = getWeekAverage(1);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📊 Mood Analytics</Text>

      {/* Weekly Mood Trend Line Chart */}
      <Text style={styles.subHeading}>📈 Mood Averages This Week</Text>
      <LineChart
        data={{
          labels: days,
          datasets: [
            {
              data: weeklyData,
              color: (opacity = 1) => `rgba(123, 97, 255, ${opacity})`,
            },
          ],
        }}
        width={screenWidth - 20}
        height={220}
        yAxisInterval={1}
        chartConfig={{
          backgroundGradientFrom: '#fceabb',
          backgroundGradientTo: '#f8b500',
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
          labelColor: () => '#333',
        }}
        bezier
        style={{ borderRadius: 16 }}
      />

      {/* Pie Chart */}
      <Text style={styles.subHeading}>🎯 Mood Frequency</Text>
      <PieChart
        data={getPieData()}
        width={screenWidth - 20}
        height={220}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="10"
      />

      {/* Hourly Mood Trends */}
      <Text style={styles.subHeading}>🕒 Moods by Hour</Text>
      <BarChart
        data={getHourlyData()}
        width={screenWidth - 20}
        height={220}
        fromZero
        chartConfig={{
          backgroundGradientFrom: '#f5f7fa',
          backgroundGradientTo: '#c3cfe2',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(90, 90, 90, ${opacity})`,
          labelColor: () => '#333',
        }}
        style={{ borderRadius: 16 }}
      />

      {/* Weekly Comparison */}
      <Text style={styles.subHeading}>⏳ Weekly Comparison</Text>
      <View style={styles.compareBox}>
        <Text style={styles.compareText}>📅 This Week: {thisWeekAvg}</Text>
        <Text style={styles.compareText}>📆 Last Week: {lastWeekAvg}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFFDE7',
    flexGrow: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5D1049',
    marginBottom: 20,
  },
  subHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    alignSelf: 'flex-start',
    marginLeft: 10,
    color: '#333',
  },
  compareBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    marginTop: 10,
    width: '90%',
  },
  compareText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 6,
  },
});
