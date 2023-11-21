export const GITPARTY_CONFIG_NEEDED = c =>
  `Unable to find a .gitpartyrc file! You can create one with \`${c.yellow(
    'gitparty --init'
  )}\``

export const THIS_IS_NOT_A_GIT_REPO = c =>
  `gitparty only works in git repositories! Did you mean to \`${c.yellow(
    'git init'
  )}\` first?`

export const CONFIG_NOT_VALID = `gitparty cannot understand your .gitpartyrc file! Please edit it`
