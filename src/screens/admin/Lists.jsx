import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import {
  CATEGORIES, COACH_PACKS, COURTS, METHOD_NAME, PACKAGES, PRODUCTS, TYPE_NAME, addDays, coachPackPrice, courtById, dayLabel, dayMonth, fa, fromKey,
  levelById, mil, priceFor, productById, range, short, toman, todayKey,
} from '../../data'
import { chime } from '../../fx'
import { payState, useStore } from '../../store'
import { Icon, LevelPill } from '../../components/ui'
import { ProductImage } from '../../components/Merch'
import { Card, Status } from './Admin'
import { HBars } from './Charts'
import { SEGMENTS, STATUS, coachStats, csv, download, memberStats, payments, who } from './derive'

const fmt = new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
const Search = ({ value, onChange, ph }) => <label className="adm-search"><Icon name="search" size={16} /><input placeholder={ph} value={value} onChange={(e) => onChange(e.target.value)} /></label>
const Seg = ({ value, onChange, options }) => (
  <div className="seg-adm">{Object.entries(options).map(([k, v]) => <button key={k} className={value === k ? 'on' : ''} onClick={() => onChange(k)}>{v}</button>)}</div>
)
function usePage(list, size = 25) {
  const [n, setN] = useState(size)
  return [list.slice(0, n), list.length > n ? () => setN(n + size) : null]
}

