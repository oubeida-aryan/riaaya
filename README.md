# Riaaya Healthcare Services App

## Mobile-Friendly Healthcare Services in Mauritania

A progressive web application providing nursing services, medical equipment, and healthcare professional connections in Mauritania.

## 🚀 Features

- **Multi-language Support**: Arabic and French
- **Mobile-First Design**: Optimized for iOS Safari and Android browsers
- **Touch-Friendly Interface**: Prevents layout movement during touch interactions
- **Progressive Web App**: Works offline and can be installed on devices
- **Real-time Services**: Nursing, medical equipment, and professional listings
- **GPS Integration**: Location-based service discovery
- **WhatsApp Integration**: Direct service booking via WhatsApp

## 🛠️ Technical Improvements (v3.0)

### Mobile Responsiveness Fixes
- **iOS Safari Compatibility**: Fixed viewport issues and touch handling
- **Android Optimization**: Improved scrolling and touch interactions
- **Touch Targets**: Minimum 44px touch targets for accessibility
- **Layout Stability**: Prevented unwanted layout shifts during touch

### Cache Busting System
- **Automatic Versioning**: Dynamic cache busting for all deployments
- **Service Worker Updates**: Automatic cache invalidation
- **Asset Optimization**: Proper caching headers for static assets

### Performance Enhancements
- **Hardware Acceleration**: GPU-accelerated animations
- **Smooth Scrolling**: Native momentum scrolling on iOS
- **Input Optimization**: Prevented zoom on input focus (iOS)

## 📱 Deployment

### Netlify Deployment
```bash
# Build and deploy
npm run build
# Deploy to Netlify (automatic cache busting included)
```

### Mobile App Development
```bash
# iOS Development
npm run ios

# Android Development
npm run android

# Sync changes to native platforms
npm run sync
```

## 🔧 Development

### Local Development
```bash
# Install dependencies
npm install

# Start local server
npm start

# Build for production
npm run build
```

### Project Structure
```
├── index.html          # Main application
├── style.css           # Mobile-optimized styles
├── app.js             # Application logic
├── build.js           # Cache busting script
├── netlify.toml       # Deployment configuration
├── capacitor.config.json # Mobile app configuration
├── www/               # Built assets for mobile apps
├── ios/               # iOS native project
├── android/           # Android native project
└── icons/             # Application icons
```

## 🌐 Browser Support

- ✅ iOS Safari 12+
- ✅ Chrome Mobile 80+
- ✅ Samsung Internet 12+
- ✅ Firefox Mobile 80+
- ✅ Edge Mobile 80+

## 📋 Cache Busting

The application includes automatic cache busting:
- **Dynamic Versioning**: Each build generates a unique version
- **Asset Invalidation**: CSS and JS files are versioned
- **Service Worker**: Automatically updates on new versions
- **Headers Configuration**: Proper caching headers for different asset types

## 🔒 Security

- Content Security Policy configured
- HTTPS enforcement in mobile apps
- Secure service worker registration
- Input sanitization and validation

## 📞 Contact

For support or inquiries:
- Phone: 44445658
- WhatsApp: Available through the app

---

**Version**: 3.0.0  
**Last Updated**: Mobile optimization and cache busting implementation
