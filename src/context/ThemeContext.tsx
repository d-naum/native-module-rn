import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import ThemeNativeModule, { ThemeEventEmitter } from '../modules/ThemeModule';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeType;
  currentScheme: 'light' | 'dark';
  setTheme: (theme: ThemeType) => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeType>('system');
  const [isLoading, setIsLoading] = useState(true);
  // Determine current scheme based on theme setting and system scheme
  const getCurrentScheme = useCallback((): 'light' | 'dark' => {
    if (theme === 'system') {
      return systemScheme === 'dark' ? 'dark' : 'light';
    }
    return theme as 'light' | 'dark';
  }, [theme, systemScheme]);

  const [currentScheme, setCurrentScheme] = useState<'light' | 'dark'>(getCurrentScheme());

  useEffect(() => {
    // Get initial theme from native module
    const initializeTheme = async () => {
      try {
        const currentTheme = await ThemeNativeModule.getCurrentTheme();
        setThemeState(currentTheme);
      } catch (error) {
        console.error('Failed to get current theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeTheme();

    // Listen for theme changes from native side
    const subscription = ThemeEventEmitter.addListener('themeChanged', (newTheme: ThemeType) => {
      setThemeState(newTheme);
    });

    return () => {
      subscription.remove();
    };
  }, []);
  useEffect(() => {
    setCurrentScheme(getCurrentScheme());
  }, [theme, systemScheme, getCurrentScheme]);

  const setTheme = async (newTheme: ThemeType): Promise<void> => {
    try {
      setIsLoading(true);
      await ThemeNativeModule.setTheme(newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Failed to set theme:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        currentScheme,
        setTheme,
        isLoading,
      }}    >
      {children}
    </ThemeContext.Provider>
  );
};