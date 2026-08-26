import {defineType, defineField} from 'sanity'

/**
 * One edition of the newsletter. Feeds both the home row and /archive.
 *
 * An issue with no `publishedAt` (or nothing uploaded to read) renders as the
 * dotted "coming up soon" plate counting down to `dueMonth`. Filling in the
 * date and the HTML is what turns it into a real card — so the placeholder for
 * next month is just an issue you have not finished yet, not a separate thing.
 */
export const newsletterIssue = defineType({
  name: 'newsletterIssue',
  title: 'Newsletter issue',
  type: 'document',
  fields: [
    defineField({
      name: 'volume',
      title: 'Volume number',
      description: '1 for the June edition. Sorts the list, prints as Vol.1 and 01.',
      type: 'number',
      validation: (rule) => rule.required().integer().positive(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      description: 'The edition name, e.g. "June Edition".',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published on',
      description: 'Leave empty until the issue is out — it stays a placeholder until this is set.',
      type: 'date',
      options: {dateFormat: 'MM/DD/YYYY'},
    }),
    defineField({
      name: 'dueMonth',
      title: 'Due month',
      description: 'Shown on the placeholder plate, e.g. "July 2026".',
      type: 'string',
      // once it is out, the month it was due stops being interesting
      hidden: ({parent}) => Boolean(parent?.publishedAt),
    }),
    defineField({
      name: 'blurb',
      title: 'Blurb',
      description: 'One or two sentences, shown on the archive row.',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'cover',
      title: 'Cover image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'html',
      title: 'Issue (HTML)',
      description: 'The file the Read issue button opens. An issue is not live without it. Replace this upload to change a published edition — no site deploy needed.',
      type: 'file',
      options: {accept: 'text/html'},
    }),
    defineField({
      name: 'pdf',
      title: 'Issue (PDF)',
      description: 'The file the Download PDF button hands over. Replace this upload to swap the download.',
      type: 'file',
      options: {accept: 'application/pdf'},
    }),
  ],
  orderings: [
    {
      name: 'newest',
      title: 'Newest first',
      by: [{field: 'volume', direction: 'desc'}],
    },
  ],
  preview: {
    select: {title: 'title', volume: 'volume', date: 'publishedAt', media: 'cover'},
    prepare: ({title, volume, date}) => ({
      title: title || `Vol.${volume}`,
      subtitle: date ? `Published ${date}` : 'Not published yet',
    }),
  },
})
