/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'PC Wong',
  tagline: 'pcwong.net',
  favicon: 'img/ico.png',
  // Set the production url of your site here
  url: 'https://pcwong.net',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',
  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'pcwong.net', // Usually your GitHub org/user name.
  projectName: 'pcwong.net', // Usually your repo name.
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      ({
        docs: {
          path: 'moments',
          routeBasePath: 'moments',
          sidebarPath: require.resolve('./sidebars.js'),
        },    
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    ({
      colorMode: {
          defaultMode: 'light',
          disableSwitch: true,
          respectPrefersColorScheme: true,
        },
      moments: {
          sidebar: {
            hideable: true,
            autoCollapseCategories: false,
          },
      },    
      navbar: {
        title: 'PC Wong',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'momentSidebar',
            label: 'Moments',
          }
        ],
      },
    }),
    plugins: [
    [
      '@docusaurus/plugin-ideal-image',
      {
        sizes: [400, 800, 1200],
        disableInDev: false,
      },
    ],
  ],
};

module.exports = config;
