import { ChakraProvider } from '@chakra-ui/react'
import type { AppProps } from 'next/app'

import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faUserDoctor,
  faDropletSlash,
  faCloudBolt,
  faFolderTree,
  faBriefcase,
  faMitten,
  faSplotch,
  faTrainTram,
  faCookieBite,
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faUserDoctor,
  faDropletSlash,
  faCloudBolt,
  faFolderTree,
  faBriefcase,
  faMitten,
  faSplotch,
  faTrainTram,
  faCookieBite
)

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider resetCSS>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default MyApp
