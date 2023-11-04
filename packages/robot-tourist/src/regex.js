export const makeRegexFromArray = x =>
  new RegExp(`\\b${x.join('\\b|\\b')}\\b`, 'g')
