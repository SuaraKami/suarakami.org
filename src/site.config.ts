export const siteConfig = {
  title: 'SuaraKami',
  description:
    'SuaraKami is a platform dedicated to amplifying Indonesian voices worldwide through storytelling, community engagement, and cultural exchange.',
  i18n: {
    languages: {
      en: {
        name: 'English',
        code: 'en-US',
      },
      id: {
        name: 'Bahasa Indonesia',
        code: 'id-ID',
      },
    },
    defaultLang: 'en',
    showDefaultLang: false,
  },
  footer: {
    copyright: `SuaraKami. All rights reserved.`,
    tagline: 'Born in Aachen, made for Indonesians everywhere.',
  },
  email: 'info@suarakami.id',
  socialMediaLinks: [
    {
      label: 'Instagram',
      to: 'https://instagram.com/suarakami',
    },
    {
      label: 'LinkedIn',
      to: 'https://www.linkedin.com/company/suarakami',
    },
    {
      label: 'Twitter',
      to: 'https://x.com/suarakamiapp',
    },
  ],
  navigation: [
    {
      code: 'about',
      to: '#about',
    },
    {
      code: 'events',
      to: '#events',
    },
    {
      code: 'contacts',
      to: '#contacts',
    },
  ],
} as const
