# Zama TV - Flutter Application (زما ټلویزیون)

This is the complete, self-contained **Flutter application** for **Zama TV** (Pashto & Afghan Live TV, Radio & Movies).

## Features
- 📺 **Live Afghan TV Channels**: RTA Pashto, TOLO TV, Lemar TV, Ariana, Shamshad, 1TV, Zan TV, Hewad TV Kandahar, Ariana News, TOLOnews.
- 📻 **FM Radio Streaming**: Spogmai FM 102.2, Killid Radio FM.
- 🎬 **Afghan Movies**: High quality streaming for movies like *The Orphanage* & *Osama*.
- 👑 **VIP Profile Dashboard**: Displays user details, approved VIP status (`isVIP: true`), VIP plan name, start date, expiry date, remaining days, and request upgrade options.
- 🔗 **Custom Stream Link**: Add custom m3u8 or video HLS streams.
- 🌙 **Dark/Light Theme & Multi-Language**: Pashto (پښتو), Dari (دري), and English support with RTL layout.
- ⚡ **Material Design 3**: Fully responsive UI designed for phones and tablets (Android 8.1+).

---

## How to Open in Android Studio or VS Code

1. **Download the project**:
   - In AI Studio, click **Settings -> Export as ZIP** to download the whole workspace.
   - Extract the ZIP file on your computer.
   - Navigate to the `flutter_app` folder inside the extracted project.

2. **Open in Android Studio**:
   - Launch Android Studio.
   - Click **Open** and choose the `flutter_app` directory.
   - Android Studio will recognize it as a Flutter project.

3. **Open in VS Code**:
   - Open VS Code.
   - Click `File -> Open Folder` and select `flutter_app`.

---

## How to Run & Build APK

Open your terminal in the `flutter_app` directory:

```bash
# 1. Fetch dependencies
flutter pub get

# 2. Run on attached emulator or device
flutter run

# 3. Build Release APK for Android
flutter build apk --release
```

The compiled Android APK will be available in `build/app/outputs/flutter-apk/app-release.apk`.
