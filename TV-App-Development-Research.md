# TV App Development Research: VIDAA, Android TV, Apple TV

## 1. VIDAA (Hisense Smart TVs)

### Technology Stack
- **OS Base:** Linux-based proprietary OS (not Android, not Tizen)
- **App Runtime:** Chromium-based browser engine
- **Languages:** HTML5, CSS, JavaScript
- **JS frameworks:** jQuery, Vue, Angular, Bootstrap, etc.
- **Native option:** Linux executables (much longer cycle: 12-18 months vs 2-6 months for HTML5)
- **Streaming:** HLS, DASH, MSS, HTTP
- **DRM:** Built-in DRM Manager (details under NDA)
- **Code reuse:** ~90-95% reuse possible with other HTML5 TV platforms (Tizen, webOS, Roku)

### Developer Access
- **No public SDK or self-service developer portal.** Entirely partner-driven.
- Apply through the [VIDAA Partners page](https://www.vidaa.com/partners/) to get documentation, sample TVs/dev boxes, and debugging tools.
- Detailed WebApp Development Technical Guide provided after signing an **NDA**.
- No fully capable emulator; testing must be done on real hardware provided by VIDAA.
- Third-party test automation available through [Suitest](https://suite.st/docs/application/setting-up-vidaa-apps/).

### Sideloading / Loading Apps for Testing

**Step-by-step (developer partner process):**
1. Open the VIDAA Store App on the TV.
2. Navigate to the search icon and press **`27753790`** on the remote — this installs the **VIDAA DevKit App**.
3. Launch the DevKit App and note the **MAC Address** and **Device Code**.
4. Send these to your VIDAA/Hisense point of contact.
5. Once you receive a secure key file, place it on the root directory of a USB stick and insert it into the TV.
6. Sideloaded apps use the AppId format `debug-yourAppId` (e.g., `debug-WatchMe`).

**Developer Mode on Hisense VIDAA TVs:** Press Home 3 times, Up twice, then Right-Left-Right-Left-Right on the remote.

**For non-partners:** There is **no way** to sideload arbitrary apps. VIDAA is a closed ecosystem. Some users have discovered Foxxum staging URLs (`apptest.staging.foxxum.com`) that can load web apps, but this is unsupported.

### Costs
- No publicly listed fees. Partnership terms negotiated directly with VIDAA.
- Development hardware (sample TVs/dev boxes) provided by VIDAA to partners.
- Third-party services like Muvi offer managed VIDAA app deployment for a fee.

### Key Limitations
- **Closed ecosystem** — no open developer portal, no public SDK, NDA required
- **No emulator** — must test on real devices
- **2-6 month integration timeline** for HTML5 apps (12-18 months for native)
- **Multiple hardware platforms** (4 platforms, 2 browsers globally) — must test across variants
- **720p/1080p performance** must be carefully optimized; memory constraints are tight
- Resolution targets are typically 720p and 1080p (not 4K for the app UI layer)

---

## 2. Android TV

### Technology Stack
- **Languages:** Kotlin (recommended), Java
- **IDE:** Android Studio
- **Modern UI:** Jetpack Compose for TV (`androidx.tv:tv-material`) — declarative, TV-optimized components
- **Legacy UI:** Leanback library — established, stable, but being superseded
- **Video:** ExoPlayer (now Media3) with adaptive streaming
- **DRM:** Widevine
- **Market reach:** 270+ million Android TV / Google TV devices worldwide

### Required SDKs & Developer Tools
- **Android Studio** (free, Windows/macOS/Linux)
- **Android SDK** with TV system images for the emulator
- **ADB (Android Debug Bridge)** — included in Android SDK Platform Tools
- Official samples: [tv-samples on GitHub](https://github.com/android/tv-samples) (JetStreamCompose, ClassicsKotlin, TvMaterialCatalog, ReferenceAppKotlin)
- [Compose for TV codelab](https://developer.android.com/codelabs/compose-for-tv-introduction)

### Sideloading APKs for Testing

**Via ADB (wireless — most common for devs):**
1. On TV: **Settings > Device Preferences > About** — tap **Build Number** 7 times to enable Developer Options.
2. **Settings > Device Preferences > Developer Options** — enable **USB Debugging**.
3. Find TV's IP: **Settings > Network & Internet** — tap active connection.
4. Install ADB on computer:
   - macOS: `brew install android-platform-tools`
   - Windows: Download SDK Platform Tools from Google
5. Connect: `adb connect <TV_IP>:5555` — approve the prompt on TV.
6. Verify: `adb devices`
7. Install: `adb install /path/to/your-app.apk`
8. Find app: **Settings > Apps > See all apps** (sideloaded apps may not appear in launcher; use **Sideload Launcher** from Play Store).

**Alternative methods:**
- **USB Drive:** Copy APK to USB, use a file manager app on TV to install
- **Downloader App:** Install from Play Store on TV, enter URL to your APK
- **Send Files to TV App:** Install on both TV and phone, transfer APK wirelessly

### Costs
| Item | Cost |
|------|------|
| Android Studio + SDK | Free |
| Google Play Developer account | **$25 one-time** |
| Sideloading for testing | Free (no account needed) |

### Key Limitations
- **Compose for TV is still maturing** — some edge cases may require fallback to Leanback
- **Do not use mobile Compose Material** on TV — lacks TV-optimized focus handling
- **Sideloaded apps don't appear in default launcher** — need a sideload launcher or Settings > Apps
- **D-pad/remote navigation** must be fully supported — touch-only UIs won't work
- Some TV OEMs (e.g., Fire TV) have custom launchers requiring additional configuration

---

## 3. Apple TV (tvOS)

### Technology Stack
- **Languages:** Swift (strongly recommended), Objective-C (legacy)
- **Modern UI:** SwiftUI — declarative, cross-platform code reuse with iOS/iPadOS
- **Legacy UI:** UIKit / TVUIKit
- **Deprecated:** TVMLKit + TVMLKit JS (JavaScript-to-native bridge, being phased out)
- **Focus system:** FocusEngine (critical — all navigation is focus-based via Siri Remote)
- **Video:** AVKit, AVFoundation
- **Graphics/Games:** Metal, SpriteKit, SceneKit

### Required SDKs & Developer Tools
- **Xcode** (free from Mac App Store) — **requires a Mac**
- **Apple TV Simulator** (included in Xcode) for initial development
- **Physical Apple TV** for real-world testing
- **TestFlight** for beta distribution (100 internal, 10,000 external testers)
- **Instruments** (part of Xcode) for performance/memory profiling

### Sideloading / Loading Apps for Testing

**With Xcode (free Apple ID):**
1. Create a free Apple Developer account at [developer.apple.com](https://developer.apple.com).
2. In Xcode: **Xcode > Settings > Accounts** — add your Apple ID.
3. Pair Apple TV with Xcode wirelessly: on Apple TV go to **Settings > Remotes and Devices > Remote App and Devices**, then in Xcode go to **Window > Devices and Simulators** and pair.
4. Create/open a tvOS project. Set Bundle Identifier and select your team under Signing.
5. Select your Apple TV as the run target and click **Run** — deploys directly to device.

**For pre-built IPAs:**
1. Create a dummy tvOS project in Xcode to generate a provisioning profile.
2. Use **iOS App Signer** to re-sign the IPA with your certificate.
3. In Xcode: **Window > Devices and Simulators** — click "+" to install the signed IPA.

### Costs
| Item | Cost |
|------|------|
| Xcode | Free |
| Free Apple Developer account | Free |
| Paid Apple Developer Program | **$99/year** |
| Sideloading with free account | Free (7-day expiry, max 3 apps) |
| Sideloading with paid account | $99/year (365-day expiry) |

### Key Limitations
- **Mac required** — Xcode only runs on macOS
- **Free account:** Apps expire after **7 days**, must re-deploy. Max **3 apps** at a time.
- **No USB-C on Apple TV 4K** — must pair with Xcode wirelessly
- **Focus Engine is mandatory** — no tap/touch gestures, all D-pad navigation
- **TestFlight** recommended for broader beta testing (avoids 7-day expiry)
- tvOS apps are more sandboxed than iOS — limited local file storage access

---

## Quick Comparison

| Feature | VIDAA | Android TV | Apple TV (tvOS) |
|---------|-------|------------|-----------------|
| **Languages** | HTML5/CSS/JS | Kotlin/Java | Swift/Obj-C |
| **UI Framework** | Web (any JS framework) | Compose for TV / Leanback | SwiftUI / UIKit |
| **IDE** | Any web editor | Android Studio | Xcode (Mac only) |
| **Dev Account Cost** | NDA/partnership | $25 one-time | Free or $99/year |
| **Open Developer Portal** | No (partner-only) | Yes | Yes |
| **Sideloading Difficulty** | Hard (partner access) | Easy (ADB) | Medium (Xcode + Mac) |
| **Emulator Available** | No | Yes | Yes |
| **App Expiry (sideloaded)** | N/A | None | 7 days (free) / 365 days (paid) |
| **Time to Store** | 2-6 months | Days-weeks | Days-weeks |
| **Global Devices** | 40M+ | 270M+ | ~100M+ |

---

## Sources
- [VIDAA Partners Page](https://www.vidaa.com/partners/)
- [VIDAA WebApp Development Guide (Scribd)](https://www.scribd.com/document/825727528/WebApp-Development-Guide-for-VIDAA)
- [Suitest - Setting Up VIDAA Apps](https://suite.st/docs/application/setting-up-vidaa-apps/)
- [Spyro-Soft - What is VIDAA OS?](https://spyro-soft.com/blog/media-and-entertainment/what-is-vidaa-os-a-comprehensive-guide-to-your-smart-tv-experience)
- [Android Developers - Compose for TV](https://developer.android.com/training/tv/playback/compose)
- [Android TV Samples on GitHub](https://github.com/android/tv-samples)
- [XDA - How to Sideload Apps on Android TV](https://www.xda-developers.com/how-to-sideload-apps-android-tv/)
- [Apple Developer - Get Started with tvOS](https://developer.apple.com/tvos/get-started/)
- [Apple Developer - tvOS](https://developer.apple.com/tvos/)
