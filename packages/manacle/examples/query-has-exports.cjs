module.exports = findings => {
  const hasExports = findings?.state?.['has-exports'] ?? {}
  return Object.entries(hasExports)
    .map(([k, check]) => (check ? ` - ${k} - This file is invalid.` : ''))
    .join('\n')
}
