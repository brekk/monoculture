import binaryPath from 'project-bin-path'
import utils from 'nps-utils'
import { $ } from 'execa'

export const all = Promise.all

export const sd = (script, description = '') =>
  !!description ? { script, description } : { script }

const main = {
  ...utils,
  $,
  all,
  sd,
  binaryPath,
}

export default main
