import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { COACHES, COACH_PACKS, EVENT_KIND, LEVELS, PACKAGES, coachPackPrice, dayLabel, dayMonth, events, fa, fromKey, hourLabel, levelById, short, toman } from '../../data'
import { celebrate, chime, haptic } from '../../fx'
import { myPoints, useStore } from '../../store'
import { activeMembership } from '../../select'
import { Avatar, Button, Chips, Icon, LevelPill, Photo, Sheet, TopBar, rise, stagger } from '../../components/ui'
import { leaderboard } from './Home'
import { Loading } from '../../components/Logo'

export function Coaches({ nav, onBack, focus }) {
  useEffect(() => { if (focus) document.getElementById('c-' + focus)?.scrollIntoView({ behavior: 'smooth' }) }, [focus])
  return (
    <div className="page">
      <TopBar onBack={onBack} title="مربی‌ها و کلاس‌ها" />
      <motion.div className="page-body" variants={stagger} initial="hidden" animate="show">
        <p className="lead">جلسه‌ی ۶۰ دقیقه‌ای خصوصی یا گروهی. پکیج‌های ۵ و ۱۰ جلسه‌ای تا ۱۵٪ ارزان‌ترند و همه‌ی جلسه‌ها همان لحظه در تقویم رزرو می‌شوند.</p>
        {COACHES.map((c) => (
          <motion.article key={c.id} id={'c-' + c.id} variants={rise} className="coach-big">
            <Photo src={c.img} />
            <div className="cb-shade" />
            <div className="cb-txt">
              <div className="row-between"><LevelPill id={c.level} /><span className="cb-rate">★ {fa(c.rating)}</span></div>
              <h3>{c.name}</h3>
              <small>{c.title} · {fa(c.exp)} سال سابقه</small>
              <p>{c.bio}</p>
              <div className="tags light">{c.focus.map((f) => <span key={f}>{f}</span>)}</div>
              <div className="cb-packs">
                {COACH_PACKS.map((p) => <div key={p.id}><small>{p.name}</small><b>{short(coachPackPrice(c, p))}</b></div>)}
              </div>
              <Button full variant="q" onClick={() => nav.start({ intent: 'coach', coachId: c.id })}>
                رزرو جلسه یا خرید پکیج
              </Button>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </div>
  )
}

export function Packages({ onBack, nav }) {
  const s = useStore()
  const [sel, setSel] = useState(null)
  const [method, setMethod] = useState('online')
  const [busy, setBusy] = useState(false)
  const mem = activeMembership(s)
  const buy = () => {
    setBusy(true)
    setTimeout(() => {
      const r = s.buyPackage(sel, method)
      celebrate(); chime('level'); haptic([20, 40, 20])
      s.toast({ icon: '💎', title: `${sel.name} فعال شد`, body: `+${fa(r.xp)} XP${r.badges.length ? ' · نشان «وفادار»' : ''}`, duration: 4500 })
      setBusy(false); setSel(null)
    }, method === 'online' ? 1300 : 600)
  }
  return (
    <div className="page">
      <TopBar onBack={onBack} title="پکیج‌ها و عضویت" />
      <motion.div className="page-body" variants={stagger} initial="hidden" animate="show">
        {mem && <div className="mem-active"><Icon name="crown" /><div><b>{mem.name} فعال است</b><small>{fa(Math.ceil((s.membership.until - Date.now()) / 864e5))} روز مانده · {fa(mem.off * 100)}٪ تخفیف روی همه‌ی رزروها</small></div></div>}
        {PACKAGES.map((p) => (
          <motion.button key={p.id} variants={rise} className={`pkg ${p.kind}`} whileTap={{ scale: 0.98 }} onClick={() => { haptic(8); p.kind === 'series' ? nav.start({ intent: 'court', series: p.id }) : setSel(p) }}>
            <Photo src={p.img} />
            <div className="pkg-shade" />
            {p.tag && <span className="pkg-tag">{p.tag}</span>}
            <div className="pkg-txt">
              <small>{p.kind === 'series' ? 'پکیج زمین' : 'عضویت'} · {p.sub}</small>
              <h3>{p.name}</h3>
              <ul>{p.perks.map((x) => <li key={x}><Icon name="check" size={14} stroke={3} />{x}</li>)}</ul>
              <div className="pkg-price">{p.kind === 'series' ? <b>{fa(p.off * 100)}٪ تخفیف · انتخاب روز و ساعت</b> : <b>{toman(p.price)}</b>}</div>
            </div>
          </motion.button>
        ))}
      </motion.div>
      <Sheet open={!!sel} onClose={() => setSel(null)} title={sel?.name}>
        {sel && (
          <div className="buy">
            <p className="muted">{sel.sub} · {fa(sel.days)} روز اعتبار</p>
            <div className="methods">
              {[['wallet', 'کیف پول', toman(s.wallet), 'wallet', s.wallet >= sel.price], ['online', 'کارت بانکی', 'درگاه شتاب', 'card', true]].map(([id, n, sub, ic, ok]) => (
                <button key={id} disabled={!ok} className={`method ${method === id ? 'on' : ''}`} onClick={() => setMethod(id)}><Icon name={ic} /><div className="grow"><b>{n}</b><small>{ok ? sub : 'موجودی کافی نیست'}</small></div><span className={`radio ${method === id ? 'on' : ''}`} /></button>
              ))}
            </div>
            <Loading show={busy} text="در حال پرداخت…" />
            <Button full variant="q" disabled={busy} onClick={buy}>{busy ? 'در حال پرداخت…' : `خرید · ${toman(sel.price)}`}</Button>
          </div>
        )}
      </Sheet>
    </div>
  )
}

export function Ranking({ onBack }) {
  const s = useStore()
  const [scope, setScope] = useState('all')
  const pts = myPoints(s)
  let list = leaderboard(pts, s.user.name).map((x) => ({ ...x, level: x.me ? s.user.level : x.level }))
  if (scope === 'level') list = list.filter((x) => x.level === s.user.level)
  const pos = list.findIndex((x) => x.me) + 1
  const top = list.slice(0, 3)
  return (
    <div className="page ranking">
      <TopBar onBack={onBack} title="رنکینگ کوادرا" />
      <div className="page-body">
        <Chips id="rk" value={scope} onChange={setScope} options={[{ id: 'all', name: 'کل باشگاه' }, { id: 'level', name: `سطح ${s.user.level}` }]} />
        <div className="podium">
          {[1, 0, 2].map((k) => top[k] && (
            <motion.div key={top[k].id} className={`pod p${k + 1}`} initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 + (k === 0 ? 0.3 : k * 0.12), type: 'spring', stiffness: 220, damping: 16 }}>
              {k === 0 && <motion.span className="crown" animate={{ rotate: [-8, 8, -8] }} transition={{ repeat: Infinity, duration: 2.4 }}>👑</motion.span>}
              <Avatar name={top[k].name} size={k === 0 ? 68 : 54} me={top[k].me} />
              <b>{top[k].me ? 'شما' : top[k].name.split(' ')[0]}</b>
              <small>{fa(top[k].points)}</small>
              <div className="pod-bar"><span>{fa(k + 1)}</span></div>
            </motion.div>
          ))}
        </div>
        <div className="rk-list">
          {list.slice(3, 40).map((p, i) => (
            <motion.div key={p.id} className={`rk-row ${p.me ? 'me' : ''}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i, 15) * 0.02 }}>
              <span className="rk-n">{fa(i + 4)}</span>
              <Avatar name={p.name} size={34} me={p.me} />
              <div className="grow"><b>{p.me ? `${p.name} (شما)` : p.name}</b><small>{p.games ? `${fa(p.games)} بازی` : 'بازیکن جدید'}</small></div>
              <LevelPill id={p.level} />
              <em>{fa(p.points)}</em>
            </motion.div>
          ))}
        </div>
        {pos > 40 && <div className="rk-row me sticky"><span className="rk-n">{fa(pos)}</span><Avatar name={s.user.name} size={34} me /><div className="grow"><b>شما</b><small>با هر بازی بالاتر می‌رید</small></div><em>{fa(pts)}</em></div>}
        <div className="rk-how">
          <b>امتیاز رنکینگ چطور حساب می‌شه؟</b>
          <p>هر سطح امتیاز پایه دارد ({LEVELS.slice(0, 3).map((l) => `${l.id}: ${fa(l.base)}`).join('، ')} …) و هر XP که از بازی، کلاس و تورنمنت می‌گیرید نصفش به رنکینگتون اضافه می‌شه.</p>
        </div>
      </div>
    </div>
  )
}

export function Events({ nav, onBack, kind: initial = 'friday' }) {
  const { events: joined } = useStore()
  const [kind, setKind] = useState(initial)
  const list = events().filter((e) => e.kind === kind)
  return (
    <div className="page">
      <TopBar onBack={onBack} title="مسابقه‌ها" />
      <div className="page-body">
        <Chips id="ev-kind" value={kind} onChange={setKind} options={Object.entries(EVENT_KIND).map(([id, k]) => ({ id, name: k.name }))} />
        <p className="muted ev-kind-sub">{EVENT_KIND[kind].sub}</p>
        <motion.div key={kind} className="ev-list" variants={stagger} initial="hidden" animate="show">
          {list.map((e) => (
            <motion.button key={e.id} variants={rise} className="ev-card big" whileTap={{ scale: 0.98 }} onClick={() => nav.start({ intent: 'event', eventId: e.id })} disabled={joined.includes(e.id)}>
              <Photo src={e.img} />
              <div className="ev-shade" />
              <div className="ev-txt">
                <span className={`pill-q ${e.kind === 'official' ? 'gold' : ''}`}>{dayLabel(e.date)} {dayMonth(fromKey(e.date))} · {hourLabel(e.start)}</span>
                <b>{e.title}</b>
                <small>{e.format} · سطح {e.levels.join(' / ')} · جایزه: {e.prize}</small>
                <div className="ev-cap"><div className="bar"><i style={{ width: `${(e.taken / e.cap) * 100}%` }} /></div><span>{fa(e.cap - e.taken)} جای خالی</span></div>
              </div>
              <em>{joined.includes(e.id) ? '✓ ثبت‌نام' : short(e.fee)}</em>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export function Notifications({ onBack }) {
  const { notifications, readAll } = useStore()
  useEffect(() => { const t = setTimeout(readAll, 800); return () => clearTimeout(t) }, [])
  return (
    <div className="page">
      <TopBar onBack={onBack} title="اعلان‌ها" />
      <div className="page-body">
        {notifications.length === 0 && <div className="empty-card">اعلانی ندارید.</div>}
        {notifications.map((n, i) => (
          <motion.div key={n.id} className={`notif ${n.read ? '' : 'new'}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <span className="notif-ic">{n.icon}</span>
            <div><b>{n.title}</b><p>{n.body}</p><small>{new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }).format(n.at)}</small></div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
