import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import {
  COACHES, COURTS, DURATIONS, MEMBERS, METHOD_NAME, PRODUCTS, TYPE_NAME, addDays, coachById, courtById, dayLabel, dayMonth, fa, fromKey,
  hourLabel, mil, priceFor, range, short, toman, todayKey, weekdayShort, dayNum,
} from '../../data'
import { chime } from '../../fx'
import { isFree, payState, useStore } from '../../store'
import { Icon, LevelPill } from '../../components/ui'
import { Logo } from '../../components/Logo'
import { HBars, Heatmap, Legend, Spark, StackedBars } from './Charts'
import { SERIES, STATUS, heat, occupancy, payments, revenueByDay, who } from './derive'
import { Bookings, Coaches, Members, Payments, Settings, ShopAdmin } from './Lists'
import { refCode } from '../player/Games'
import '../../admin.css'

const NAV = [
  { id: 'overview', name: 'نمای کلی', icon: 'grid' },
  { id: 'calendar', name: 'تقویم زمین‌ها', icon: 'court' },
  { id: 'bookings', name: 'رزروها', icon: 'cal' },
  { id: 'payments', name: 'پرداخت‌ها', icon: 'cash' },
  { id: 'shop', name: 'فروشگاه', icon: 'bag' },
  { id: 'coaches', name: 'مربی‌ها و پکیج‌ها', icon: 'coach' },
  { id: 'members', name: 'اعضا', icon: 'users' },
  { id: 'settings', name: 'تنظیمات', icon: 'cog' },
]

