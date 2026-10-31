import { AnimatePresence } from 'framer-motion'
import { lazy, Suspense, useEffect, useState } from 'react'
import { useStore } from './store'
import { Toasts } from './components/ui'
import { Sting } from './components/Logo'
import Gate from './screens/Gate'
import Main from './screens/player/Main'

const Admin = lazy(() => import('./screens/admin/Admin'))

export default function App() {
  const { session } = useStore()
  const [sting, setSting] = useState(true)
  useEffect(() => { const t = setTimeout(() => setSting(false), 3400); return () => clearTimeout(t) }, [])
  const admin = session?.role === 'admin'

  return (
    <>
      {admin && !sting ? (
        <Suspense fallback={<div className="admin-loading" />}><Admin /></Suspense>
      ) : (
        <div className="stage">
          <div className="stage-bg" style={{ backgroundImage: 'url(./img/welcome-night.jpg)' }} />
          <div className="app">
            {!sting && (session?.role === 'player' ? <Main key="m" /> : <Gate key="g" />)}
            <div id="portal" />
          </div>
        </div>
      )}
      <AnimatePresence>{sting && <Sting key="s" onSkip={() => setSting(false)} />}</AnimatePresence>
      <Toasts />
      {admin && <div id="portal" />}
    </>
  )
}
