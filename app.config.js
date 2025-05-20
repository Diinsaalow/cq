export default {
  expo: {
    name: 'Diinsaalow',
    slug: 'diinsaalow',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icons/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/icons/icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.diinsaalow.app',
      infoPlist: {
        UIBackgroundModes: ['audio'],
        NSMicrophoneUsageDescription:
          'This app needs access to the microphone for audio recording.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/icons/icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.diinsaalow.app',
      permissions: [
        'RECORD_AUDIO',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
      ],
    },
    web: {
      favicon: './assets/icons/icon.png',
    },
    plugins: [
      [
        'expo-av',
        {
          microphonePermission: 'Allow Diinsaalow to access your microphone.',
        },
      ],
      [
        'expo-file-system',
        {
          filePermission: 'Allow Diinsaalow to access your files.',
        },
      ],
    ],
    extra: {
      eas: {
        projectId: 'your-project-id',
      },
    },
    // Performance optimizations
    updates: {
      fallbackToCacheTimeout: 0,
      checkAutomatically: 'ON_LOAD',
    },
    // Enable Hermes engine for better performance
    jsEngine: 'hermes',
    // Enable new architecture
    experiments: {
      tsconfigPaths: true,
    },
    // Cache configuration
    cache: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      maxSize: 50 * 1024 * 1024, // 50MB
    },
  },
};
