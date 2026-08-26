import {defineType, defineField} from 'sanity'

/**
 * A member of the forum, shown on the home grid and on /team.
 * `order` sorts the grid; leave gaps (10, 20, 30…) so somebody can be slotted
 * between two people without renumbering everyone.
 */
export const teamMember = defineType({
  name: 'teamMember',
  title: 'Team member',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Full name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      description: 'Their position, e.g. "VP, Marketing".',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'photo',
      title: 'Portrait',
      type: 'image',
      description: 'Square works best. If it is not square, drag the crop circle onto the face.',
      // hotspot gives the member a crop control in the Studio, so a tall photo
      // no longer needs a hand-written crop hint in the site's code
      options: {hotspot: true},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      description: 'A few sentences — what they study, then what they do outside the forum.',
      type: 'text',
      rows: 5,
    }),
    defineField({
      name: 'linkedin',
      title: 'LinkedIn',
      description: 'Profile URL. Shown as an icon on /team.',
      type: 'url',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      description: 'Shown as a mail icon on /team. Usually an @osu.edu address.',
      type: 'string',
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: 'order',
      title: 'Display order',
      description: 'Lower numbers come first. Use 10, 20, 30… to leave gaps.',
      type: 'number',
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [
    {
      name: 'displayOrder',
      title: 'Display order',
      by: [{field: 'order', direction: 'asc'}],
    },
  ],
  preview: {
    select: {title: 'name', subtitle: 'role', media: 'photo'},
  },
})
