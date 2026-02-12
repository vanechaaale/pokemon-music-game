import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MantineProvider, localStorageColorSchemeManager} from '@mantine/core'
import '@mantine/core/styles.css'
import './index.css'
import App from './App.tsx'

const colorSchemeManager = localStorageColorSchemeManager({
  key: 'pokemon-music-quiz-color-scheme',
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider
      theme={{
        primaryColor: 'blue',
        fontFamily: 'Futura, extra-bold, sans-serif',
      }}
      colorSchemeManager={colorSchemeManager}
      defaultColorScheme='light'
    >
      <App />
    </MantineProvider>
  </StrictMode>,
)
