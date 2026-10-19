import { useEffect } from 'react'
import Hero from '../components/sections/Hero'
import Benefits from '../components/sections/Benefits'
import Statement from '../components/sections/Statement'
import Services from '../components/sections/Services'
import Bundles from '../components/sections/Bundles'
import BooksStrip from '../components/sections/BooksStrip'
import Work from '../components/sections/Work'
import Included from '../components/sections/Included'
import Process from '../components/sections/Process'
import Audit from '../components/sections/Audit'
import FAQ from '../components/sections/FAQ'
import CTA from '../components/sections/CTA'

export default function Home() {
  // Links like /#audit from other pages load the homepage fresh; the section
  // isn't on the page yet when the browser looks for it, so scroll once it is.
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (id) document.getElementById(id)?.scrollIntoView()
  }, [])

  return (
    <>
      <Hero />
      <Benefits />
      <Statement />
      <Services />
      <BooksStrip />
      <Bundles />
      <Included />
      <Process />
      <Work />
      <Audit />
      <FAQ />
      <CTA />
    </>
  )
}
