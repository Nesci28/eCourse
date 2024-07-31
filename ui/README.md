### Add resources
npx capacitor-assets generate

### Test on iOS Simulator
npx cap run ios

### Build for ios
npx capacitor-assets generate && npm run build && npx cap sync && npx cap build ios