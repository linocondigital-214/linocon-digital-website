import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Nav from './components/Nav'
import CursorGlow from './components/CursorGlow'
import Footer from './components/sections/Footer'
import Home from './pages/Home'
import useCanonical from './lib/useCanonical'

const BookCall = lazy(() => import('./pages/BookCall'))
const Articles = lazy(() => import('./pages/Articles'))
const Article = lazy(() => import('./pages/Article'))
const Service = lazy(() => import('./pages/Service'))
const ProcessStep = lazy(() => import('./pages/ProcessStep'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Disclaimer = lazy(() => import('./pages/Disclaimer'))
const Pay = lazy(() => import('./pages/Pay'))
const Books = lazy(() => import('./pages/Books'))
const Refer = lazy(() => import('./pages/Refer'))
const ClientProgress = lazy(() => import('./pages/ClientProgress'))
const Clients = lazy(() => import('./pages/Clients'))
const ClientEdit = lazy(() => import('./pages/ClientEdit'))
const Finance = lazy(() => import('./pages/Finance'))
const ClientDocEdit = lazy(() => import('./pages/ClientDoc').then((m) => ({ default: m.ClientDocEdit })))
const ClientDocView = lazy(() => import('./pages/ClientDoc').then((m) => ({ default: m.ClientDocView })))

// Client progress and finance pages are private: no site menu or footer.
const isPrivatePath = (path) => /^\/(progress|clients|finance)(\/|$)/.test(path)

function App() {
  const { pathname } = useLocation()
  const isPrivate = isPrivatePath(pathname)
  useCanonical(pathname)

  return (
    <>
      <CursorGlow />
      {!isPrivate && <Nav />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/book"
            element={
              <Suspense fallback={null}>
                <BookCall />
              </Suspense>
            }
          />
          <Route
            path="/services/:slug"
            element={
              <Suspense fallback={null}>
                <Service />
              </Suspense>
            }
          />
          <Route
            path="/process/:slug"
            element={
              <Suspense fallback={null}>
                <ProcessStep />
              </Suspense>
            }
          />
          <Route
            path="/articles"
            element={
              <Suspense fallback={null}>
                <Articles />
              </Suspense>
            }
          />
          <Route
            path="/privacy"
            element={
              <Suspense fallback={null}>
                <Privacy />
              </Suspense>
            }
          />
          <Route
            path="/disclaimer"
            element={
              <Suspense fallback={null}>
                <Disclaimer />
              </Suspense>
            }
          />
          <Route
            path="/books"
            element={
              <Suspense fallback={null}>
                <Books />
              </Suspense>
            }
          />
          <Route
            path="/refer"
            element={
              <Suspense fallback={null}>
                <Refer />
              </Suspense>
            }
          />
          <Route
            path="/pay"
            element={
              <Suspense fallback={null}>
                <Pay />
              </Suspense>
            }
          />
          <Route
            path="/progress/:id"
            element={
              <Suspense fallback={null}>
                <ClientProgress />
              </Suspense>
            }
          />
          <Route
            path="/clients"
            element={
              <Suspense fallback={null}>
                <Clients />
              </Suspense>
            }
          />
          <Route
            path="/clients/:id"
            element={
              <Suspense fallback={null}>
                <ClientEdit />
              </Suspense>
            }
          />
          <Route
            path="/clients/:id/:doc"
            element={
              <Suspense fallback={null}>
                <ClientDocEdit />
              </Suspense>
            }
          />
          <Route
            path="/progress/:id/:doc"
            element={
              <Suspense fallback={null}>
                <ClientDocView />
              </Suspense>
            }
          />
          <Route
            path="/finance/:section?"
            element={
              <Suspense fallback={null}>
                <Finance />
              </Suspense>
            }
          />
          <Route
            path="/articles/:slug"
            element={
              <Suspense fallback={null}>
                <Article />
              </Suspense>
            }
          />
        </Routes>
      </main>
      {!isPrivate && <Footer />}
    </>
  )
}

export default App
