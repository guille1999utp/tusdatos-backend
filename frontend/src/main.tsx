import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { store } from './redux/store.ts'
import { Provider } from 'react-redux'
import App from './App.tsx'

import './index.css'
import { ThemeProvider } from './components/theme-provider.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
