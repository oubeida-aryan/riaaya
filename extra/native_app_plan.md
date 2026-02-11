# Riaya Native App Transformation Plan 📱

This plan outlines the steps to transform the Riaya web application into a secure, production-ready native mobile app for Android and iOS using **Capacitor**.

## Phase 1: Security & Local Persistence (Frictionless UX)
Since we are skipping formal Phone Auth to keep the app fast and easy to use:

1.  **Native Secure Storage**:
    *   Transition from `localStorage` to **Capacitor Preferences**. This ensures that once a user/nurse enters their info, the app "remembers" them forever on that device, creating a logged-in feel without a password.
2.  **Admin-Only Verification (RLS)**:
    *   Enable **Row Level Security** in Supabase so that new nurses are added with a `status = 'pending'`.
    *   Ensure only your **Admin Key** (used in `admin.js`) can change a nurse to `active`.
    *   This prevents unauthorized people from spamming the nurse list while keeping the signup process simple for real nurses.
3.  **Encrypted Metadata**:
    *   Add a hidden "Device ID" to every request sent to Supabase. This helps you identify if the same person is sending multiple fake orders or registrations.

## Phase 2: Native Shell Setup (Capacitor)
Setting up the bridge between your web code and the mobile hardware.

1.  **Project Initialization**:
    *   Run `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, and `@capacitor/ios`.
2.  **Platform Configuration**:
    *   Generate the `android` and `ios` project directories.
    *   Configure `capacitor.config.json` with the app's unique Bundle ID (e.g., `com.ra3aya.app`).
3.  **Permissions Management**:
    *   Update `AndroidManifest.xml` and `Info.plist` to request Geolocation and Notifications permissions with user-friendly Arabic/French descriptions.

## Phase 3: Hardware & Experience Enhancements
Making the app feel "Native" rather than just a website in a frame.

1.  **Push Notifications**:
    *   Integrate Firebase Cloud Messaging (FCM).
    *   Set up a "Nurses" topic so all nurses receive a notification when a new service is requested.
2.  **Native Assets**:
    *   **Splash Screen**: Create a branded loading screen (using your logo) to hide the browser loading time.
    *   **App Icon**: Generate icons for all device sizes (rounded for Android, squared for iOS).
3.  **Biometric Login (Optional)**:
    *   Allow nurses to unlock their profiles using Fingerprint/FaceID for faster access.

## Phase 4: Production Polish
Fine-tuning the performance.

1.  **Deep Linking**:
    *   Allow the app to open from a WhatsApp link or a shared nurse profile.
2.  **Offline Support**:
    *   Ensure the "Material" and "Services" lists are cached so users can browse even with poor 3G/4G connections.
3.  **Performance Audit**:
    *   Compressing images and minifying JS/CSS to make the app size as small as possible (important for users with limited data plans).

## Phase 5: Deployment Strategy
1.  **Google Play Store**: Setup Developer account ($25 one-time fee).
2.  **Apple App Store**: Setup Developer account ($99/year fee).
3.  **Internal Testing**: Use Firebase App Distribution for Beta testing with real nurses in the field.

---

### 🚀 Immediate Next Steps:
*   Which phase would you like to start with? 
*   **Highly Recommended**: Start with **Phase 1** (Phone Login & RLS) as it's the foundation for security and user identity.
