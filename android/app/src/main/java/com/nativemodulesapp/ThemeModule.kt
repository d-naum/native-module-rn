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
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        val uiModeManager = reactApplicationContext.getSystemService(Context.UI_MODE_SERVICE) as UiModeManager
                        uiModeManager.setApplicationNightMode(UiModeManager.MODE_NIGHT_AUTO)
                    }
                }
                else -> {
                    promise.reject("INVALID_THEME", "Invalid theme. Use 'light', 'dark', or 'system'")
                    return
                }
            }
            
            // Notify React Native about theme change
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
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Keep: Required for RN built in Event Emitter Calls.
    }
}
