import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { ThemeNativeModule } from '../modules/ThemeModule';

const AdvancedThemeSwitcher: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [systemThemeCapabilities, setSystemThemeCapabilities] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCurrentTheme();
    checkCapabilities();
  }, []);

  const loadCurrentTheme = async () => {
    try {
      const theme = await ThemeNativeModule.getCurrentTheme();
      setCurrentTheme(theme);
    } catch (error) {
      console.error('Failed to get current theme:', error);
    }
  };

  const checkCapabilities = async () => {
    try {
      if (Platform.OS === 'android') {
        const permissions = await ThemeNativeModule.checkSystemThemePermissions();
        setSystemThemeCapabilities(permissions);
      } else {
        const capabilities = await ThemeNativeModule.checkSystemThemeCapabilities();
        setSystemThemeCapabilities(capabilities);
      }
    } catch (error) {
      console.error('Failed to check capabilities:', error);
    }
  };

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    setLoading(true);
    try {
      await ThemeNativeModule.setTheme(theme);
      setCurrentTheme(theme);
      Alert.alert('Success', `Theme changed to ${theme}`);
    } catch (error) {
      Alert.alert('Error', `Failed to change theme: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSystemThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    if (Platform.OS === 'ios') {
      Alert.alert(
        'iOS Limitation',
        'iOS apps cannot change the system theme. This will only change the app appearance.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Change App Theme', onPress: () => handleThemeChange(theme) },
          { text: 'Open Settings', onPress: openSystemSettings },
        ]
      );
      return;
    }

    Alert.alert(
      'System Theme Change',
      'Attempt to change the actual system theme? This may require special permissions.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Try System Change', onPress: () => attemptSystemThemeChange(theme) },
        { text: 'Open Settings', onPress: openSystemThemeSettings },
      ]
    );
  };

  const attemptSystemThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    setLoading(true);
    try {
      const result = await ThemeNativeModule.setSystemThemeDirectly(theme);
      Alert.alert('System Theme', result);
      await loadCurrentTheme();
    } catch (error) {
      Alert.alert(
        'System Theme Failed',
        `Could not change system theme: ${error}\n\nThis usually requires root access or special permissions.`
      );
    } finally {
      setLoading(false);
    }
  };

  const openSystemThemeSettings = async () => {
    try {
      const result = await ThemeNativeModule.openSystemThemeSettings();
      Alert.alert('Settings', result);
    } catch (error) {
      Alert.alert('Error', `Failed to open settings: ${error}`);
    }
  };

  const openSystemSettings = async () => {
    try {
      const result = await ThemeNativeModule.openSystemSettings();
      Alert.alert('Settings', result);
    } catch (error) {
      Alert.alert('Error', `Failed to open settings: ${error}`);
    }
  };

  const getThemeButtonStyle = (theme: string) => [
    styles.themeButton,
    currentTheme === theme && styles.activeThemeButton,
  ];

  const getThemeButtonTextStyle = (theme: string) => [
    styles.themeButtonText,
    currentTheme === theme && styles.activeThemeButtonText,
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Advanced Theme Switcher</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Theme Control</Text>
        <Text style={styles.description}>
          Changes theme for this app only
        </Text>

        <View style={styles.buttonContainer}>
          {(['light', 'dark', 'system'] as const).map((theme) => (
            <TouchableOpacity
              key={theme}
              style={getThemeButtonStyle(theme)}
              onPress={() => handleThemeChange(theme)}
              disabled={loading}
            >
              <Text style={getThemeButtonTextStyle(theme)}>
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Theme Control</Text>
        <Text style={styles.description}>
          {Platform.OS === 'android'
            ? 'Attempts to change the actual system theme (may require root)'
            : 'iOS: Opens system settings for manual theme change'}
        </Text>

        <View style={styles.buttonContainer}>
          {(['light', 'dark', 'system'] as const).map((theme) => (
            <TouchableOpacity
              key={`system-${theme}`}
              style={[styles.systemButton, styles.themeButton]}
              onPress={() => handleSystemThemeChange(theme)}
              disabled={loading}
            >
              <Text style={styles.themeButtonText}>
                System {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Capabilities</Text>
        {systemThemeCapabilities && (
          <View style={styles.capabilitiesContainer}>
            <Text style={styles.capabilityText}>
              Platform: {Platform.OS === 'android' ? 'Android' : 'iOS'}
            </Text>
            {Platform.OS === 'android' ? (
              <>
                <Text style={styles.capabilityText}>
                  System Theme Control: {systemThemeCapabilities.hasSystemThemePermissions ? '✅ Available' : '❌ Limited'}
                </Text>
                <Text style={styles.capabilityText}>
                  Android Version: {systemThemeCapabilities.androidVersion}
                </Text>
                <Text style={styles.capabilityText}>
                  {systemThemeCapabilities.permissionInfo}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.capabilityText}>
                  System Theme Control: {systemThemeCapabilities.canChangeSystemTheme ? '✅ Available' : '❌ Not Available'}
                </Text>
                <Text style={styles.capabilityText}>
                  {systemThemeCapabilities.capabilities}
                </Text>
              </>
            )}
          </View>
        )}

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={Platform.OS === 'android' ? openSystemThemeSettings : openSystemSettings}
        >
          <Text style={styles.settingsButtonText}>
            Open System {Platform.OS === 'android' ? 'Theme ' : ''}Settings
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.currentThemeText}>
          Current Theme: {currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  section: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 10,
  },
  themeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  systemButton: {
    backgroundColor: '#FF6B35',
  },
  activeThemeButton: {
    backgroundColor: '#0056CC',
  },
  themeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  activeThemeButtonText: {
    fontWeight: 'bold',
  },
  capabilitiesContainer: {
    backgroundColor: '#e8e8e8',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  capabilityText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  settingsButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  settingsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  currentThemeText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
});

export default AdvancedThemeSwitcher;
