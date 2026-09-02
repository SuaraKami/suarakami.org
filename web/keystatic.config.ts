// oxlint-disable sort-keys
import { collection, config, fields, singleton } from '@keystatic/core'

const linkFields = {
  label: fields.text({ label: 'Label' }),
  to: fields.text({ label: 'URL' }),
  target: fields.select({
    defaultValue: '_blank',
    label: 'Target',
    options: [
      { label: 'New tab', value: '_blank' },
      { label: 'Same tab', value: '_self' },
    ],
  }),
}

function eventCollection(label: string, language: 'en' | 'id') {
  return collection({
    format: { contentField: 'content' },
    label,
    path: `src/content/${language}/events/*`,
    schema: {
      title: fields.slug({ name: { label: 'Title' } }),
      description: fields.text({ label: 'Description', multiline: true }),
      dates: fields.array(
        fields.datetime({ label: 'Date', validation: { isRequired: true } }),
        {
          itemLabel: ({ value }) => value ?? 'Date',
          label: 'Dates',
          validation: { length: { max: 2, min: 1 } },
        }
      ),
      location: fields.text({ label: 'Location' }),
      link: fields.object(linkFields, { label: 'Link' }),
      content: fields.markdoc({
        extension: 'md',
        label: 'Content',
        options: {
          blockquote: true,
          bold: true,
          code: true,
          codeBlock: false,
          heading: [2, 3, 4],
          image: false,
          italic: true,
          link: true,
          orderedList: true,
          strikethrough: false,
          table: false,
          unorderedList: true,
        },
      }),
    },
    slugField: 'title',
  })
}

function landingPage(label: string, language: 'en' | 'id') {
  return singleton({
    format: { data: 'yaml' },
    label,
    path: `src/content/${language}/index`,
    schema: {
      title: fields.text({ label: 'Page title' }),
      description: fields.text({ label: 'Meta description', multiline: true }),
      hero: fields.object(
        {
          title: fields.text({ label: 'Title' }),
          description: fields.text({ label: 'Description', multiline: true }),
          date: fields.datetime({ label: 'Date' }),
          location: fields.text({ label: 'Location' }),
          link: fields.object(linkFields, { label: 'Link' }),
        },
        { label: 'Hero' }
      ),
      promotedEvent: fields.relationship({
        collection: language === 'en' ? 'eventsEn' : 'eventsId',
        description: 'Show this event in the hero instead of the organization introduction',
        label: 'Promoted event',
      }),
      about: fields.text({ label: 'About', multiline: true }),
    },
  })
}

export default config({
  collections: {
    eventsEn: eventCollection('Events (English)', 'en'),
    eventsId: eventCollection('Events (Indonesian)', 'id'),
  },
  singletons: {
    landingEn: landingPage('Landing page (English)', 'en'),
    landingId: landingPage('Landing page (Indonesian)', 'id'),
  },
  storage:
    process.env.NODE_ENV === 'production'
      ? { kind: 'github', pathPrefix: 'web', repo: 'SuaraKami/suarakami.org' }
      : { kind: 'local', pathPrefix: 'web' },
  ui: {
    navigation: {
      Events: ['eventsEn', 'eventsId'],
      Pages: ['landingEn', 'landingId'],
    },
  },
})
