# React Native Theme Switcher with Native Modules

A complete React Native CLI project demonstrating **native theme switching** capabilities that can control both app-level and system-level theme changes on Android and iOS.

## 🎯 Project Overview

This project showcases:
- ✅ **Native Module Development** for Android (Kotlin) and iOS (Swift)
- ✅ **System Theme Control** attempts on Android
- ✅ **Cross-platform Theme Management** with React Context
- ✅ **TypeScript Integration** with native modules
- ✅ **Advanced UI Components** with theme-aware styling

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js** (v16 or higher)
- **React Native CLI** (`npm install -g @react-native-community/cli`)
- **Android Studio** with Android SDK
- **Xcode** (for iOS development on macOS)
- **Java Development Kit (JDK 11 or higher)**

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
# Navigate to project directory
cd NativeModulesApp

# Install dependencies
npm install

# For iOS (macOS only)
cd ios && pod install && cd ..
```

### 2. Run the Application

#### Android
```bash
# Start Metro bundler
npm start

# In another terminal, run Android
npm run android
# or
npx react-native run-android
```

#### iOS (macOS only)
```bash
# Run iOS simulator
npm run ios
# or
npx react-native run-ios
```

## 🏗️ Project Structure

```
NativeModulesApp/
├── src/
│   ├── components/
│   │   └── AdvancedThemeSwitcher.tsx    # Main UI component
│   ├── context/
│   │   └── ThemeContext.tsx             # React Context for theme state
│   ├── modules/
│   │   └── ThemeModule.ts               # TypeScript interface
│   └── screens/
│       └── HomeScreen.tsx               # Home screen component
├── android/
│   └── app/src/main/java/com/nativemodulesapp/
│       ├── ThemeModule.kt               # Android native module
│       ├── ThemePackage.kt              # Module registration
│       └── MainApplication.kt           # Updated for ThemePackage
└── ios/
    └── NativeModulesApp/
        ├── ThemeModule.swift            # iOS native module
        ├── ThemeModule.m               # Objective-C bridge
        └── *-Bridging-Header.h         # Swift-ObjC bridge
```

## 🔧 Step-by-Step Native Module Setup

### Part 1: Android Native Module

#### Step 1: Create Android Native Module

Create `android/app/src/main/java/com/nativemodulesapp/ThemeModule.kt`:

```kotlin
package com.nativemodulesapp

import android.app.UiModeManager
import android.content.Context
import android.os.Build
import androidx.appcompat.app.AppCompatDelegate
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class ThemeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "ThemeModule"
    }

    @ReactMethod
    fun setTheme(theme: String, promise: Promise) {
        try {
            when (theme.lowercase()) {
                "light" -> {
                    AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
                    // Attempt system theme change (Android 10+)
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        val uiModeManager = reactApplicationContext.getSystemService(Context.UI_MODE_SERVICE) as UiModeManager
                        uiModeManager.setApplicationNightMode(UiModeManager.MODE_NIGHT_NO)
                    }
                }
                "dark" -> {
                    AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES)
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        val uiModeManager = reactApplicationContext.getSystemService(Context.UI_MODE_SERVICE) as UiModeManager
                        uiModeManager.setApplicationNightMode(UiModeManager.MODE_NIGHT_YES)
                    }
                }
                "system" -> {
                    AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM)
                }
            }
            
            // Notify React Native
            sendThemeChangeEvent(theme)
            promise.resolve("Theme changed to $theme")
        } catch (e: Exception) {
            promise.reject("THEME_CHANGE_ERROR", "Failed to change theme: ${e.message}")
        }
    }

    @ReactMethod
    fun getCurrentTheme(promise: Promise) {
        try {
            val currentNightMode = AppCompatDelegate.getDefaultNightMode()
            val theme = when (currentNightMode) {
                AppCompatDelegate.MODE_NIGHT_NO -> "light"
                AppCompatDelegate.MODE_NIGHT_YES -> "dark"
                AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM -> "system"
                else -> "system"
            }
            promise.resolve(theme)
        } catch (e: Exception) {
            promise.reject("GET_THEME_ERROR", "Failed to get current theme: ${e.message}")
        }
    }

    private fun sendThemeChangeEvent(theme: String) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("themeChanged", theme)
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for RN built in Event Emitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for RN built in Event Emitter
    }
}
```

#### Step 2: Create Package Registration

Create `android/app/src/main/java/com/nativemodulesapp/ThemePackage.kt`:

```kotlin
package com.nativemodulesapp

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class ThemePackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(ThemeModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}
```

#### Step 3: Register Package in MainApplication

Update `android/app/src/main/java/com/nativemodulesapp/MainApplication.kt`:

```kotlin
// Add import
import com.nativemodulesapp.ThemePackage

