import { COURTS, PACKAGES, fromKey, levelIndex, todayKey } from './data'
import { ME, freeStarts, weekKey } from './store'

const nowH = () => { const n = new Date(); return n.getHours() + n.getMinutes() / 60 }
export const startsAt = (b) => fromKey(b.date).getTime() + b.start * 36e5
export const isUpcoming = (b) => startsAt(b) + b.dur * 36e5 > Date.now()
export const sortByTime = (a, b) => startsAt(a) - startsAt(b)

// بازی‌های باز آینده که جای خالی دارند — با فاصله‌ی سطح از کاربر
export function openGames(club, level, { date } = {}) {
  const ul = levelIndex(level)
  return club.bookings
    .filter((b) => b.type === 'open' && b.status === 'ok' && b.players.length < 4 && isUpcoming(b) && (!date || b.date === date))
    .map((b) => ({ ...b, gap: Math.min(...b.levels.map((l) => Math.abs(levelIndex(l) - ul))), mine: b.players.includes(ME) }))
    .sort((a, b) => a.gap - b.gap || sortByTime(a, b))
}

export function myBookings(club) {
  return club.bookings.filter((b) => (b.by === ME || b.players?.includes(ME)) && b.status === 'ok').sort(sortByTime)
}

// وضعیت لحظه‌ای هر زمین امروز
export function courtsNow(club) {
  const k = todayKey(), h = nowH()
  return COURTS.map((c) => {
    const list = club.bookings.filter((b) => b.date === k && b.court === c.id && b.status === 'ok')
    const cur = list.find((b) => b.start <= h && h < b.start + b.dur)
    const next = freeStarts(club, k, c.id, 1.5)
    return { ...c, off: !!club.off[c.id], busy: !!cur, cur, nextFree: next[0], freeCount: next.length }
  })
}

export function quests(s) {
  const wk = weekKey()
  const from = fromKey(wk.split('-').map(Number).join('-')).getTime()
  const mine = s.club.bookings.filter((b) => (b.by === ME || b.players?.includes(ME)) && b.status === 'ok' && b.at >= from)
  const orders = s.club.orders.filter((o) => o.by === ME && o.at >= from)
  const done = s.quests[wk] || []
  return [
    { id: 'play2', icon: '🎾', name: 'این هفته ۲ بازی کن', goal: 2, have: mine.length, xp: 60 },
    { id: 'social', icon: '🤝', name: 'یه بازی باز بساز یا بهش بپیوند', goal: 1, have: mine.filter((b) => b.type === 'open').length, xp: 40 },
    { id: 'shop', icon: '🛍', name: 'یه خرید از فروشگاه', goal: 1, have: orders.length, xp: 30 },
  ].map((q) => ({ ...q, ready: q.have >= q.goal && !done.includes(q.id), claimed: done.includes(q.id) }))
}

// تعداد هفته‌های پشت‌سرهم با حداقل یک بازی
export function streak(s) {
  const mine = s.club.bookings.filter((b) => (b.by === ME || b.players?.includes(ME)) && b.status === 'ok')
  if (!mine.length) return 0
  const weeks = new Set(mine.map((b) => Math.floor((b.at - 3 * 864e5) / (7 * 864e5))))
  let n = 0, w = Math.floor((Date.now() - 3 * 864e5) / (7 * 864e5))
  while (weeks.has(w)) { n++; w-- }
  return n
}

export const activeMembership = (s) => (s.membership && s.membership.until > Date.now() ? PACKAGES.find((p) => p.id === s.membership.id) : null)
