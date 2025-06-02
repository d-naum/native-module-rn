import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import ThemeSwitcher from '../components/ThemeSwitcher';

const HomeScreen: React.FC = () => {
  const { currentScheme } = useTheme();

  const isDarkMode = currentScheme === 'dark';
  const backgroundColor = isDarkMode ? '#000000' : '#ffffff';
  const textColor = isDarkMode ? '#ffffff' : '#000000';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={[styles.scrollView, { backgroundColor }]}
      >
        <View style={[styles.body, { backgroundColor }]}>
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Welcome to React Native!
            </Text>
            <Text style={[styles.sectionDescription, { color: textColor }]}>
              This app demonstrates native module integration for system theme control.
              Use the buttons below to change your device's theme.
            </Text>
          </View>

          <ThemeSwitcher />

          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Features:
            </Text>
            <Text style={[styles.sectionDescription, { color: textColor }]}>
              • Native Android & iOS theme modules{'\n'}
              • Real-time theme switching{'\n'}
              • System theme detection{'\n'}
              • Smooth UI transitions
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 24,
  },
});

export default HomeScreen;