// In getPackages() method, add:
packages.add(ThemePackage())
```

### Part 2: iOS Native Module

#### Step 1: Create Swift Native Module

Create `ios/NativeModulesApp/ThemeModule.swift`:

```swift
import Foundation
import UIKit

@objc(ThemeModule)
class ThemeModule: RCTEventEmitter {
  
  override init() {
    super.init()
  }
  
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  @objc
  override func supportedEvents() -> [String]! {
    return ["themeChanged"]
  }
  
  @objc
  func setTheme(_ theme: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      if #available(iOS 13.0, *) {
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let window = windowScene.windows.first else {
          rejecter("WINDOW_ERROR", "Could not find window", nil)
          return
        }
        
        switch theme.lowercased() {
        case "light":
          window.overrideUserInterfaceStyle = .light
        case "dark":
          window.overrideUserInterfaceStyle = .dark
        case "system":
          window.overrideUserInterfaceStyle = .unspecified
        default:
          rejecter("INVALID_THEME", "Invalid theme. Use 'light', 'dark', or 'system'", nil)
          return
        }
        
        self.sendEvent(withName: "themeChanged", body: theme)
        resolver("Theme changed to \\(theme)")
      } else {
        rejecter("UNSUPPORTED_VERSION", "Theme changing is only supported on iOS 13+", nil)
      }
    }
  }
  
  @objc
  func getCurrentTheme(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      if #available(iOS 13.0, *) {
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let window = windowScene.windows.first else {
          rejecter("WINDOW_ERROR", "Could not find window", nil)
          return
        }
        
        let theme: String
        switch window.overrideUserInterfaceStyle {
        case .light:
          theme = "light"
        case .dark:
          theme = "dark"
        case .unspecified:
          theme = "system"
        @unknown default:
          theme = "system"
        }
        
        resolver(theme)
      } else {
        resolver("system")
      }
    }
  }
}
```

#### Step 2: Create Objective-C Bridge

Create `ios/NativeModulesApp/ThemeModule.m`:

```objc
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(ThemeModule, RCTEventEmitter)