export function Bookings({ ctx }) {
  const { club, user } = useStore()
  const [range7, setRange] = useState('next')
  const [type, setType] = useState('all')
  const [st, setSt] = useState('all')
  const [q, setQ] = useState('')
  const t = todayKey()
  const list = useMemo(() => club.bookings.filter((b) => {
    if (b.type === 'block' && type !== 'block') return false
    const d = b.date
    const inR = range7 === 'today' ? d === t : range7 === 'next' ? fromKey(d) >= fromKey(t) && fromKey(d) <= fromKey(addDays(t, 7)) : range7 === 'past' ? fromKey(d) < fromKey(t) && fromKey(d) >= fromKey(addDays(t, -7)) : true
    return inR && (type === 'all' || b.type === type) && (st === 'all' || payState(b) === st) && (!q || who(b.by, user).includes(q))
  }).sort((a, b) => (range7 === 'past' ? -1 : 1) * (fromKey(a.date) - fromKey(b.date) || a.start - b.start)), [club, range7, type, st, q])
  const [rows, more] = usePage(list)
  const exp = () => download('quadra-bookings.csv', csv([['تاریخ', 'ساعت', 'زمین', 'نوع', 'مشتری', 'مبلغ', 'دریافتی', 'وضعیت'], ...list.map((b) => [b.date, range(b.start, b.dur), courtById(b.court).name, TYPE_NAME[b.type], who(b.by, user), b.price, b.paid, STATUS[payState(b)].name])]))
  return (
    <Card>
      <div className="filters-bar">
        <Seg value={range7} onChange={setRange} options={{ today: 'امروز', next: '۷ روز آینده', past: '۷ روز گذشته', all: 'همه' }} />
        <select value={type} onChange={(e) => setType(e.target.value)}><option value="all">همه‌ی انواع</option>{Object.entries(TYPE_NAME).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <select value={st} onChange={(e) => setSt(e.target.value)}><option value="all">همه‌ی وضعیت‌ها</option>{Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}</select>
        <Search value={q} onChange={setQ} ph="نام مشتری" />
        <button className="adm-btn ghost sm" onClick={exp}><Icon name="download" size={16} />CSV</button>
      </div>
      <p className="count">{fa(list.length)} رزرو، {toman(list.reduce((s, b) => s + b.price, 0))}</p>
      <div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>تاریخ</th><th>ساعت</th><th>زمین</th><th>نوع</th><th>رزروکننده</th><th>بازیکن</th><th>مبلغ</th><th>وضعیت</th><th>منبع</th></tr></thead>
        <tbody>{rows.map((b) => (
          <tr key={b.id} className="click" onClick={() => ctx.open({ kind: 'booking', id: b.id })}>
            <td className="nowrap">{dayLabel(b.date)} <small>{dayMonth(fromKey(b.date))}</small></td>
            <td className="nowrap num">{range(b.start, b.dur)}</td><td>{courtById(b.court).name}</td>
            <td><span className={`type-pill t-${b.type}`}>{TYPE_NAME[b.type]}</span></td>
            <td>{who(b.by, user)}</td><td className="num">{fa(b.players.length)}{b.type === 'open' ? '/۴' : ''}</td>
            <td className="num">{toman(b.price)}</td><td><Status s={payState(b)} /></td><td><small>{b.source === 'app' ? 'اپ' : 'پذیرش'}</small></td>
          </tr>))}</tbody>
      </table></div>
      {more && <button className="adm-btn ghost full" onClick={more}>نمایش بیشتر</button>}
    </Card>
  )
}

export function Payments({ ctx }) {
  const { club, user, adminSettle, toast } = useStore()
  const pays = useMemo(() => payments(club, user), [club])
  const [st, setSt] = useState('all')
  const [kind, setKind] = useState('all')
  const [q, setQ] = useState('')
  const [when, setWhen] = useState('past')
  const month = pays.filter((p) => p.at > Date.now() - 30 * 864e5 && p.at <= Date.now())
  const got = month.reduce((s, p) => s + p.paid, 0)
  const due = pays.filter((p) => p.due > 0 && p.at < Date.now())
  const ahead = pays.filter((p) => p.due > 0 && p.at >= Date.now())
  const refunded = pays.filter((p) => p.status === 'refunded')
  const list = pays.filter((p) => (when === 'past' ? p.at <= Date.now() : p.at > Date.now()) && (st === 'all' || p.status === st) && (kind === 'all' || p.kind === kind) && (!q || (p.who + p.title).includes(q)))
  const [rows, more] = usePage(list)
  const exp = () => download('quadra-payments.csv', csv([['زمان', 'شرح', 'مشتری', 'روش', 'مبلغ', 'دریافتی', 'مانده', 'وضعیت'], ...list.map((p) => [new Date(p.at).toISOString(), p.title, p.who, METHOD_NAME[p.method] || '', p.amount, p.paid, p.due, STATUS[p.status].name])]))
  return (
    <div className="stack">
      <div className="kpis four">
        <div className="kpi"><div className="kpi-h"><span><Icon name="cash" size={16} />دریافتی ۳۰ روز</span></div><b>{mil(got)}</b></div>
        <div className="kpi warn"><div className="kpi-h"><span><Icon name="clock" size={16} />معوق ({fa(due.length)})</span></div><b>{mil(due.reduce((s, p) => s + p.due, 0))}</b></div>
        <div className="kpi"><div className="kpi-h"><span><Icon name="cal" size={16} />مانده‌ی رزروهای آینده ({fa(ahead.length)})</span></div><b>{mil(ahead.reduce((s, p) => s + p.due, 0))}</b></div>
        <div className="kpi"><div className="kpi-h"><span><Icon name="refresh" size={16} />مسترد ({fa(refunded.length)})</span></div><b>{mil(refunded.reduce((s, p) => s + p.amount, 0))}</b></div>
      </div>
      <Card>
        <div className="filters-bar">
          <Seg value={when} onChange={setWhen} options={{ past: 'تا امروز', future: 'رزروهای آینده' }} />
          <Seg value={st} onChange={setSt} options={{ all: 'همه', paid: 'پرداخت‌شده', partial: 'بیعانه', pending: 'در انتظار', refunded: 'مسترد' }} />
          <select value={kind} onChange={(e) => setKind(e.target.value)}>{Object.entries({ all: 'همه‌ی منابع', court: 'زمین', coach: 'مربی', pack: 'پکیج و تورنمنت', shop: 'فروشگاه' }).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          <Search value={q} onChange={setQ} ph="مشتری یا شرح" />
          <button className="adm-btn ghost sm" onClick={exp}><Icon name="download" size={16} />CSV</button>
        </div>
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>زمان</th><th>شرح</th><th>مشتری</th><th>روش</th><th>مبلغ</th><th>مانده</th><th>وضعیت</th><th /></tr></thead>
          <tbody>{rows.map((p) => (
            <tr key={p.id} className={p.ref ? 'click' : ''} onClick={() => p.ref && ctx.open({ kind: 'booking', id: p.id })}>
              <td className="nowrap">{fmt.format(p.at)}</td><td><b>{p.title}</b><small>{p.sub}</small></td><td>{p.who}</td>
              <td>{METHOD_NAME[p.method] || '—'}</td><td className="num">{toman(p.amount)}</td><td className="num">{p.due ? toman(p.due) : '—'}</td><td><Status s={p.status} /></td>
              <td>{p.due > 0 && <button className="adm-btn primary sm" onClick={(e) => { e.stopPropagation(); adminSettle(p.id, 'card'); chime('success'); toast({ icon: '✅', title: 'تسویه شد', body: toman(p.due) }) }}>تسویه</button>}</td>
            </tr>))}</tbody>
        </table></div>
        {more && <button className="adm-btn ghost full" onClick={more}>نمایش بیشتر</button>}
      </Card>
    </div>
  )
}

export function ShopAdmin() {
  const { club, user, adminOrder, adminStock } = useStore()
  const [tab, setTab] = useState('orders')
  const [cat, setCat] = useState('all')
  const cols = [['new', 'جدید'], ['ready', 'آماده‌ی تحویل'], ['delivered', 'تحویل‌شده']]
  const sold = useMemo(() => {
    const m = {}
    club.orders.forEach((o) => o.items.forEach((x) => { m[x.pid] = (m[x.pid] || 0) + x.qty * x.price }))
    return Object.entries(m).map(([pid, v]) => ({ name: productById(pid).name, value: v, color: '#B44C9A' })).sort((a, b) => b.value - a.value).slice(0, 6)
  }, [club.orders])
  return (
    <div className="stack">
      <Seg value={tab} onChange={setTab} options={{ orders: `سفارش‌ها (${fa(club.orders.filter((o) => o.status !== 'delivered').length)} باز)`, stock: 'موجودی انبار', top: 'پرفروش‌ها' }} />
      {tab === 'orders' && (
        <div className="kanban">
          {cols.map(([k, n]) => (
            <div key={k} className="kb-col">
              <h4>{n} <span>{fa(club.orders.filter((o) => o.status === k).length)}</span></h4>
              {club.orders.filter((o) => o.status === k).slice(0, k === 'delivered' ? 8 : 40).map((o) => (
                <motion.div key={o.id} layout className="kb-card">
                  <div className="row-between"><b dir="ltr">{o.id}</b><small>{fmt.format(o.at)}</small></div>
                  <small>{who(o.by, user)}</small>
                  <ul>{o.items.map((x, i) => <li key={i}>{fa(x.qty)}× {productById(x.pid).name}{x.size ? `، ${x.size}` : ''}</li>)}</ul>
                  <div className="row-between"><b>{toman(o.total)}</b>
                    {k !== 'delivered' && <button className="adm-btn primary sm" onClick={() => { adminOrder(o.id, k === 'new' ? 'ready' : 'delivered'); chime('tap') }}>{k === 'new' ? 'آماده شد' : 'تحویل داده شد'}</button>}
                  </div>
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      )}
      {tab === 'stock' && (
        <Card>
          <div className="filters-bar"><Seg value={cat} onChange={setCat} options={Object.fromEntries(CATEGORIES.map((c) => [c.id, c.name]))} /></div>
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr><th>کالا</th><th>دسته</th><th>برند</th><th>قیمت</th><th>موجودی</th><th>وضعیت</th></tr></thead>
            <tbody>{PRODUCTS.filter((p) => cat === 'all' || p.cat === cat).map((p) => {
              const n = club.stock[p.id]
              return (
                <tr key={p.id}>
                  <td><div className="prod-cell"><ProductImage p={p} /><b>{p.name}</b></div></td>
                  <td>{CATEGORIES.find((c) => c.id === p.cat).name}</td><td>{p.brand}</td><td className="num">{toman(p.price)}</td>
                  <td><div className="qty"><button onClick={() => adminStock(p.id, n - 1)}>−</button><b>{fa(n)}</b><button onClick={() => adminStock(p.id, n + 1)}>+</button><button className="plus10" onClick={() => adminStock(p.id, n + 10)}>+۱۰</button></div></td>
                  <td>{n === 0 ? <span className="badge-st bad"><i />ناموجود</span> : n <= 3 ? <span className="badge-st warn"><i />کم</span> : <span className="badge-st ok"><i />موجود</span>}</td>
                </tr>
              )
            })}</tbody>
          </table></div>
        </Card>
      )}
      {tab === 'top' && <Card title="پرفروش‌ترین کالاها" sub="بر اساس مبلغ فروش"><HBars rows={sold} /></Card>}
    </div>
  )
}

export function Coaches() {
  const { club, user } = useStore()
  const stats = coachStats(club).sort((a, b) => b.rating - a.rating)
  const sales = club.sales.slice(0, 30)
  const pk = PACKAGES.map((p) => ({ name: p.name, value: club.sales.filter((s) => s.item === p.id).reduce((a, s) => a + s.price, 0), color: '#E07B39' }))
  return (
    <div className="stack">
      <div className="coach-grid">
        {stats.map((c) => (
          <div key={c.id} className="coach-adm">
            <div className="ca-photo" style={{ backgroundImage: `url(${c.img})` }} />
            <div className="ca-body">
              <div className="row-between"><b>{c.name}</b><LevelPill id={c.level} /></div>
              <small>{c.title}، ★ {fa(c.rating)} از {fa(c.reviews)} نظر ناشناس، {toman(c.price)}/جلسه</small>
              <div className="ca-stats">
                <div><b>{fa(c.sessions)}</b><small>جلسه‌ی برگزارشده</small></div>
                <div><b>{fa(c.upcoming)}</b><small>جلسه‌ی آینده</small></div>
                <div><b>{fa(c.packs)}</b><small>پکیج فروخته</small></div>
                <div><b>{short(c.revenue)}</b><small>درآمد</small></div>
              </div>
              {c.comments.map((r) => <p key={r.id} className="ca-quote">{'★'.repeat(r.stars)} «{r.text}»</p>)}
            </div>
          </div>
        ))}
      </div>
      <div className="two">
        <Card title="فروش پکیج‌های باشگاه"><HBars rows={pk} /></Card>
        <Card title="نرخ پکیج‌های مربی" sub="محاسبه‌ی خودکار از نرخ جلسه">
          <div className="tbl-wrap"><table className="tbl"><thead><tr><th>مربی</th>{COACH_PACKS.map((p) => <th key={p.id}>{p.name}</th>)}</tr></thead>
            <tbody>{stats.map((c) => <tr key={c.id}><td>{c.name}</td>{COACH_PACKS.map((p) => <td key={p.id} className="num">{short(coachPackPrice(c, p))}</td>)}</tr>)}</tbody></table></div>
        </Card>
      </div>
      <Card title="آخرین فروش‌ها">
        <div className="tbl-wrap"><table className="tbl"><thead><tr><th>زمان</th><th>شرح</th><th>نوع</th><th>مشتری</th><th>روش</th><th>مبلغ</th></tr></thead>
          <tbody>{sales.map((s) => <tr key={s.id}><td className="nowrap">{fmt.format(s.at)}</td><td>{s.name}</td><td>{{ coach: 'مربی', package: 'پکیج', event: 'تورنمنت' }[s.kind]}</td><td>{who(s.by, user)}</td><td>{METHOD_NAME[s.method]}</td><td className="num">{toman(s.price)}</td></tr>)}</tbody></table></div>
      </Card>
    </div>
  )
}

export function Members() {
  const { club, user } = useStore()
  const all = useMemo(() => memberStats(club, user), [club])
  const [seg, setSeg] = useState('all')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('spent')
  const [sel, setSel] = useState(null)
  const list = all.filter((m) => (seg === 'all' || m.seg === seg) && (!q || m.name.includes(q) || m.phone?.includes(q))).sort((a, b) => sort === 'last' ? a.lastDays - b.lastDays : b[sort] - a[sort])
  const counts = Object.fromEntries(Object.keys(SEGMENTS).map((k) => [k, k === 'all' ? all.length : all.filter((m) => m.seg === k).length]))
  const m = sel && all.find((x) => x.id === sel)
  return (
    <div className="stack">
      <div className="segs-big">
        {Object.entries(SEGMENTS).map(([k, v]) => (
          <button key={k} className={seg === k ? 'on' : ''} onClick={() => setSeg(k)}><b>{fa(counts[k])}</b><small>{v}</small></button>
        ))}
      </div>
      <Card>
        <div className="filters-bar">
          <Search value={q} onChange={setQ} ph="نام یا موبایل" />
          <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="spent">بیشترین خرید</option><option value="visits">بیشترین حضور</option><option value="points">رنکینگ</option><option value="last">آخرین حضور</option></select>
        </div>
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>عضو</th><th>موبایل</th><th>سطح</th><th>حضور</th><th>آخرین حضور</th><th>رنکینگ</th><th>مجموع خرید</th><th>بخش</th></tr></thead>
          <tbody>{list.map((x) => (
            <tr key={x.id} className={`click ${sel === x.id ? 'sel' : ''}`} onClick={() => setSel(sel === x.id ? null : x.id)}>
              <td><div className="prod-cell"><span className="adm-av sm">{x.name[0]}</span><b>{x.name}</b>{x.member && <span className="vip">{x.member === 'black' ? 'BLACK' : 'GOLD'}</span>}</div></td>
              <td dir="ltr" className="num">{x.phone}</td><td><LevelPill id={x.level} /></td><td className="num">{fa(x.visits)}</td>
              <td>{x.lastDays === 0 ? 'امروز' : x.lastDays >= 99 ? '—' : `${fa(x.lastDays)} روز پیش`}</td><td className="num">{x.points ? fa(x.points) : '—'}</td>
              <td className="num">{toman(x.spent)}</td><td><span className={`seg-pill s-${x.seg}`}>{SEGMENTS[x.seg]}</span></td>
            </tr>))}</tbody>
        </table></div>
      </Card>
      {m && (
        <Card title={m.name} sub={`${levelById(m.level).title}، ${m.games ? fa(m.games) + ' بازی' : ''} ${m.wins ? '، ' + fa(m.wins) + ' برد' : ''}`} right={<button className="adm-btn ghost sm" onClick={() => setSel(null)}>بستن</button>}>
          <div className="tbl-wrap"><table className="tbl"><thead><tr><th>تاریخ</th><th>ساعت</th><th>زمین</th><th>نوع</th><th>مبلغ</th><th>وضعیت</th></tr></thead>
            <tbody>{club.bookings.filter((b) => b.by === m.id || b.players?.includes(m.id)).sort((a, b) => fromKey(b.date) - fromKey(a.date)).slice(0, 12).map((b) => (
              <tr key={b.id}><td>{dayLabel(b.date)} {dayMonth(fromKey(b.date))}</td><td className="num">{range(b.start, b.dur)}</td><td>{courtById(b.court).name}</td><td>{TYPE_NAME[b.type]}</td><td className="num">{toman(b.price)}</td><td><Status s={payState(b)} /></td></tr>
            ))}</tbody></table></div>
        </Card>
      )}
    </div>
  )
}

export function Settings() {
  const { club, adminPricing, adminCourt, resetDemo, toast } = useStore()
  const [p, setP] = useState(club.pricing)
  const ex = (h) => priceFor(todayKey(), h, 1, p)
  const save = () => { adminPricing({ offpeak: +p.offpeak, peak: +p.peak, peakFrom: +p.peakFrom }); chime('success'); toast({ icon: '💾', title: 'نرخ‌ها ذخیره شد', body: 'در اپ بازیکن‌ها هم اعمال شد' }) }
  return (
    <div className="two">
      <Card title="نرخ زمین" sub="هر ساعت، کل زمین (۴ نفر)">
        <div className="form">
          <label>نرخ عادی (تومان)<input type="number" step="50000" value={p.offpeak} onChange={(e) => setP({ ...p, offpeak: e.target.value })} /></label>
          <label>نرخ پیک (تومان)<input type="number" step="50000" value={p.peak} onChange={(e) => setP({ ...p, peak: e.target.value })} /></label>
          <label>شروع ساعت پیک<select value={p.peakFrom} onChange={(e) => setP({ ...p, peakFrom: e.target.value })}>{[15, 16, 17, 18, 19].map((h) => <option key={h} value={h}>{fa(h)}:۰۰</option>)}</select></label>
          <p className="muted small">پنجشنبه و جمعه تمام روز پیک حساب می‌شود.</p>
          <div className="preview">
            <div><small>۱ ساعت، ساعت ۱۰ (امروز)</small><b>{toman(ex(10))}</b><small>هر نفر {toman(ex(10) / 4)}</small></div>
            <div><small>۱ ساعت، ساعت ۲۰ (امروز)</small><b>{toman(ex(20))}</b><small>هر نفر {toman(ex(20) / 4)}</small></div>
          </div>
          <button className="adm-btn primary" onClick={save}>ذخیره‌ی نرخ‌ها</button>
        </div>
      </Card>
      <div className="stack">
        <Card title="وضعیت زمین‌ها" sub="زمین غیرفعال در اپ قابل رزرو نیست">
          <div className="courts-set">
            {COURTS.map((c) => (
              <div key={c.id} className="court-set">
                <div className="cs-photo" style={{ backgroundImage: `url(${c.img})` }} />
                <div className="grow"><b>{c.name}</b><small>{c.kind}، {c.indoor ? 'سرپوشیده' : 'روباز'}</small></div>
                <button className={`tgl-adm ${club.off[c.id] ? '' : 'on'}`} onClick={() => { adminCourt(c.id, !club.off[c.id]); chime('tap') }}><i /><span>{club.off[c.id] ? 'تعمیرات' : 'فعال'}</span></button>
              </div>
            ))}
          </div>
        </Card>
        <Card title="داده‌های نمایشی">
          <p className="muted small">همه‌ی داده‌ها در مرورگر ذخیره می‌شوند و بین اپ بازیکن و پنل مدیر (حتی در دو تب) مشترک‌اند.</p>
          <button className="adm-btn danger" onClick={() => confirm('همه‌ی داده‌ها به حالت اولیه برگردد؟') && resetDemo()}><Icon name="refresh" size={16} />بازنشانی داده‌ها</button>
        </Card>
      </div>
    </div>
  )
}
