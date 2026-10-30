import { motion } from 'framer-motion'
import { useState } from 'react'
import { BADGES, COACHES, CREDITS, RANKS, fa, levelById, productById, rankOf, toman } from '../../data'
import { celebrate, chime, haptic } from '../../fx'
import { ME, myPoints, useStore } from '../../store'
import { activeMembership, myBookings } from '../../select'
import { Avatar, Button, CountUp, Icon, LevelPill, Ring, SectionHead, Sheet } from '../../components/ui'
import { leaderboard } from './Home'

export default function Me({ nav }) {
  const s = useStore()
  const { user, xp, badges, wallet, credits, coachCredits, club, logout, topUp, toast } = s
  const rank = rankOf(xp)
  const pts = myPoints(s)
  const pos = leaderboard(pts, user.name).findIndex((x) => x.me) + 1
  const games = myBookings(club).length
  const mem = activeMembership(s)
  const orders = club.orders.filter((o) => o.by === ME)
  const [badge, setBadge] = useState(null)
  const [top, setTop] = useState(false)

  const doTop = (n) => { topUp(n); setTop(false); chime('success'); toast({ icon: '💳', title: 'کیف پول شارژ شد', body: '+' + toman(n) }) }

  return (
    <div className="page me">
      <section className="me-head">
        <div className="me-bg" style={{ backgroundImage: "radial-gradient(circle at 85% 0%, rgba(5,224,218,.35), transparent 50%), url(./img/tiles.jpg)" }} />
        <div className="me-row">
          <Ring value={rank.progress} size={84} stroke={5} track="rgba(255,255,255,.15)"><Avatar name={user.name} size={64} me /></Ring>
          <div className="grow">
            <h2>{user.name}</h2>
            <p><LevelPill id={user.level} /> {levelById(user.level).title} · <span style={{ color: rank.c === '#141413' ? '#fff' : rank.c }}>{rank.name}</span></p>
          </div>
        </div>
        <div className="me-xp">
          <div className="bar"><motion.i initial={{ width: 0 }} animate={{ width: `${rank.progress * 100}%` }} transition={{ duration: 1 }} /></div>
          <small>{fa(xp)} XP {rank.next && `· ${fa(rank.next.xp - xp)} تا ${rank.next.name}`}</small>
        </div>
        <div className="me-stats">
          <button onClick={() => nav.tab('games')}><b><CountUp to={games} /></b><small>بازی</small></button>
          <button onClick={() => nav.open('ranking')}><b>#<CountUp to={pos} /></b><small>رنکینگ</small></button>
          <button onClick={() => nav.open('ranking')}><b><CountUp to={pts} /></b><small>امتیاز</small></button>
          <button><b><CountUp to={badges.length} /></b><small>نشان</small></button>
        </div>
      </section>

      <div className="page-body">
        <div className="wallet-card">
          <div><small>کیف پول</small><b><CountUp to={wallet} format={(v) => toman(v)} /></b></div>
          <Button small variant="q" icon="plus" onClick={() => setTop(true)}>شارژ</Button>
        </div>

        <div className="assets">
          <button className="asset" onClick={() => nav.open('packages')}>
            <Icon name="ticket" /><b>{fa(credits)}</b><small>سانس پکیج</small>
          </button>
          <button className="asset" onClick={() => nav.open('coaches')}>
            <Icon name="coach" /><b>{fa(Object.values(coachCredits).reduce((a, b) => a + b, 0))}</b><small>جلسه‌ی مربی</small>
          </button>
          <button className={`asset ${mem ? 'gold' : ''}`} onClick={() => nav.open('packages')}>
            <Icon name="crown" /><b>{mem ? mem.name.replace('عضویت ', '') : '—'}</b><small>{mem ? `${fa(Math.ceil((s.membership.until - Date.now()) / 864e5))} روز مانده` : 'عضویت'}</small>
          </button>
        </div>

        <SectionHead title="نشان‌ها" sub={`${fa(badges.length)} از ${fa(BADGES.length)}`} />
        <div className="badges">
          {BADGES.map((b, i) => {
            const has = badges.includes(b.id)
            return (
              <motion.button key={b.id} className={`badge ${has ? 'on' : ''}`} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03, type: 'spring', stiffness: 300, damping: 18 }}
                whileTap={{ scale: 0.9, rotate: -6 }} onClick={() => { haptic(8); setBadge(b) }}>
                <span>{has ? b.icon : '🔒'}</span><small>{b.name}</small>
              </motion.button>
            )
          })}
        </div>

        <SectionHead title="مسیر رتبه‌ها" />
        <div className="rank-path">
          {RANKS.map((r, i) => (
            <div key={r.name} className={`rp ${i <= rank.index ? 'on' : ''} ${i === rank.index ? 'cur' : ''}`}>
              <i style={{ '--c': r.c }} /><small>{r.name}</small><em>{fa(r.xp)}</em>
            </div>
          ))}
        </div>

        {orders.length > 0 && (<>
          <SectionHead title="سفارش‌های من" />
          {orders.map((o) => (
            <div key={o.id} className="order-row">
              <div className="grow"><b dir="ltr">{o.id}</b><small>{o.items.map((x) => productById(x.pid).name).join('، ')}</small></div>
              <span className={`st st-${o.status}`}>{{ new: 'در حال آماده‌سازی', ready: 'آماده‌ی تحویل', delivered: 'تحویل شد' }[o.status]}</span>
            </div>
          ))}
        </>)}

        <div className="menu-list">
          {[['trophy', 'رنکینگ باشگاه', 'ranking'], ['ticket', 'پکیج‌ها و عضویت', 'packages'], ['coach', 'مربی‌ها و کلاس‌ها', 'coaches'], ['star', 'مسابقه‌ها و تورنمنت‌ها', 'events'], ['bell', 'اعلان‌ها', 'notifs']].map(([ic, n, pg]) => (
            <button key={pg} onClick={() => nav.open(pg)}><Icon name={ic} /><span>{n}</span><Icon name="fwd" size={16} /></button>
          ))}
          <button className="danger" onClick={() => { haptic(10); logout() }}><Icon name="logout" /><span>خروج از حساب</span></button>
        </div>
        <details className="credits"><summary>منابع تصاویر</summary>{CREDITS.map((c) => <small key={c}>{c}</small>)}</details>
      </div>

      <Sheet open={!!badge} onClose={() => setBadge(null)}>
        {badge && (
          <div className="badge-detail">
            <motion.span initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 12 }}>{badges.includes(badge.id) ? badge.icon : '🔒'}</motion.span>
            <h3>{badge.name}</h3><p className="muted">{badge.desc}</p>
            <p className="pill-ink">{badges.includes(badge.id) ? 'باز شده · +۱۵ XP' : 'هنوز قفله'}</p>
          </div>
        )}
      </Sheet>
      <Sheet open={top} onClose={() => setTop(false)} title="شارژ کیف پول">
        <div className="topup">
          {[500000, 1000000, 2000000, 5000000].map((n) => <Button key={n} variant="ghost" onClick={() => doTop(n)}>{toman(n)}</Button>)}
          <p className="hint">در نسخه‌ی نمایشی، پرداخت شبیه‌سازی می‌شود.</p>
        </div>
      </Sheet>
    </div>
  )
}
