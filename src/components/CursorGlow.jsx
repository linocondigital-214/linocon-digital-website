import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

// A soft backlight behind the page. On desktop it follows the mouse; on
// phones it follows the finger while touching and drifts with the scroll
// otherwise. It sits behind every section (z-index -1, under the body's
// own background colour on the canvas), so it shows through the dark gaps
// and the see-through cards but never sits over text or blocks a tap.
//
// Kept cheap for phones: one fixed layer moved with transform from a
// requestAnimationFrame loop that stops once the glow catches up, passive
// listeners, no React re-render per move, and a radial-gradient rather than
// CSS blur().
export default function CursorGlow() {
  const reduce = useReducedMotion()
  const glowRef = useRef(null)

  useEffect(() => {
    const el = glowRef.current
    if (reduce || !el) return

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const w = () => window.innerWidth
    const h = () => window.innerHeight

    const pos = { x: w() / 2, y: h() * 0.3 }
    const target = { ...pos }
    let opacity = 0
    let targetOpacity = finePointer.matches ? 0 : 0.7
    let touching = false
    let scrollBase = window.scrollY
    let anchor = { ...pos }
    let frame = 0

    const render = () => {
      el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`
      el.style.opacity = opacity.toFixed(3)
    }

    const tick = () => {
      // Ease toward the target; the finger is followed a little tighter.
      const k = touching || finePointer.matches ? 0.18 : 0.06
      pos.x += (target.x - pos.x) * k
      pos.y += (target.y - pos.y) * k
      opacity += (targetOpacity - opacity) * 0.08
      render()
      const settled =
        Math.abs(target.x - pos.x) < 0.5 &&
        Math.abs(target.y - pos.y) < 0.5 &&
        Math.abs(targetOpacity - opacity) < 0.005
      frame = settled ? 0 : requestAnimationFrame(tick)
    }
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick)
    }

    const onPointerMove = (e) => {
      if (e.pointerType !== 'mouse') return
      target.x = e.clientX
      target.y = e.clientY
      targetOpacity = 1
      wake()
    }
    const onPointerLeave = () => {
      targetOpacity = 0
      wake()
    }

    const onTouch = (e) => {
      const t = e.touches[0]
      if (!t) return
      touching = true
      target.x = t.clientX
      target.y = t.clientY
      targetOpacity = 1
      wake()
    }
    const onTouchEnd = (e) => {
      if (e.touches.length) return
      touching = false
      targetOpacity = 0.7
      anchor = { x: target.x, y: target.y }
      scrollBase = window.scrollY
      wake()
    }
    const onScroll = () => {
      if (touching || finePointer.matches) return
      // Wander gently around where the finger last lifted as the page moves.
      const d = window.scrollY - scrollBase
      target.x = clamp(anchor.x + Math.sin(d / 260) * w() * 0.28, w() * 0.1, w() * 0.9)
      target.y = clamp(anchor.y + Math.sin(d / 410) * h() * 0.18, h() * 0.1, h() * 0.9)
      wake()
    }

    const opts = { passive: true }
    window.addEventListener('pointermove', onPointerMove, opts)
    document.documentElement.addEventListener('pointerleave', onPointerLeave, opts)
    window.addEventListener('touchstart', onTouch, opts)
    window.addEventListener('touchmove', onTouch, opts)
    window.addEventListener('touchend', onTouchEnd, opts)
    window.addEventListener('touchcancel', onTouchEnd, opts)
    window.addEventListener('scroll', onScroll, opts)
    render()
    wake()

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onPointerMove, opts)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave, opts)
      window.removeEventListener('touchstart', onTouch, opts)
      window.removeEventListener('touchmove', onTouch, opts)
      window.removeEventListener('touchend', onTouchEnd, opts)
      window.removeEventListener('touchcancel', onTouchEnd, opts)
      window.removeEventListener('scroll', onScroll, opts)
    }
  }, [reduce])

  if (reduce) return null

  return (
    <div aria-hidden="true" className="no-print pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        ref={glowRef}
        className="cursor-glow absolute top-0 left-0 rounded-full opacity-0 will-change-transform"
      />
    </div>
  )
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v))
}
