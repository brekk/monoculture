export default {
  '*.{js,jsx,ts,tsx}': 'eslint --fix',
  'packages/monocle/package.json': () => 'yarn workspace monocle test:snapshot',
  // run syncScripts whenever `package-scripts.cjs` / `package.json` changes
  'package*': raw => {
    // console.log(raw)
    return ['yarn', 'yarn sync:scripts', 'yarn meta:readme']
  },
  '.github/**/*.yml': raw => {
    return raw.map(z => 'action-validator ' + z)
  },
  'packages/*': `yarn care`,
  'tools/*': `yarn care`,
  'apps/*': `yarn care`,
}