RCT_EXTERN_METHOD(setTheme:(NSString *)theme
                  resolver:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(getCurrentTheme:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

@end
```

#### Step 3: Create Bridging Header

Create `ios/NativeModulesApp/NativeModulesApp-Bridging-Header.h`:

```objc
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
```

### Part 3: TypeScript Interface

#### Step 1: Create Native Module Interface

Create `src/modules/ThemeModule.ts`:

```typescript
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
```

### Part 4: React Context Setup

#### Step 1: Create Theme Context

Create `src/context/ThemeContext.tsx`:

```typescript
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ThemeNativeModule, ThemeEventEmitter } from '../modules/ThemeModule';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => Promise<void>;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('system');
  const [loading, setLoading] = useState(false);

  const setTheme = async (newTheme: Theme) => {
    setLoading(true);
    try {
      await ThemeNativeModule.setTheme(newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Failed to set theme:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load current theme on startup
    const loadCurrentTheme = async () => {
      try {
        const currentTheme = await ThemeNativeModule.getCurrentTheme();
        setThemeState(currentTheme);
      } catch (error) {
        console.error('Failed to load current theme:', error);
      }
    };

    loadCurrentTheme();

    // Listen for theme changes
    const subscription = ThemeEventEmitter.addListener('themeChanged', (newTheme: Theme) => {
      setThemeState(newTheme);
    });

    return () => subscription.remove();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

### Part 5: UI Components

#### Step 1: Create Theme Switcher Component

Create `src/components/ThemeSwitcher.tsx`:

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme, loading } = useTheme();

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    await setTheme(newTheme);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Theme Switcher</Text>
      <View style={styles.buttonContainer}>
        {(['light', 'dark', 'system'] as const).map((themeOption) => (
          <TouchableOpacity
            key={themeOption}
            style={[
              styles.button,
              theme === themeOption && styles.activeButton,
            ]}
            onPress={() => handleThemeChange(themeOption)}
            disabled={loading}
          >
            <Text
              style={[
                styles.buttonText,
                theme === themeOption && styles.activeButtonText,
              ]}
            >
              {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.currentTheme}>
        Current Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  activeButton: {
    backgroundColor: '#0056CC',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  activeButtonText: {
    fontWeight: 'bold',
  },
  currentTheme: {
    fontSize: 16,
    color: '#666',
  },
});

export default ThemeSwitcher;
```

### Part 6: Main App Setup

Update `App.tsx`:

```typescript
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { ThemeProvider } from './src/context/ThemeContext';
import ThemeSwitcher from './src/components/ThemeSwitcher';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <SafeAreaView style={styles.container}>
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <ThemeSwitcher />
        </ScrollView>
      </SafeAreaView>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});

export default App;
```

## 🔧 Build and Run

### Clean Build (if needed)

```bash
# Clean Android
cd android && ./gradlew clean && cd ..

# Clean iOS (macOS only)
cd ios && xcodebuild clean && pod install && cd ..

# Clean React Native cache
npx react-native start --reset-cache
```

### Development

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios
```

## 🎨 Features

### What This Implementation Provides:

1. **✅ Cross-Platform Theme Control**
   - Works on both Android and iOS
   - Consistent API across platforms

2. **✅ Native Module Integration**
   - Kotlin for Android
   - Swift for iOS
   - TypeScript interface

3. **✅ React Context Management**
   - Centralized theme state
   - Event-driven updates

4. **✅ System Theme Attempts (Android)**
   - Tries to change actual system theme
   - Falls back gracefully if not possible

5. **✅ App Theme Control (iOS)**
   - Changes app appearance only
   - Follows iOS platform limitations

## ⚠️ Limitations

### Android
- **System theme control** may not work on all devices
- Requires Android 10+ for advanced features
- Some manufacturers block system theme changes

### iOS
- **No system theme control** due to platform restrictions
- Can only change app appearance
- User must manually change system theme in Settings

## 🐛 Troubleshooting

### Common Issues:

1. **Module not found error**
   ```bash
   # Clean and reinstall
   npm install
   npx react-native start --reset-cache
   ```

2. **Android build errors**
   ```bash
   cd android && ./gradlew clean && cd ..
   npm run android
   ```

3. **iOS build errors**
   ```bash
   cd ios && pod install && cd ..
   npm run ios
   ```

4. **Theme not changing**
   - Check device Android version (requires 10+)
   - Verify native module registration
   - Check console for error messages

## 📝 Next Steps

1. **Test on physical devices** to verify system theme control
2. **Add error handling** for theme change failures
3. **Implement theme persistence** with AsyncStorage
4. **Add animated transitions** between themes
5. **Create theme presets** beyond light/dark/system

## 📖 Additional Resources

- [React Native Native Modules Guide](https://reactnative.dev/docs/native-modules-intro)
- [Android UiModeManager Documentation](https://developer.android.com/reference/android/app/UiModeManager)
- [iOS Interface Style Documentation](https://developer.apple.com/documentation/uikit/uiuserinterfacestyle)

---

**Note**: This is a demonstration project showcasing native module development. System theme control has platform limitations and may not work on all devices.