export default function Admin() {
  const { logout } = useStore()
  const [sec, setSec] = useState('overview')
  const [menu, setMenu] = useState(false)
  const [drawer, setDrawer] = useState(null) // {kind:'booking', id} | {kind:'new', court, date, start}
  const ctx = { go: setSec, open: setDrawer }
  const S = { overview: Overview, calendar: Calendar, bookings: Bookings, payments: Payments, shop: ShopAdmin, coaches: Coaches, members: Members, settings: Settings }[sec]
  return (
    <div className="adm" dir="rtl">
      <aside className={`adm-side ${menu ? 'open' : ''}`}>
        <div className="adm-brand"><Logo tone="light" size={18} /><small>پنل مدیریت</small></div>
        <nav>
          {NAV.map((n) => (
            <button key={n.id} className={sec === n.id ? 'on' : ''} onClick={() => { setSec(n.id); setMenu(false); window.scrollTo(0, 0) }}>
              {sec === n.id && <motion.span layoutId="adm-nav" className="adm-nav-bg" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
              <Icon name={n.icon} size={19} /><span>{n.name}</span>
            </button>
          ))}
        </nav>
        <div className="adm-me">
          <div className="adm-av">م</div>
          <div className="grow"><b>مدیر باشگاه</b><small>admin</small></div>
          <button onClick={logout} title="خروج" aria-label="خروج"><Icon name="logout" size={18} /></button>
        </div>
      </aside>
      {menu && <div className="adm-scrim" onClick={() => setMenu(false)} />}
      <main className="adm-main">
        <header className="adm-top">
          <button className="adm-burger" onClick={() => setMenu(true)} aria-label="منو"><Icon name="menu" /></button>
          <div className="grow"><h1>{NAV.find((n) => n.id === sec).name}</h1><small>{new Intl.DateTimeFormat('fa-IR', { dateStyle: 'full' }).format(new Date())}</small></div>
          <button className="adm-btn primary" onClick={() => setDrawer({ kind: 'new', date: todayKey() })}><Icon name="plus" size={18} />رزرو دستی</button>
        </header>
        <AnimatePresence mode="wait">
          <motion.div key={sec} className="adm-body" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <S ctx={ctx} />
          </motion.div>
        </AnimatePresence>
      </main>
      <Drawer d={drawer} onClose={() => setDrawer(null)} />
    </div>
  )
}

export function Card({ title, sub, right, children, className = '' }) {
  return (
    <section className={`adm-card ${className}`}>
      {(title || right) && <div className="adm-card-h"><div><h3>{title}</h3>{sub && <small>{sub}</small>}</div>{right}</div>}
      {children}
    </section>
  )
}
export const Status = ({ s }) => <span className={`badge-st ${STATUS[s].cls}`}><i />{STATUS[s].name}</span>

function Kpi({ label, value, delta, spark, icon, tone }) {
  return (
    <div className={`kpi ${tone || ''}`}>
      <div className="kpi-h"><span><Icon name={icon} size={16} />{label}</span>{delta != null && <em className={delta >= 0 ? 'up' : 'down'}>{delta >= 0 ? '▲' : '▼'} {fa(Math.abs(Math.round(delta)))}٪</em>}</div>
      <b>{value}</b>
      {spark && <Spark values={spark} />}
    </div>
  )
}

function Overview({ ctx }) {
  const { club, user } = useStore()
  const [table, setTable] = useState(false)
  const pays = useMemo(() => payments(club, user), [club])
  const rev = useMemo(() => revenueByDay(pays, 30), [pays])
  const grid = useMemo(() => heat(club), [club])
  const today = todayKey()
  const tRev = rev[rev.length - 1].total
  const avg7 = rev.slice(-8, -1).reduce((s, d) => s + d.total, 0) / 7
  const todays = club.bookings.filter((b) => b.date === today && b.status === 'ok' && b.type !== 'block')
  const occ = occupancy(club, today)
  const occ7 = Array.from({ length: 14 }, (_, i) => occupancy(club, addDays(today, i - 13)))
  const due = pays.filter((p) => p.due > 0)
  const dueSum = due.filter((p) => p.at < Date.now()).reduce((s, p) => s + p.due, 0)
  const shop7 = pays.filter((p) => p.kind === 'shop' && p.at > Date.now() - 7 * 864e5).reduce((s, p) => s + p.paid, 0)
  const total30 = rev.reduce((s, d) => s + d.total, 0)
  const mix = SERIES.map((s) => ({ name: s.name, color: s.color, value: rev.reduce((a, d) => a + d[s.id], 0) }))
  const methods = Object.entries(pays.filter((p) => p.at > Date.now() - 30 * 864e5 && p.paid).reduce((m, p) => ({ ...m, [p.method]: (m[p.method] || 0) + p.paid }), {}))
    .map(([k, v]) => ({ name: METHOD_NAME[k] || k, value: v, color: '#0E9F98' })).sort((a, b) => b.value - a.value)
  const openNeed = club.bookings.filter((b) => b.type === 'open' && b.status === 'ok' && b.players.length < 4 && (b.date === today || b.date === addDays(today, 1)))
  const low = PRODUCTS.filter((p) => club.stock[p.id] <= 3)
  const active = MEMBERS.filter((m) => club.bookings.some((b) => (b.by === m.id || b.players?.includes(m.id)) && fromKey(b.date) > Date.now() - 21 * 864e5 && fromKey(b.date) <= Date.now())).length

  return (
    <div className="ov">
      <div className="kpis">
        <Kpi icon="cash" label="درآمد امروز" value={mil(tRev)} delta={avg7 ? ((tRev - avg7) / avg7) * 100 : null} spark={rev.slice(-14).map((d) => d.total)} />
        <Kpi icon="cal" label="رزروهای امروز" value={fa(todays.length)} spark={Array.from({ length: 14 }, (_, i) => club.bookings.filter((b) => b.date === addDays(today, i - 13) && b.status === 'ok').length)} />
        <Kpi icon="court" label="اشغال امروز" value={`${fa(Math.round(occ * 100))}٪`} spark={occ7} />
        <Kpi icon="clock" label="معوق (سررسید گذشته)" value={mil(dueSum)} tone={dueSum ? 'warn' : ''} />
        <Kpi icon="bag" label="فروشگاه · ۷ روز" value={mil(shop7)} />
        <Kpi icon="users" label="اعضای فعال" value={`${fa(active)} / ${fa(MEMBERS.length)}`} />
      </div>

      <div className="ov-grid">
        <Card className="span2" title="درآمد ۳۰ روز اخیر" sub={`جمع ${toman(total30)}`}
          right={<div className="card-tools"><Legend /><button className="adm-btn ghost sm" onClick={() => setTable(!table)}>{table ? 'نمودار' : 'جدول'}</button></div>}>
          {table ? (
            <div className="tbl-wrap small"><table className="tbl"><thead><tr><th>روز</th>{SERIES.map((s) => <th key={s.id}>{s.name}</th>)}<th>جمع</th></tr></thead>
              <tbody>{[...rev].reverse().map((d) => <tr key={d.key}><td>{dayMonth(fromKey(d.key))}</td>{SERIES.map((s) => <td key={s.id}>{short(d[s.id])}</td>)}<td><b>{short(d.total)}</b></td></tr>)}</tbody></table></div>
          ) : <StackedBars data={rev} />}
        </Card>
        <Card title="ترکیب درآمد" sub="۳۰ روز"><HBars rows={mix} /></Card>

        <Card className="span2" title="امروز روی زمین‌ها" sub={`${fa(todays.length)} رزرو · برای جزئیات روی هر بلوک بزنید`} right={<button className="adm-btn ghost sm" onClick={() => ctx.go('calendar')}>تقویم کامل</button>}>
          <Timeline date={today} compact onPick={ctx.open} />
        </Card>
        <Card title="روش‌های پرداخت" sub="۳۰ روز"><HBars rows={methods} /></Card>

        <Card className="span2" title="نقشه‌ی اشغال" sub="میانگین ۴ هفته‌ی اخیر · روز × ساعت"><Heatmap grid={grid} /></Card>
        <Card title="نیاز به اقدام">
          <div className="alerts">
            {openNeed.map((b) => (
              <button key={b.id} className="alert" onClick={() => ctx.open({ kind: 'booking', id: b.id })}>
                <span className="al-ic q"><Icon name="radar" size={16} /></span>
                <div className="grow"><b>بازی باز {fa(b.players.length)}/۴</b><small>{dayLabel(b.date)} {range(b.start, b.dur)} · {courtById(b.court).name}</small></div>
              </button>
            ))}
            {due.filter((p) => p.ref && p.at > Date.now() && p.at < Date.now() + 2 * 864e5).slice(0, 4).map((p) => (
              <button key={p.id} className="alert" onClick={() => ctx.open({ kind: 'booking', id: p.id })}>
                <span className="al-ic w"><Icon name="cash" size={16} /></span>
                <div className="grow"><b>{toman(p.due)} پرداخت‌نشده</b><small>{p.who} · {p.sub}</small></div>
              </button>
            ))}
            {low.map((p) => (
              <button key={p.id} className="alert" onClick={() => ctx.go('shop')}>
                <span className="al-ic b"><Icon name="box" size={16} /></span>
                <div className="grow"><b>موجودی کم: {fa(club.stock[p.id])} عدد</b><small>{p.name}</small></div>
              </button>
            ))}
            {Object.entries(club.off).filter(([, v]) => v).map(([id]) => (
              <div key={id} className="alert"><span className="al-ic b"><Icon name="wrench" size={16} /></span><div className="grow"><b>{courtById(+id).name} غیرفعال</b><small>از تنظیمات فعال کنید</small></div></div>
            ))}
          </div>
        </Card>

        <Card className="span3" title="آخرین تراکنش‌ها" right={<button className="adm-btn ghost sm" onClick={() => ctx.go('payments')}>همه</button>}>
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr><th>زمان</th><th>شرح</th><th>مشتری</th><th>روش</th><th>مبلغ</th><th>وضعیت</th></tr></thead>
            <tbody>{pays.filter((p) => p.at <= Date.now()).slice(0, 8).map((p) => (
              <tr key={p.id} onClick={() => p.ref && ctx.open({ kind: 'booking', id: p.id })} className={p.ref ? 'click' : ''}>
                <td className="nowrap">{new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(p.at)}</td>
                <td><b>{p.title}</b><small>{p.sub}</small></td><td>{p.who}</td><td>{METHOD_NAME[p.method]}</td><td className="num">{toman(p.amount)}</td><td><Status s={p.status} /></td>
              </tr>))}</tbody>
          </table></div>
        </Card>
      </div>
    </div>
  )
}

// ---------- تایم‌لاین ۴ زمین ----------
const H0 = 7, H1 = 24
const TYPE_CLS = { private: 't-private', open: 't-open', coach: 't-coach', block: 't-block', event: 't-event' }
export function Timeline({ date, compact, onPick }) {
  const { club, user } = useStore()
  const now = new Date(), isToday = date === todayKey()
  const nowX = ((now.getHours() + now.getMinutes() / 60 - H0) / (H1 - H0)) * 100
  const pick = (court, e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const frac = (r.right - e.clientX) / r.width // راست‌به‌چپ
    const start = Math.floor((H0 + frac * (H1 - H0)) * 2) / 2
    if (isFree(club, date, court, start, 1)) onPick({ kind: 'new', court, date, start })
  }
  return (
    <div className={`tl ${compact ? 'compact' : ''}`}>
      <div className="tl-hours"><span />{Array.from({ length: H1 - H0 }, (_, i) => <small key={i}>{fa(H0 + i)}</small>)}</div>
      {COURTS.map((c) => {
        const list = club.bookings.filter((b) => b.date === date && b.court === c.id && b.status !== 'cancelled')
        return (
          <div key={c.id} className={`tl-row ${club.off[c.id] ? 'off' : ''}`}>
            <div className="tl-court"><b>{c.name}</b><small>{c.kind} · {fa(Math.round(occupancy(club, date, c.id) * 100))}٪</small></div>
            <div className="tl-track" onClick={(e) => e.target === e.currentTarget && pick(c.id, e)}>
              {isToday && nowX > 0 && nowX < 100 && <i className="tl-now" style={{ right: `${nowX}%` }} />}
              {list.map((b) => {
                const st = payState(b)
                return (
                  <motion.button key={b.id} className={`tl-b ${TYPE_CLS[b.type]}`} style={{ right: `${((b.start - H0) / (H1 - H0)) * 100}%`, width: `calc(${(b.dur / (H1 - H0)) * 100}% - 3px)` }}
                    whileHover={{ y: -2 }} onClick={() => onPick({ kind: 'booking', id: b.id })} title={`${TYPE_NAME[b.type]} · ${range(b.start, b.dur)}`}>
                    <b>{b.type === 'block' ? b.note || 'تعمیرات' : b.type === 'coach' ? coachById(b.coach)?.name : who(b.by, user).replace(' (اپ)', '')}</b>
                    {!compact && <small>{range(b.start, b.dur)}{b.type === 'open' ? ` · ${fa(b.players.length)}/۴` : ''}</small>}
                    {b.type !== 'block' && <i className={`pd ${STATUS[st].cls}`} />}
                  </motion.button>
                )
              })}
            </div>
          </div>
        )
      })}
      <div className="tl-legend">
        {Object.entries({ private: 'خصوصی', open: 'بازی باز', coach: 'کلاس مربی', block: 'تعمیرات' }).map(([k, v]) => <span key={k}><i className={TYPE_CLS[k]} />{v}</span>)}
        <span><i className="pd ok" />پرداخت‌شده</span><span><i className="pd warn" />بیعانه</span><span><i className="pd bad" />در انتظار</span>
      </div>
    </div>
  )
}

function Calendar({ ctx }) {
  const { club } = useStore()
  const [date, setDate] = useState(todayKey())
  const days = Array.from({ length: 14 }, (_, i) => addDays(todayKey(), i - 3))
  const list = club.bookings.filter((b) => b.date === date && b.status !== 'cancelled' && b.type !== 'block')
  const dayRev = list.reduce((s, b) => s + b.price, 0), dayPaid = list.reduce((s, b) => s + b.paid, 0)
  return (
    <div className="cal">
      <div className="cal-days">
        <button className="adm-btn ghost sm" onClick={() => setDate(addDays(date, -1))} aria-label="روز قبل"><Icon name="back" size={16} /></button>
        <div className="cal-strip">
          {days.map((k) => (
            <button key={k} className={`cal-d ${k === date ? 'on' : ''} ${k === todayKey() ? 'today' : ''}`} onClick={() => setDate(k)}>
              <small>{weekdayShort(fromKey(k))}</small><b>{dayNum(fromKey(k))}</b>
              <i style={{ '--o': occupancy(club, k) }} />
            </button>
          ))}
        </div>
        <button className="adm-btn ghost sm" onClick={() => setDate(addDays(date, 1))} aria-label="روز بعد"><Icon name="fwd" size={16} /></button>
      </div>
      <div className="cal-sum">
        <div><small>تاریخ</small><b>{dayLabel(date)} · {dayMonth(fromKey(date))}</b></div>
        <div><small>رزروها</small><b>{fa(list.length)}</b></div>
        <div><small>اشغال</small><b>{fa(Math.round(occupancy(club, date) * 100))}٪</b></div>
        <div><small>مبلغ رزروها</small><b>{toman(dayRev)}</b></div>
        <div><small>دریافت‌شده</small><b>{toman(dayPaid)}</b></div>
      </div>
      <Card title="زمان‌بندی ۴ زمین" sub="روی فضای خالی بزنید تا رزرو دستی ثبت شود">
        <Timeline date={date} onPick={ctx.open} />
      </Card>
    </div>
  )
}

// ---------- کشوی جزئیات و رزرو دستی ----------
function Drawer({ d, onClose }) {
  return (
    <AnimatePresence>
      {d && (
        <>
          <motion.div className="dr-dim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside className="drawer" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 320, damping: 36 }}>
            <button className="dr-x" onClick={onClose} aria-label="بستن"><Icon name="close" /></button>
            {d.kind === 'booking' ? <BookingDetail id={d.id} onClose={onClose} /> : <NewBooking d={d} onClose={onClose} />}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function BookingDetail({ id, onClose }) {
  const { club, user, adminSettle, adminCancel, adminMove, toast } = useStore()
  const b = club.bookings.find((x) => x.id === id)
  const [method, setMethod] = useState('card')
  if (!b) return null
  const st = payState(b), c = courtById(b.court)
  const settle = () => { adminSettle(b.id, method); chime('success'); toast({ icon: '✅', title: 'پرداخت ثبت شد', body: toman(b.price - b.paid) }) }
  const cancel = (refund) => { adminCancel(b.id, refund); toast({ icon: '↩️', title: 'رزرو لغو شد', body: refund ? 'مبلغ مسترد شد' : 'بدون استرداد' }); onClose() }
  const moveTo = (court) => {
    if (!isFree({ ...club, bookings: club.bookings.filter((x) => x.id !== b.id) }, b.date, court, b.start, b.dur)) { toast({ icon: '⛔', title: 'این زمین در آن ساعت پر است' }); return }
    adminMove(b.id, { court }); toast({ icon: '🔁', title: `منتقل شد به ${courtById(court).name}` })
  }
  return (
    <div className="dr">
      <div className="dr-photo" style={{ backgroundImage: `url(${c.img})` }}><div><span className={`type-pill ${TYPE_CLS[b.type]}`}>{TYPE_NAME[b.type]}</span><h2>{dayLabel(b.date)} · {range(b.start, b.dur)}</h2><small>{c.name} · {dayMonth(fromKey(b.date))}</small></div></div>
      {b.type !== 'block' && (<>
        <div className="dr-rows">
          <div><span>رزروکننده</span><b>{who(b.by, user)}</b></div>
          {b.coach && <div><span>مربی</span><b>{coachById(b.coach).name}</b></div>}
          <div><span>منبع</span><b>{b.source === 'app' ? 'اپ' : 'پذیرش'}</b></div>
          <div><span>کد</span><b dir="ltr">{refCode(b.id)}</b></div>
          {b.levels && <div><span>سطح‌ها</span><b>{b.levels.join(' · ')}</b></div>}
          {b.type === 'open' && <div><span>نمایش</span><b>{b.visibility === 'private' ? `خصوصی · ${fa((b.invited || []).length)} دعوت` : 'عمومی'}</b></div>}
        </div>
        <h4>بازیکن‌ها {b.type === 'open' && `(${fa(b.players.length)}/۴)`}</h4>
        <div className="dr-ppl">
          {b.players.map((p) => { const m = MEMBERS.find((x) => x.id === p); return <div key={p}><span className="adm-av sm">{who(p, user)[0]}</span><b>{who(p, user)}</b>{m && <LevelPill id={m.level} />}</div> })}
          {b.type === 'open' && Array.from({ length: 4 - b.players.length }, (_, i) => <div key={i} className="empty"><span className="adm-av sm">+</span><b>جای خالی</b></div>)}
        </div>
        <h4>پرداخت</h4>
        <div className="dr-pay">
          <div><span>مبلغ</span><b>{toman(b.price)}</b></div>
          <div><span>دریافت‌شده</span><b>{toman(b.paid)}</b></div>
          <div><span>مانده</span><b>{toman(Math.max(0, b.price - b.paid))}</b></div>
          <div><span>وضعیت</span><Status s={st} /></div>
          {b.method && <div><span>روش</span><b>{METHOD_NAME[b.method]}</b></div>}
        </div>
        {b.status === 'ok' && st !== 'paid' && (
          <div className="dr-settle">
            <select value={method} onChange={(e) => setMethod(e.target.value)}>{['card', 'cash', 'online'].map((m) => <option key={m} value={m}>{METHOD_NAME[m]}</option>)}</select>
            <button className="adm-btn primary" onClick={settle}><Icon name="check" size={16} />تسویه {toman(b.price - b.paid)}</button>
          </div>
        )}
        {b.status === 'ok' && (<>
          <h4>انتقال به زمین دیگر</h4>
          <div className="dr-move">{COURTS.map((x) => <button key={x.id} disabled={x.id === b.court} className="adm-btn ghost sm" onClick={() => moveTo(x.id)}>{x.name}</button>)}</div>
        </>)}
      </>)}
      {b.type === 'block' && <p className="muted">{b.note}</p>}
      {b.status === 'ok' ? (
        <div className="dr-cta">
          {b.paid > 0 && <button className="adm-btn danger" onClick={() => cancel(true)}>لغو و استرداد</button>}
          <button className="adm-btn ghost" onClick={() => cancel(false)}>{b.type === 'block' ? 'حذف تعمیرات' : 'لغو بدون استرداد'}</button>
        </div>
      ) : <p className="cancelled">این رزرو لغو شده است{b.refunded ? ' · مبلغ مسترد شد' : ''}.</p>}
    </div>
  )
}

function NewBooking({ d, onClose }) {
  const { club, adminAddBooking, toast } = useStore()
  const [f, setF] = useState({ court: d.court || 1, date: d.date, start: d.start ?? 17, dur: 1, type: 'private', member: MEMBERS[0].id, coach: COACHES[0].id, pay: 'none', method: 'card', note: '', q: '' })
  const set = (p) => setF((x) => ({ ...x, ...p }))
  const price = f.type === 'coach' ? coachById(f.coach).price * f.dur : f.type === 'block' ? 0 : priceFor(f.date, f.start, f.dur, club.pricing)
  const coachClash = f.type === 'coach' && club.bookings.some((b) => b.coach === f.coach && b.date === f.date && b.status !== 'cancelled' && f.start < b.start + b.dur && b.start < f.start + f.dur)
  const free = isFree(club, f.date, f.court, f.start, f.dur) && f.start + f.dur <= 24 && !coachClash
  const matches = MEMBERS.filter((m) => !f.q || m.name.includes(f.q) || m.phone.includes(f.q)).slice(0, 6)
  const times = []; for (let h = 7; h < 24; h += 1) times.push(h)
  const save = () => {
    const paid = f.pay === 'full' ? price : f.pay === 'half' ? Math.round(price / 2) : 0
    adminAddBooking({ court: f.court, date: f.date, start: f.start, dur: f.dur, type: f.type, by: f.type === 'block' ? null : f.member, players: f.type === 'block' ? [] : [f.member],
      levels: f.type === 'open' ? [MEMBERS.find((m) => m.id === f.member).level] : null, coach: f.type === 'coach' ? f.coach : null, price, paid, method: paid ? f.method : null, note: f.note })
    chime('success'); toast({ icon: '📅', title: 'رزرو ثبت شد', body: `${courtById(f.court).name} · ${range(f.start, f.dur)}` }); onClose()
  }
  return (
    <div className="dr">
      <h2 className="dr-h">رزرو دستی</h2>
      <div className="form">
        <label>نوع<div className="seg-adm">{Object.entries({ private: 'خصوصی', open: 'بازی باز', coach: 'کلاس', block: 'تعمیرات' }).map(([k, v]) => <button key={k} className={f.type === k ? 'on' : ''} onClick={() => set({ type: k })}>{v}</button>)}</div></label>
        <label>زمین<div className="seg-adm">{COURTS.map((c) => <button key={c.id} className={f.court === c.id ? 'on' : ''} onClick={() => set({ court: c.id })}>{c.name}</button>)}</div></label>
        <div className="form-2">
          <label>تاریخ<select value={f.date} onChange={(e) => set({ date: e.target.value })}>{Array.from({ length: 21 }, (_, i) => addDays(todayKey(), i - 3)).map((k) => <option key={k} value={k}>{dayLabel(k)} {dayMonth(fromKey(k))}</option>)}</select></label>
          <label>ساعت شروع<select value={f.start} onChange={(e) => set({ start: +e.target.value })}>{times.map((h) => <option key={h} value={h}>{hourLabel(h)}</option>)}</select></label>
        </div>
        <label>مدت<div className="seg-adm">{DURATIONS.map((x) => <button key={x.h} className={f.dur === x.h ? 'on' : ''} onClick={() => set({ dur: x.h })}>{x.name}</button>)}</div></label>
        {f.type === 'coach' && <label>مربی<select value={f.coach} onChange={(e) => set({ coach: e.target.value })}>{COACHES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>}
        {f.type !== 'block' ? (<>
          <label>مشتری<input placeholder="جستجوی نام یا موبایل" value={f.q} onChange={(e) => set({ q: e.target.value })} /></label>
          <div className="pick-list">{matches.map((m) => <button key={m.id} className={f.member === m.id ? 'on' : ''} onClick={() => set({ member: m.id })}><span className="adm-av sm">{m.name[0]}</span><b>{m.name}</b><small dir="ltr">{m.phone}</small><LevelPill id={m.level} /></button>)}</div>
          <label>پرداخت<div className="seg-adm">{Object.entries({ none: 'بعداً', half: 'بیعانه ۵۰٪', full: 'کامل' }).map(([k, v]) => <button key={k} className={f.pay === k ? 'on' : ''} onClick={() => set({ pay: k })}>{v}</button>)}</div></label>
          {f.pay !== 'none' && <label>روش<div className="seg-adm">{['card', 'cash', 'online'].map((m) => <button key={m} className={f.method === m ? 'on' : ''} onClick={() => set({ method: m })}>{METHOD_NAME[m]}</button>)}</div></label>}
        </>) : <label>توضیح<input placeholder="مثلاً تعویض چمن" value={f.note} onChange={(e) => set({ note: e.target.value })} /></label>}
      </div>
      <div className="dr-total"><span>{courtById(f.court).name} · {range(f.start, f.dur)}</span><b>{toman(price)}</b></div>
      {!free && <p className="cancelled">{coachClash ? `${coachById(f.coach).name} در این ساعت کلاس دیگری دارد.` : `این بازه روی ${courtById(f.court).name} آزاد نیست.`}</p>}
      <button className="adm-btn primary full" disabled={!free} onClick={save}>ثبت رزرو</button>
    </div>
  )
}
