import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { MEMBERS, courtById, dayLabel, fa, hourLabel } from '../../data'
import { openGames } from '../../select'
import { chime, haptic, systemNotify } from '../../fx'
import { ME, useStore } from '../../store'
import { Icon } from '../../components/ui'
import Home from './Home'
import Games from './Games'
import Shop from './Shop'
import Me from './Me'
import { Coaches, Events, Notifications, Packages, Ranking } from './Pages'
import Wizard from '../wizard/Wizard'

const TABS = [
  { id: 'home', name: 'خانه', icon: 'home' },
  { id: 'games', name: 'بازی‌ها', icon: 'cal' },
  { id: 'new', name: '', icon: 'plus' },
  { id: 'shop', name: 'فروشگاه', icon: 'bag' },
  { id: 'me', name: 'من', icon: 'user' },
]
const PAGES = { coaches: Coaches, packages: Packages, ranking: Ranking, events: Events, notifs: Notifications }

export default function Main() {
  const { cart } = useStore()
  const [tab, setTab] = useState('home')
  const [page, setPage] = useState(null)
  const [wizard, setWizard] = useState(null)
  const scrollRef = useRef(null)
  const cartN = cart.reduce((s, x) => s + x.qty, 0)
  useMatchmaking(setTab)

  const nav = {
    tab: (t) => { setPage(null); setWizard(null); haptic(6); setTab(t); scrollRef.current?.scrollTo({ top: 0 }) },
    open: (name, props = {}) => { haptic(6); setPage({ name, props }); scrollRef.current?.scrollTo({ top: 0 }) },
    start: (preset = {}) => { setPage(null); setWizard(preset); scrollRef.current?.scrollTo({ top: 0 }) },
  }
  const Page = page && PAGES[page.name]

  return (
    <motion.div className="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="app-scroll" ref={scrollRef}>
        <AnimatePresence mode="wait">
          {wizard ? (
            <motion.div key="wz" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 32 }}>
              <Wizard preset={wizard} onClose={() => setWizard(null)} onDone={(t) => { setWizard(null); setTab(t) }} />
            </motion.div>
          ) : Page ? (
            <motion.div key={'p' + page.name} initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} transition={{ type: 'spring', stiffness: 320, damping: 32 }}>
              <Page {...page.props} nav={nav} onBack={() => setPage(null)} />
            </motion.div>
          ) : (
            <motion.div key={tab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
              {tab === 'home' && <Home nav={nav} />}
              {tab === 'games' && <Games nav={nav} />}
              {tab === 'shop' && <Shop nav={nav} />}
              {tab === 'me' && <Me nav={nav} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {!wizard && (
          <motion.nav className="nav" initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
            {TABS.map((t) => t.id === 'new' ? (
              <motion.button key={t.id} className="fab" whileTap={{ scale: 0.85, rotate: 90 }} whileHover={{ scale: 1.06 }} onClick={() => nav.start({})} aria-label="بازی جدید">
                <Icon name="plus" size={28} stroke={2.6} />
              </motion.button>
            ) : (
              <button key={t.id} className={`nav-i ${tab === t.id && !page ? 'on' : ''}`} onClick={() => nav.tab(t.id)}>
                {tab === t.id && !page && <motion.span layoutId="nav-pill" className="nav-pill" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
                <span className="nav-ic">
                  <Icon name={t.icon} size={22} />
                  {t.id === 'shop' && cartN > 0 && <motion.i key={cartN} className="nav-badge" initial={{ scale: 0 }} animate={{ scale: 1 }}>{fa(cartN)}</motion.i>}
                </span>
                <small>{t.name}</small>
              </button>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// شبیه‌ساز مچ‌میکینگ: بازیکن‌های هم‌سطح برای جاهای خالی بازی‌های باز کاربر درخواست می‌دهند
function useMatchmaking(setTab) {
  const store = useStore()
  const live = useRef(store); live.current = store
  const asked = useRef(new Set())

  useEffect(() => {
    const t = setInterval(() => {
      const { club, toast, notify, fillSpot } = live.current
      const mine = club.bookings.filter((b) => b.by === ME && b.type === 'open' && b.status === 'ok' && b.players.length < 4 && !asked.current.has(b.id + b.players.length))
      if (!mine.length || Math.random() < 0.3) return
      const b = mine[0]
      asked.current.add(b.id + b.players.length)
      const pool = MEMBERS.filter((m) => b.levels.includes(m.level) && !b.players.includes(m.id))
      const m = pool[Math.floor(Math.random() * pool.length)] || MEMBERS[0]
      const body = `${m.name} (سطح ${m.level} · ${fa(m.games)} بازی) می‌خواد به بازی ${dayLabel(b.date)} ساعت ${hourLabel(b.start)} در ${courtById(b.court).name} بپیونده.`
      chime('alarm'); haptic([60, 40, 60])
      systemNotify('کوادرا · درخواست پیوستن', body)
      notify({ icon: '🙋', title: 'درخواست پیوستن', body })
      toast({ icon: '🙋', title: `${m.name.split(' ')[0]} می‌خواد بازی کنه`, body: `سطح ${m.level} · ${courtById(b.court).name}`, duration: 6500,
        action: { label: 'قبول', run: () => { fillSpot(b.id, m.id); chime('success'); toast({ icon: '🧩', title: 'یار جدید اضافه شد', body: `${fa(4 - b.players.length - 1)} جای خالی مونده` }) } } })
    }, 10000)
    return () => clearInterval(t)
  }, [])

  // یک بار در هر نشست: اعلان بازی باز هم‌سطح
  useEffect(() => {
    const t = setTimeout(() => {
      const { user, club, toast } = live.current
      const g = openGames(club, user.level).find((b) => !b.mine && b.gap <= 1)
      if (!g) return
      chime('alarm'); haptic([40, 30, 40])
      toast({ icon: '📣', title: 'بازی هم‌سطح شما پیدا شد', body: `${dayLabel(g.date)} ${hourLabel(g.start)} · ${fa(4 - g.players.length)} جای خالی`, duration: 6000, action: { label: 'ببینید', run: () => setTab('games') } })
    }, 15000)
    return () => clearTimeout(t)
  }, [])
}
