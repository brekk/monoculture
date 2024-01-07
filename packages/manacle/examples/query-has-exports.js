export default {
  name: 'has-exports',
  check: function hasExportsCheck(findings) {
    return Object.keys(findings?.state?.['has-exports'] ?? {}).length
  },
  report: function hasExportsReport(findings) {
    const has = findings?.state?.['has-exports'] ?? {}
    return Object.entries(has)
      .map(([k, check]) => (check ? ` - ${k} - This file is invalid.` : false))
      .filter(z => z)
      .join('\n')
  },
}
