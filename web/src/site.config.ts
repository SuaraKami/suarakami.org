export const siteConfig = {
  email: 'info@suarakami.org',
  footer: {
    copyright: 'SuaraKami. All rights reserved.',
    tagline: 'Born in Aachen, made for Indonesians everywhere.',
  },
  i18n: {
    defaultLang: 'en',
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
    showDefaultLang: false,
  },
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
} as const
