export default {
  '*.{js,jsx,ts,tsx}': 'eslint --fix',
  // run syncScripts whenever `package-scripts.cjs` / `package.json` changes
  'package*': raw => {
    // console.log(raw)
    return ['yarn sync:scripts', 'yarn meta:readme']
  },
  '.github/workflows/*': 'action-validator',
  'packages/*': `yarn care`,
  'tools/*': `yarn care`,
  'apps/*': `yarn care`,
}
