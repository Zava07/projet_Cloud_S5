Android Setup (automated with postinstall)

This project includes a helper script that automates the minimal Android onboarding steps for teammates.

What it does
- Runs `npx ionic build` to build the web assets
- Adds the Android platform (`npx cap add android`) if it's not present
- Copies web assets and syncs Capacitor (`npx cap copy android` and `npx cap sync android`)
- If `android/app/google-services.json` is missing, copies `ressource/google-services.json.example` to `android/app/google-services.json` so the build won't immediately fail. *You still need to replace this example file with your project's real Firebase config from the Firebase Console.*

How to use
- Running `npm install` inside the `mobile/` folder will automatically run the postinstall script. If you prefer to run it manually, use:

  npm run setup:android

Notes and safety
- The script is idempotent: it skips `npx cap add android` when `android/` already exists.
- The script is intentionally forgiving: it logs errors but doesn't make `npm install` fail. This keeps the cloning/install experience simple for teammates.
- After setup, you can open Android Studio with:

  npx cap open android

If the Android build complains about the Firebase package name, ensure you either:
- Register `io.ionic.starter` in your Firebase project and put the real `google-services.json` under `android/app/`, or
- Replace the `applicationId` in `android/app/build.gradle` to match the package name in your `google-services.json`.

If you need help, open an issue describing the problem and include the `npx cap doctor` output and any Gradle errors.