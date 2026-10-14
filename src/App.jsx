import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Nav from './components/Nav'
import CursorGlow from './components/CursorGlow'
import Footer from './components/sections/Footer'
import Home from './pages/Home'

const BookCall = lazy(() => import('./pages/BookCall'))
const Articles = lazy(() => import('./pages/Articles'))
const Article = lazy(() => import('./pages/Article'))
const Service = lazy(() => import('./pages/Service'))
const ProcessStep = lazy(() => import('./pages/ProcessStep'))
const ClientProgress = lazy(() => import('./pages/ClientProgress'))
const Clients = lazy(() => import('./pages/Clients'))
const ClientEdit = lazy(() => import('./pages/ClientEdit'))

// Client progress pages are private: no site menu or footer.
const isPrivatePath = (path) => /^\/(progress|clients)(\/|$)/.test(path)

function App() {
  const { pathname } = useLocation()
  const isPrivate = isPrivatePath(pathname)

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
