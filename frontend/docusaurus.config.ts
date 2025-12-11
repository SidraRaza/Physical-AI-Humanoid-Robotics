import path from 'path';
import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// Determine deployment platform via environment variables
// VERCEL is set to '1' on Vercel builds
// CI is typically set on GitHub Actions
const isVercel = process.env.VERCEL === '1';
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

const config: Config = {
  title: 'My AI Textbook',
  tagline: 'Deep Learning for Beginners',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  // Production URL - adjust based on deployment platform
  url: isVercel
    ? 'https://physical-ai-humanoid-robotics-roan.vercel.app'
    : 'https://sidraraza.github.io',

  // Base URL: '/' for Vercel (root domain), '/repo-name/' for GitHub Pages (subdirectory)
  baseUrl: isVercel ? '/' : (isGitHubPages ? '/Physical-AI-Humanoid-Robotics/' : '/'),

  // GitHub pages config
  organizationName: 'SidraRaza',
  projectName: 'Physical-AI-Humanoid-Robotics',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/SidraRaza/Physical-AI-Humanoid-Robotics/edit/main/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl:
            'https://github.com/SidraRaza/Physical-AI-Humanoid-Robotics/edit/main/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [path.resolve(__dirname, './plugins/content-loader')],
 // Add your custom plugin here

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'My AI Textbook',
      logo: {
        alt: 'My AI Textbook Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Tutorial',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {to: '/chatbot', label: 'Chatbot', position: 'left'},
        {
          href: 'https://github.com/SidraRaza/Physical-AI-Humanoid-Robotics',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'Tutorial', to: '/docs/intro'},
          ],
        },
        {
          title: 'Community',
          items: [
            {label: 'Stack Overflow', href: 'https://stackoverflow.com/questions/tagged/docusaurus'},
            {label: 'Discord', href: 'https://discordapp.com/invite/docusaurus'},
            {label: 'X', href: 'https://x.com/docusaurus'},
          ],
        },
        {
          title: 'More',
          items: [
            {label: 'Blog', to: '/blog'},
            {label: 'GitHub', href: 'https://github.com/SidraRaza/Physical-AI-Humanoid-Robotics'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} SidraRaza. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
