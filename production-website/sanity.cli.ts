import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'gkbg7i6n',
    dataset: 'production'
  },
  // members use this hostname, so `npx sanity deploy` must land on it rather
  // than prompting for a new one — a second studio on a different host would
  // point at the same data and quietly split where people go to edit
  studioHost: 'ovalfinancialforum',
  deployment: {
    appId: 'x5dv8locg2abqu1665udlkr5',
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
})
