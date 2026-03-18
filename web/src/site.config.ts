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
        code: 'en-US',
        name: 'English',
      },
      id: {
        code: 'id-ID',
        name: 'Bahasa Indonesia',
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
