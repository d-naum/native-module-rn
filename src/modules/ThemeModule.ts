import { NativeEventEmitter, NativeModules } from 'react-native';

interface ThemeModuleInterface {
  setTheme(theme: 'light' | 'dark' | 'system'): Promise<string>;
  getCurrentTheme(): Promise<'light' | 'dark' | 'system'>;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

const { ThemeModule } = NativeModules;

export const ThemeNativeModule: ThemeModuleInterface = ThemeModule;
export const ThemeEventEmitter = new NativeEventEmitter(ThemeModule);

export default ThemeNativeModule;
