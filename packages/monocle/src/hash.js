import crypto from 'node:crypto'

export const hash = buf => {
  const sum = crypto.createHash('sha256')
  sum.update(buf)
  return sum.digest('hex')
}
