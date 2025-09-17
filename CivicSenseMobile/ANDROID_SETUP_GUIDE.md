# 🤖 Android Development Setup - Complete Guide

## ✅ **Current Status**
- **Environment Variables**: ✅ Configured in `~/.zshrc`
- **Metro Bundler**: ✅ Running on port 8081
- **React Native Code**: ✅ Compiles successfully
- **Android Studio**: ❌ Needs installation

## 📥 **Step 1: Install Android Studio**

### Download
1. Go to: **https://developer.android.com/studio**
2. Click "Download Android Studio"
3. Download the **macOS version** (~1GB)

### Install
1. Open the downloaded `.dmg` file
2. Drag "Android Studio" to "Applications" folder
3. Launch Android Studio from Applications

## 🔧 **Step 2: Android Studio Setup Wizard**

### First Launch
1. **Choose "Standard" installation**
2. **Accept all license agreements**
3. **Let it install Android SDK automatically**
4. **Wait for download to complete** (this may take 10-15 minutes)

### What Gets Installed
- Android SDK (creates `/Users/divyansh/Library/Android/sdk`)
- Android SDK Platform-Tools
- Android SDK Build-Tools
- Android API levels (recommend API 33 or 34)

## 📱 **Step 3: Create Android Virtual Device (AVD)**

### Create AVD
1. **Open Android Studio**
2. **Go to Tools → AVD Manager**
3. **Click "Create Virtual Device"**
4. **Choose device**: Pixel 4 or Pixel 6 (recommended)
5. **Select system image**: API 33 or 34
6. **Click "Finish"**

### Start Emulator
1. **Click the play button** next to your AVD
2. **Wait for emulator to boot** (first time takes 2-3 minutes)
3. **Emulator should show Android home screen**

## ✅ **Step 4: Verify Installation**

Run these commands to verify everything is working:

```bash
# Check if SDK is installed
ls -la "$ANDROID_HOME"

# Check if adb is available
adb version

# Check if emulator is available
emulator -list-avds

# Check React Native doctor
cd CivicSenseMobile && npx react-native doctor
```

**Expected Output:**
- SDK folder should exist with subdirectories
- `adb version` should show Android Debug Bridge version
- `emulator -list-avds` should show your created AVD
- `react-native doctor` should show fewer errors

## 🚀 **Step 5: Run Your React Native App**

### Start Metro Bundler
```bash
cd CivicSenseMobile
npm start
```
*Metro bundler is already running on port 8081*

### Run Android App
```bash
# In a new terminal window
cd CivicSenseMobile
npm run android
```

### What Should Happen
1. **Gradle builds** the Android project (first time takes 5-10 minutes)
2. **App installs** on the emulator
3. **App launches** showing your React Native app
4. **Metro bundler connects** to the app

## 🎯 **Testing Your App**

### Features to Test
1. **Login Screen**: Animated login with gradients
2. **Registration**: Form with modal language picker
3. **Issue Report**: Camera integration and form animations
4. **My Reports**: Dashboard with progress animations
5. **Map View**: Interactive map with markers
6. **Profile**: Settings and logout functionality

### Navigation
- **Tab Navigation**: Bottom tabs with animations
- **Screen Transitions**: Smooth slide animations
- **Modal Presentations**: Category picker, notifications

## 🔧 **Troubleshooting**

### Common Issues

#### 1. "SDK location not found"
```bash
# Check if ANDROID_HOME is set
echo $ANDROID_HOME

# Should show: /Users/divyansh/Library/Android/sdk
```

#### 2. "No emulators found"
```bash
# List available AVDs
emulator -list-avds

# If empty, create AVD in Android Studio
```

#### 3. "Gradle build failed"
```bash
# Clean and rebuild
cd CivicSenseMobile/android
./gradlew clean
cd ..
npm run android
```

#### 4. "Metro bundler not connecting"
```bash
# Restart Metro bundler
npm start

# Clear Metro cache
npx react-native start --reset-cache
```

## 📊 **Expected File Structure After Setup**

```
/Users/divyansh/Library/Android/sdk/
├── build-tools/
├── emulator/
├── platforms/
├── platform-tools/
└── tools/

CivicSenseMobile/
├── android/
│   ├── app/
│   ├── build.gradle
│   └── local.properties
├── src/
│   └── screens/
├── App.tsx
└── package.json
```

## 🎉 **Success Indicators**

### ✅ Installation Complete When:
- Android Studio opens without errors
- AVD Manager shows your created device
- `adb version` shows version number
- `emulator -list-avds` shows your AVD
- `npm run android` builds and installs app
- App launches on emulator showing your React Native interface

### 🚀 App Running Successfully When:
- Metro bundler shows "Metro waiting on exp://..."
- Emulator shows your app's login screen
- You can navigate between screens
- Animations work smoothly
- Camera and location features work (with permissions)

## 📱 **Next Steps After Setup**

1. **Test all screens** and navigation
2. **Test camera integration** for photo uploads
3. **Test location services** for issue reporting
4. **Test animations** and transitions
5. **Connect to backend** (Supabase integration)
6. **Deploy to Google Play Store** (when ready)

## 🆘 **Need Help?**

If you encounter issues:
1. **Check React Native doctor**: `npx react-native doctor`
2. **Check Metro bundler**: `curl http://localhost:8081/status`
3. **Check environment**: `echo $ANDROID_HOME`
4. **Restart everything**: Close Android Studio, restart Metro, try again

Your React Native app is ready to run on Android! 🎉
