import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LazyMotion, domAnimation } from 'framer-motion'
import './index.css'
import App from './App.jsx'
import { startLeadTracking } from './lib/analytics'

startLeadTracking()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* LazyMotion + the `m` component (instead of `motion`) ships only the
        animation features this site uses, keeping framer-motion's weight
        out of the first download. `strict` errors if a full `motion`
        component sneaks back in. */}
    <LazyMotion features={domAnimation} strict>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </LazyMotion>
  </StrictMode>,
)
