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
}
