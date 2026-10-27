import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom'
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
const BooksDemo = lazy(() => import('./pages/BooksDemo'))
const Refer = lazy(() => import('./pages/Refer'))
const Switch = lazy(() => import('./pages/Switch'))
const Card = lazy(() => import('./pages/Card'))
const Portal = lazy(() => import('./pages/Portal'))
const Admin = lazy(() => import('./pages/Admin'))
const ClientEdit = lazy(() => import('./pages/ClientEdit'))
const ClientPreview = lazy(() => import('./pages/ClientEdit').then((m) => ({ default: m.ClientPreview })))
const Finance = lazy(() => import('./pages/Finance'))
const ClientDocEdit = lazy(() => import('./pages/ClientDoc').then((m) => ({ default: m.ClientDocEdit })))
const ClientDocView = lazy(() => import('./pages/ClientDoc').then((m) => ({ default: m.ClientDocView })))

// Client progress, admin and finance pages are private: no site menu or footer.
// The Books demo and the digital business card are full screen, so they skip them too.
const isPrivatePath = (path) => /^\/(progress|clients|admin|finance|books\/demo|card)(\/|$)/.test(path)

// /clients/<package|proposal|agreement> is the signed-in client's document. Lino's old
// editor links (/clients/<client id>/...) now live under /admin.
function ClientsSub() {
  const { sub, doc } = useParams()
  if (!doc && ['package', 'proposal', 'agreement'].includes(sub)) {
    return (
      <Suspense fallback={null}>
        <ClientDocView doc={sub} />
      </Suspense>
    )
  }
  return <Navigate to={`/admin/${sub}${doc ? `/${doc}` : ''}`} replace />
}

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
            path="/books/demo"
            element={
              <Suspense fallback={null}>
                <BooksDemo />
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
            path="/switch"
            element={
              <Suspense fallback={null}>
                <Switch />
              </Suspense>
            }
          />
          <Route
            path="/card"
            element={
              <Suspense fallback={null}>
                <Card />
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
          {/* Old private links: clients now sign in at /clients. */}
          <Route path="/progress/*" element={<Navigate to="/clients" replace />} />
          <Route
            path="/clients"
            element={
              <Suspense fallback={null}>
                <Portal />
              </Suspense>
            }
          />
          <Route path="/clients/:sub/:doc?" element={<ClientsSub />} />
          <Route
            path="/admin"
            element={
              <Suspense fallback={null}>
                <Admin />
              </Suspense>
            }
          />
          <Route
            path="/admin/:id"
            element={
              <Suspense fallback={null}>
                <ClientEdit />
              </Suspense>
            }
          />
          <Route
            path="/admin/:id/preview"
            element={
              <Suspense fallback={null}>
                <ClientPreview />
              </Suspense>
            }
          />
          <Route
            path="/admin/:id/:doc"
            element={
              <Suspense fallback={null}>
                <ClientDocEdit />
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
