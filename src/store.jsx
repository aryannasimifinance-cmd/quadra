import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { COURTS, PACKAGES, levelById, productById, seedClub, todayKey } from './data'

const KEY = 'quadra-v1'
const SEED_V = 6
const blankPlayer = { user: null, xp: 0, badges: [], wallet: 0, membership: null, cart: [], wish: [], notifications: [], quests: {}, events: [] }

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY))
    if (s && s.club?.v === SEED_V) return { session: null, ...blankPlayer, ...s }
  } catch { /* داده‌ی خراب یا حالت خصوصی */ }
  return { session: null, ...blankPlayer, club: seedClub() }
}

const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

export const ME = 'me'
export const weekKey = () => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 1) % 7)); return d.toISOString().slice(0, 10) }

// امتیاز رنکینگ کاربر = پایه‌ی سطح + نصف XP
export const myPoints = (s) => (s.user ? levelById(s.user.level).base + Math.floor(s.xp / 2) : 0)
export const memberOff = (s) => (s.membership && s.membership.until > Date.now() ? packageById(s.membership.id).off : 0)
const packageById = (id) => PACKAGES.find((p) => p.id === id)

// وضعیت پرداخت هر رکورد — برای پنل مدیر
export function payState(x) {
  if (x.status === 'cancelled') return x.refunded ? 'refunded' : 'void'
  if (x.paid >= x.price) return 'paid'
  return x.paid > 0 ? 'partial' : 'pending'
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(load)
  const [toasts, setToasts] = useState([])
  const toastId = useRef(0)
  const ref = useRef(state)
  ref.current = state

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* حالت خصوصی مرورگر */ }
  }, [state])

  // همگام‌سازی بین تب‌ها: مدیر و بازیکن در دو تب همزمان
  useEffect(() => {
    const on = (e) => { if (e.key === KEY && e.newValue) try { setState(JSON.parse(e.newValue)) } catch { /* نادیده */ } }
    window.addEventListener('storage', on)
    return () => window.removeEventListener('storage', on)
  }, [])

  const toast = useCallback((t) => {
    const id = ++toastId.current
    setToasts((x) => [...x, { id, ...t }])
    setTimeout(() => setToasts((x) => x.filter((y) => y.id !== id)), t.duration || 3200)
  }, [])

  const api = useMemo(() => {
    const commit = (fn) => { const next = fn(ref.current); ref.current = next; setState(next); return next }
    const club = (fn) => commit((s) => ({ ...s, club: fn(s.club) }))

    // امتیاز و نشان؛ عضویت XP را دو برابر می‌کند
    function reward(s, xp, gives) {
      const earned = new Set(s.badges), fresh = []
      gives.filter(Boolean).forEach((id) => { if (!earned.has(id)) { earned.add(id); fresh.push(id) } })
      const mult = s.membership && s.membership.until > Date.now() ? 2 : 1
      const gain = xp * mult + fresh.length * 15
      return { next: { ...s, badges: [...earned], xp: s.xp + gain }, result: { xp: gain, badges: fresh, mult } }
    }
    function pay(s, amount, method) {
      if (method === 'wallet') return { ...s, wallet: s.wallet - amount }
      return s
    }
    const myCourts = (bookings) => new Set(bookings.filter((b) => b.players?.includes(ME) && b.status !== 'cancelled').map((b) => b.court))

    return {
      loginPlayer(user) {
        commit((s) => ({
          ...s, session: { role: 'player' }, user, ...(s.user ? {} : { xp: 20, wallet: 500000 }),
          notifications: s.user ? s.notifications : [{
            id: 'welcome', at: Date.now(), read: false, icon: '👋', title: `${user.name}، به کوادرا خوش اومدید`,
            body: '۲۰ امتیاز و ۵۰۰ هزار تومان اعتبار هدیه گرفتید. اولین بازیتون رو بسازید تا نشان «اولین سرو» باز بشه.',
          }],
        }))
      },
      loginAdmin() { commit((s) => ({ ...s, session: { role: 'admin' } })) },
      logout() { commit((s) => (s.session?.role === 'admin' ? { ...s, session: null } : { ...s, ...blankPlayer, session: null })) },
      resetDemo() { try { localStorage.removeItem(KEY) } catch { /* */ } location.reload() },
      updateUser(p) { commit((s) => ({ ...s, user: { ...s.user, ...p } })) },

      // رزرو زمین یا کلاس — b شامل court,date,start,dur,type,price و ...
      book(b, method, share) {
        let out
        commit((s) => {
          const amount = share ?? b.price
          const rec = { id: 'u' + Date.now(), by: ME, status: 'ok', source: 'app', at: Date.now(), method, paid: method === 'package' || method === 'coach-pack' ? b.price : amount, ...b }
          const bookings = [...s.club.bookings, rec]
          const courts = myCourts(bookings)
          const full = rec.players.length === 4 && rec.players.every(Boolean)
          const r = reward(pay(s, amount, method), b.type === 'coach' ? 40 : b.type === 'open' ? 70 : 50, [
            'first', b.type === 'open' && 'host', b.start < 9 && 'early', b.start + b.dur > 22 && 'night',
            b.type === 'coach' && 'student', full && b.type !== 'coach' && 'squad', courts.size >= 4 && 'quad',
          ])
          out = { ...r.result, id: rec.id }
          return { ...r.next, club: { ...s.club, bookings } }
        })
        return out
      },
      joinGame(id, method, share) {
        let out
        commit((s) => {
          const b = s.club.bookings.find((x) => x.id === id)
          const players = [...b.players, ME]
          const bookings = s.club.bookings.map((x) => (x.id === id ? { ...x, players, paid: x.paid + share } : x))
          const r = reward(pay(s, share, method), 40, ['first', 'social', players.length === 4 && 'squad', myCourts(bookings).size >= 4 && 'quad'])
          out = { ...r.result, id }
          return { ...r.next, club: { ...s.club, bookings } }
        })
        return out
      },
      cancelMine(id) {
        commit((s) => {
          const b = s.club.bookings.find((x) => x.id === id)
          const mine = b.by === ME
          const share = mine ? (b.type === 'open' ? Math.round(b.price / 4) : b.paid) : Math.round(b.price / 4)
          const bookings = s.club.bookings.map((x) => x.id !== id ? x : mine
            ? { ...x, status: 'cancelled', refunded: true }
            : { ...x, players: x.players.filter((p) => p !== ME), paid: x.paid - share })
          return { ...s, wallet: s.wallet + share, club: { ...s.club, bookings } }
        })
      },
      // تکمیل بازی باز با بازیکن هم‌سطح (شبیه‌ساز مچ‌میکینگ)
      fillSpot(id, memberId) {
        commit((s) => {
          const b = s.club.bookings.find((x) => x.id === id)
          if (!b || b.players.length >= 4 || b.status === 'cancelled') return s
          const players = [...b.players, memberId]
          const bookings = s.club.bookings.map((x) => (x.id === id ? { ...x, players, paid: x.paid + Math.round(x.price / 4) } : x))
          const r = reward(s, 5, [players.length === 4 && 'squad'])
          return { ...r.next, club: { ...s.club, bookings } }
        })
      },
      registerEvent(ev, method) {
        let out
        commit((s) => {
          const sale = { id: 'S-' + Date.now(), kind: 'event', item: ev.id, name: ev.title, by: ME, price: ev.fee, method, at: Date.now() }
          const r = reward(pay(s, ev.fee, method), 80, ['champ'])
          out = r.result
          return { ...r.next, events: [...s.events, ev.id], club: { ...s.club, sales: [sale, ...s.club.sales] } }
        })
        return out
      },
      // پکیج چندجلسه‌ای: همه‌ی جلسه‌ها همین حالا در تقویم رزرو می‌شوند و یک فروش ثبت می‌شود
      bookSeries(list, sale, method) {
        let out
        commit((s) => {
          const sid = 'P' + Date.now()
          // بررسی دوباره‌ی آزاد بودن، تا اگر بین برنامه‌ریزی و پرداخت پر شده باشد رزرو تکراری ثبت نشود
          const clash = list.find((x) => !isFree(s.club, x.date, x.court, x.start, x.dur) ||
            (x.coach && s.club.bookings.some((b) => b.coach === x.coach && b.date === x.date && b.status !== 'cancelled' && x.start < b.start + b.dur && b.start < x.start + x.dur)))
          if (clash) { out = { error: clash }; return s }
          const recs = list.map((x, k) => ({ id: `${sid}-${k}`, by: ME, status: 'ok', source: 'app', at: Date.now(), method: 'package', series: sid, levels: null, ...x, paid: x.price }))
          const bookings = [...s.club.bookings, ...recs]
          const saleRec = { id: 'S-' + Date.now(), kind: sale.kind, item: sale.item, pack: sale.pack, name: sale.name, by: ME, price: sale.total, method, at: Date.now() }
          const r = reward(pay(s, sale.total, method), 40 + list.length * 15, [
            'first', 'loyal', sale.kind === 'coach' && 'student', list.some((x) => x.start < 9) && 'early',
            list.some((x) => x.start + x.dur > 22) && 'night', myCourts(bookings).size >= 4 && 'quad',
          ])
          out = { ...r.result, count: recs.length, series: sid }
          return { ...r.next, club: { ...s.club, bookings, sales: [saleRec, ...s.club.sales] } }
        })
        return out
      },
      buyPackage(p, method) {
        let out
        commit((s) => {
          const sale = { id: 'S-' + Date.now(), kind: 'package', item: p.id, name: p.name, by: ME, price: p.price, method, at: Date.now() }
          const base = pay(s, p.price, method)
          const withPkg = { ...base, membership: { id: p.id, until: Date.now() + p.days * 864e5 } }
          const r = reward(withPkg, 60, ['loyal'])
          out = r.result
          return { ...r.next, club: { ...s.club, sales: [sale, ...s.club.sales] } }
        })
        return out
      },
      topUp(n) { commit((s) => ({ ...s, wallet: s.wallet + n })) },

      // سبد خرید
      addToCart(item) {
        commit((s) => {
          const k = s.cart.findIndex((x) => x.pid === item.pid && x.size === item.size && x.color === item.color)
          const cart = k < 0 ? [...s.cart, item] : s.cart.map((x, i) => (i === k ? { ...x, qty: x.qty + item.qty } : x))
          return { ...s, cart }
        })
      },
      setQty(i, qty) { commit((s) => ({ ...s, cart: qty <= 0 ? s.cart.filter((_, k) => k !== i) : s.cart.map((x, k) => (k === i ? { ...x, qty } : x)) })) },
      toggleWish(pid) { commit((s) => ({ ...s, wish: s.wish.includes(pid) ? s.wish.filter((x) => x !== pid) : [...s.wish, pid] })) },
      checkout(method) {
        let out
        commit((s) => {
          const items = s.cart.map((x) => ({ ...x, price: productById(x.pid).price }))
          const total = items.reduce((a, x) => a + x.qty * x.price, 0)
          const order = { id: 'Q-' + String(Date.now()).slice(-5), by: ME, items, total, method, status: 'new', at: Date.now() }
          const stock = { ...s.club.stock }
          items.forEach((x) => { stock[x.pid] = Math.max(0, stock[x.pid] - x.qty) })
          const r = reward(pay({ ...s, cart: [] }, total, method), Math.max(10, Math.round(total / 200000)), ['shopper'])
          out = { ...r.result, order }
          return { ...r.next, club: { ...s.club, orders: [order, ...s.club.orders], stock } }
        })
        return out
      },
      claimQuest(id, xp) {
        let out
        commit((s) => {
          const wk = weekKey()
          const r = reward({ ...s, quests: { ...s.quests, [wk]: [...(s.quests[wk] || []), id] } }, xp, [])
          out = r.result
          return r.next
        })
        return out
      },

      notify(n) { commit((s) => ({ ...s, notifications: [{ id: 'n' + Date.now() + Math.random(), at: Date.now(), read: false, ...n }, ...s.notifications].slice(0, 60) })) },
      readAll() { commit((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) })) },

      // ---------- مدیر ----------
      adminAddBooking(b) { club((c) => ({ ...c, bookings: [...c.bookings, { id: 'd' + Date.now(), status: 'ok', source: 'desk', at: Date.now(), ...b }] })) },
      adminSettle(id, method) { club((c) => ({ ...c, bookings: c.bookings.map((b) => (b.id === id ? { ...b, paid: b.price, method } : b)) })) },
      adminCancel(id, refund) { club((c) => ({ ...c, bookings: c.bookings.map((b) => (b.id === id ? { ...b, status: 'cancelled', refunded: refund && b.paid > 0 } : b)) })) },
      adminMove(id, patch) { club((c) => ({ ...c, bookings: c.bookings.map((b) => (b.id === id ? { ...b, ...patch } : b)) })) },
      adminOrder(id, status) { club((c) => ({ ...c, orders: c.orders.map((o) => (o.id === id ? { ...o, status } : o)) })) },
      adminStock(pid, n) { club((c) => ({ ...c, stock: { ...c.stock, [pid]: Math.max(0, n) } })) },
      adminPricing(p) { club((c) => ({ ...c, pricing: { ...c.pricing, ...p } })) },
      adminCourt(id, off) { club((c) => ({ ...c, off: { ...c.off, [id]: off } })) },
      adminExpense(e) { club((c) => ({ ...c, expenses: [{ id: 'e' + Date.now(), at: Date.now(), ...e }, ...c.expenses] })) },
      toast,
    }
  }, [toast])

  return <Ctx.Provider value={{ ...state, ...api, toasts }}>{children}</Ctx.Provider>
}

// ---------- انتخاب‌گرهای مشترک ----------
export function busyOn(club, date, court) {
  return club.bookings.filter((b) => b.date === date && b.court === court && b.status !== 'cancelled')
}
export function isFree(club, date, court, start, dur) {
  if (club.off[court]) return false
  return !busyOn(club, date, court).some((b) => start < b.start + b.dur && b.start < start + dur)
}
export function freeStarts(club, date, court, dur, from = 7, to = 24) {
  const now = new Date(), today = date === todayKey()
  const out = []
  for (let h = Math.max(7, from); h + dur <= 24 && h < to; h += 1) {
    if (today && h <= now.getHours() + now.getMinutes() / 60) continue
    if (isFree(club, date, court, h, dur)) out.push(h)
  }
  return out
}
export const courtsList = COURTS
