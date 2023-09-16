import { ChakraProvider } from '@chakra-ui/react'
import type { AppProps } from 'next/app'

import protenusTheme from 'ui-scaffold/styles/theme'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider
      resetCSS
      theme={{
        ...protenusTheme,
        styles: {
          global: {
            body: { overflowY: 'auto' },
          },
        },
      }}
    >
      <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default MyApp
