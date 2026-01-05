module.exports = {
  packagerConfig: {
    asar: true,
    icon: 'public/logo'
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'trafquiz App',
        setupIcon: 'public/logo.ico',
        iconUrl: 'https://raw.githubusercontent.com/jules-mind-aramco/trafquiz/main/public/logo.ico'
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
  buildIdentifier: 'prod',
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'jules-mind-aramco',
          name: 'trafquiz',
        },
        prerelease: false,
        draft: true,
      },
    },
  ],
};