import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ThemeSwitcher: React.FC = () => {
  const { theme, currentScheme, setTheme, isLoading } = useTheme();

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    try {
      await setTheme(newTheme);
      Alert.alert('Theme Changed', `Theme switched to ${newTheme}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to change theme. Please try again.');
      console.error('Theme change error:', error);
    }
  };

  const getButtonStyle = (buttonTheme: 'light' | 'dark' | 'system') => {
    const isSelected = theme === buttonTheme;
    const backgroundColor = isSelected
      ? (currentScheme === 'dark' ? '#0084ff' : '#007AFF')
      : (currentScheme === 'dark' ? '#333' : '#f0f0f0');
    const borderColor = currentScheme === 'dark' ? '#555' : '#ccc';
    
    return [
      styles.button,
      { backgroundColor, borderColor },
    ];
  };

  const getTextStyle = (buttonTheme: 'light' | 'dark' | 'system') => {
    const isSelected = theme === buttonTheme;
    const color = isSelected
      ? '#ffffff'
      : (currentScheme === 'dark' ? '#ffffff' : '#000000');
    
    return [
      styles.buttonText,
      { color },
    ];
  };

  const containerBg = currentScheme === 'dark' ? '#000' : '#fff';
  const titleColor = currentScheme === 'dark' ? '#fff' : '#000';
  const subtitleColor = currentScheme === 'dark' ? '#ccc' : '#666';
  const loadingColor = currentScheme === 'dark' ? '#fff' : '#000';

  return (
    <View style={[styles.container, { backgroundColor: containerBg }]}>
      <Text style={[styles.title, { color: titleColor }]}>
        System Theme Controller
      </Text>

      <Text style={[styles.subtitle, { color: subtitleColor }]}>
        Current: {theme} (displaying {currentScheme})
      </Text>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={loadingColor} />
          <Text style={[styles.loadingText, { color: loadingColor }]}>
            Changing theme...
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={getButtonStyle('light')}
          onPress={() => handleThemeChange('light')}
          disabled={isLoading}
        >
          <Text style={getTextStyle('light')}>☀️ Light</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={getButtonStyle('dark')}
          onPress={() => handleThemeChange('dark')}
          disabled={isLoading}
        >
          <Text style={getTextStyle('dark')}>🌙 Dark</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={getButtonStyle('system')}
          onPress={() => handleThemeChange('system')}
          disabled={isLoading}
        >
          <Text style={getTextStyle('system')}>⚙️ System</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 10,
    margin: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
});

export default ThemeSwitcher;