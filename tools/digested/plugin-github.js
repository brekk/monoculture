// TODO: this is brittle, we should ensure that this is robust
const COM = 'github.com'
const TREE = 'tree/main'

export const documentationURL = z => {
  const parts = z.slice(z.indexOf(COM) + COM.length + 1, z.indexOf(TREE) - 1)
  const [org, repo] = parts.split('/')
  return `https://${org}.github.io/${repo}`
}
