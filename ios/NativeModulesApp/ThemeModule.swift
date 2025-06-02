//
//  ThemeModule.swift
//  NativeModulesApp
//
//  Created on 2025
//

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
        
        // Notify React Native about theme change
        self.sendEvent(withName: "themeChanged", body: theme)
        resolver("Theme changed to \(theme)")
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
  
  @objc
  func openSystemSettings(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      if let settingsUrl = URL(string: UIApplication.openSettingsURLString) {
        if UIApplication.shared.canOpenURL(settingsUrl) {
          UIApplication.shared.open(settingsUrl, completionHandler: { success in
            if success {
              resolver("Opened system settings")
            } else {
              rejecter("SETTINGS_ERROR", "Failed to open system settings", nil)
            }
          })
        } else {
          rejecter("SETTINGS_ERROR", "Cannot open system settings", nil)
        }
      } else {
        rejecter("SETTINGS_ERROR", "Invalid settings URL", nil)
      }
    }
  }
  
  @objc
  func checkSystemThemeCapabilities(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    let result: [String: Any] = [
      "canChangeSystemTheme": false,
      "platform": "iOS",
      "capabilities": "iOS apps can only change their own appearance, not the system theme. Users must manually change the system theme in Settings > Display & Brightness."
    ]
    resolver(result)
  }
  
  // Placeholder methods for Android compatibility
  @objc
  func setSystemThemeDirectly(_ theme: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    rejecter("UNSUPPORTED_PLATFORM", "System theme control is not available on iOS", nil)
  }
  
  @objc
  func openSystemThemeSettings(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    // Redirect to general system settings on iOS
    openSystemSettings(resolver, rejecter: rejecter)
  }
  
  @objc
  func checkSystemThemePermissions(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    let result: [String: Any] = [
      "hasSystemThemePermissions": false,
      "androidVersion": 0,
      "permissionInfo": "iOS does not allow apps to change system theme"
    ]
    resolver(result)
  }
}
