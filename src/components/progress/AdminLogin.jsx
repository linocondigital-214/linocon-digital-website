import { useState } from 'react'
import { Notice } from './PrivateShell'

export default function AdminLogin({ onSubmit, wrong }) {
  const [password, setPassword] = useState('')
  return (
    <Notice title="Client progress">
      <p>Enter your admin password. This device will remember it.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit(password)
        }}
        className="flex flex-col sm:flex-row gap-3 mt-2"
      >
        <input
          type="password"
          autoComplete="current-password"
          aria-label="Admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="flex-1 h-12 rounded-xl bg-ink border border-border px-4 text-text outline-none focus:border-blue"
        />
        <button type="submit" className="h-12 px-6 rounded-full bg-gradient-brand text-ink font-bold">
          Open
        </button>
      </form>
      {wrong && <p className="text-orange">That password didn't work. Try again.</p>}
    </Notice>
  )
}
