package com.nativemodulesapp

import android.app.UiModeManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.util.Log
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
                    setLightTheme()
                    promise.resolve("Theme changed to light")
                }
                "dark" -> {
                    setDarkTheme()
                    promise.resolve("Theme changed to dark")
                }
                "system" -> {
                    setSystemTheme()
                    promise.resolve("Theme changed to system")
                }
                else -> {
                    promise.reject("INVALID_THEME", "Invalid theme. Use 'light', 'dark', or 'system'")
                    return
                }
            }
            
            // Notify React Native about theme change
            sendThemeChangeEvent(theme)
        } catch (e: Exception) {
            promise.reject("THEME_CHANGE_ERROR", "Failed to change theme: ${e.message}")
        }
    }

    private fun setLightTheme() {
        // Set app-level theme
        AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
        
        // Try to set system-wide theme (Android 10+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            try {
                val uiModeManager = reactApplicationContext.getSystemService(Context.UI_MODE_SERVICE) as UiModeManager
                
                // Try to set night mode - this affects system UI
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    // Android 12+ - Use newer API
                    uiModeManager.setApplicationNightMode(UiModeManager.MODE_NIGHT_NO)
                } else {
                    // Android 10-11 - Use older API
                    uiModeManager.nightMode = UiModeManager.MODE_NIGHT_NO
                }
                
                Log.d("ThemeModule", "System theme set to light")
            } catch (e: SecurityException) {
                Log.w("ThemeModule", "No permission to change system theme, app theme changed only")
            } catch (e: Exception) {
                Log.w("ThemeModule", "Failed to change system theme: ${e.message}")
            }
        }
    }

    private fun setDarkTheme() {
        // Set app-level theme
        AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES)
        
        // Try to set system-wide theme (Android 10+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            try {
                val uiModeManager = reactApplicationContext.getSystemService(Context.UI_MODE_SERVICE) as UiModeManager
                
                // Try to set night mode - this affects system UI
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    // Android 12+ - Use newer API
                    uiModeManager.setApplicationNightMode(UiModeManager.MODE_NIGHT_YES)
                } else {
                    // Android 10-11 - Use older API
                    uiModeManager.nightMode = UiModeManager.MODE_NIGHT_YES
                }
                
                Log.d("ThemeModule", "System theme set to dark")
            } catch (e: SecurityException) {
                Log.w("ThemeModule", "No permission to change system theme, app theme changed only")
            } catch (e: Exception) {
                Log.w("ThemeModule", "Failed to change system theme: ${e.message}")
            }
        }
    }

    private fun setSystemTheme() {
        // Set app to follow system
        AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM)
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            try {
                val uiModeManager = reactApplicationContext.getSystemService(Context.UI_MODE_SERVICE) as UiModeManager
                
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    uiModeManager.setApplicationNightMode(UiModeManager.MODE_NIGHT_AUTO)
                } else {
                    uiModeManager.nightMode = UiModeManager.MODE_NIGHT_AUTO
                }
                
                Log.d("ThemeModule", "Theme set to follow system")
            } catch (e: Exception) {
                Log.w("ThemeModule", "Failed to set system auto theme: ${e.message}")
            }
        }
    }

    @ReactMethod
    fun setSystemThemeDirectly(theme: String, promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                // This method attempts to change the actual system theme
                // Note: This may require special permissions or root access
                val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
                intent.data = Uri.parse("package:" + reactApplicationContext.packageName)
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                
                when (theme.lowercase()) {
                    "light" -> {
                        // Try to use shell commands (requires root or special permissions)
                        tryShellCommand("settings put secure ui_night_mode 1") // Light mode
                    }
                    "dark" -> {
                        // Try to use shell commands (requires root or special permissions)
                        tryShellCommand("settings put secure ui_night_mode 2") // Dark mode
                    }
                    "system" -> {
                        // Try to use shell commands (requires root or special permissions)
                        tryShellCommand("settings put secure ui_night_mode 0") // Auto mode
                    }
                }
                
                promise.resolve("Attempted to change system theme to $theme")
            } else {
                promise.reject("UNSUPPORTED_VERSION", "System theme control requires Android 10+")
            }
        } catch (e: Exception) {
            promise.reject("SYSTEM_THEME_ERROR", "Failed to change system theme: ${e.message}")
        }
    }

    private fun tryShellCommand(command: String) {
        try {
            val process = Runtime.getRuntime().exec(arrayOf("su", "-c", command))
            process.waitFor()
            Log.d("ThemeModule", "Executed shell command: $command")
        } catch (e: Exception) {
            Log.w("ThemeModule", "Shell command failed (likely no root): ${e.message}")
            // Fallback to regular theme setting
        }
    }

    @ReactMethod
    fun openSystemThemeSettings(promise: Promise) {
        try {
            val intent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                // Open display settings where user can manually change theme
                Intent(Settings.ACTION_DISPLAY_SETTINGS)
            } else {
                Intent(Settings.ACTION_SETTINGS)
            }
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            reactApplicationContext.startActivity(intent)
            promise.resolve("Opened system theme settings")
        } catch (e: Exception) {
            promise.reject("SETTINGS_ERROR", "Failed to open system settings: ${e.message}")
        }
    }

    @ReactMethod
    fun checkSystemThemePermissions(promise: Promise) {
        val hasPermissions = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            try {
                val uiModeManager = reactApplicationContext.getSystemService(Context.UI_MODE_SERVICE) as UiModeManager
                // Try to get current mode to test permissions
                uiModeManager.nightMode
                true
            } catch (e: Exception) {
                false
            }
        } else {
            false
        }
        
        val result = Arguments.createMap().apply {
            putBoolean("hasSystemThemePermissions", hasPermissions)
            putInt("androidVersion", Build.VERSION.SDK_INT)
            putString("permissionInfo", if (hasPermissions) {
                "Can change system theme"
            } else {
                "Limited to app theme only"
            })
        }
        
        promise.resolve(result)
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
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Keep: Required for RN built in Event Emitter Calls.
    }
}
