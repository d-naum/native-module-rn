import { NativeEventEmitter, NativeModules } from 'react-native';

interface ThemeModuleInterface {
  setTheme(theme: 'light' | 'dark' | 'system'): Promise<string>;
  getCurrentTheme(): Promise<'light' | 'dark' | 'system'>;
  // Enhanced system theme methods (Android only)
  setSystemThemeDirectly(theme: 'light' | 'dark' | 'system'): Promise<string>;
  openSystemThemeSettings(): Promise<string>;
  checkSystemThemePermissions(): Promise<{
    hasSystemThemePermissions: boolean;
    androidVersion: number;
    permissionInfo: string;
  }>;
  // iOS system theme methods
  openSystemSettings(): Promise<string>;
  checkSystemThemeCapabilities(): Promise<{
    canChangeSystemTheme: boolean;
    platform: string;
    capabilities: string;
  }>;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

const { ThemeModule } = NativeModules;

export const ThemeNativeModule: ThemeModuleInterface = ThemeModule;
export const ThemeEventEmitter = new NativeEventEmitter(ThemeModule);

export default ThemeNativeModule;
