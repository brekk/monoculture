import { configurate } from 'climate'
import { DEFAULT_CONFIG, CONFIG, HELP_CONFIG } from './config'
import PKG from '../package.json'

export const parser = configurate(CONFIG, DEFAULT_CONFIG, HELP_CONFIG, {
  name: PKG.name,
  description: PKG.description,
})
