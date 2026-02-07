const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const androidAppPath = path.join(root, 'android', 'app');
const exampleJson = path.join(root, 'ressource', 'google-services.json.example');
const targetJson = path.join(androidAppPath, 'google-services.json');

function run(cmd, opts = {}) {
  return new Promise((resolve, reject) => {
    console.log('> ', cmd);
    const p = exec(cmd, Object.assign({ cwd: root, maxBuffer: 1024 * 1024 * 10, shell: true }, opts), (err, stdout, stderr) => {
      if (err) {
        console.error(`Command failed: ${cmd}`);
        console.error(stderr || stdout);
        // resolve rather than reject to avoid failing entire npm install
        return resolve({ success: false, err, stdout, stderr });
      }
      resolve({ success: true, stdout, stderr });
    });
    p.stdout && p.stdout.pipe(process.stdout);
    p.stderr && p.stderr.pipe(process.stderr);
  });
}

(async () => {
  try {
    // 1) Build web part
    await run('npx ionic build');

    // 2) Add android if missing
    const androidExists = fs.existsSync(path.join(root, 'android'));
    if (!androidExists) {
      console.log('Android platform not found. Adding android platform...');
      await run('npx cap add android');
    } else {
      console.log('Android platform exists. Skipping add.');
    }

    // 3) Copy assets and sync
    await run('npx cap copy android');
    await run('npx cap sync android');

    // 4) Copy example google-services.json if target missing and example exists
    if (!fs.existsSync(targetJson)) {
      if (fs.existsSync(exampleJson)) {
        try {
          // ensure android/app exists
          fs.mkdirSync(androidAppPath, { recursive: true });
          fs.copyFileSync(exampleJson, targetJson);
          console.log(`Copied ${path.relative(root, exampleJson)} -> android/app/google-services.json`);
          console.log('Reminder: Replace the example file with a real google-services.json from Firebase Console.');
        } catch (err) {
          console.warn('Failed to copy example google-services.json:', err.message);
        }
      } else {
        console.log('No google-services.json.example found. Skipping copy.');
      }
    } else {
      console.log('android/app/google-services.json already exists. Skipping copy.');
    }

    // Try to open Android Studio (works if Android Studio is installed)
    const openRes = await run('npx cap open android');
    if (!openRes.success) {
      console.log('Could not open Android Studio automatically. Run `npx cap open android` manually if needed.');
    }

    console.log('\nAndroid setup finished (postinstall).');
  } catch (e) {
    console.error('postinstall script failed (continuing):', e);
  }
})();