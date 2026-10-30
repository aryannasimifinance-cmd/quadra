import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { LEVELS, fa } from '../data'
import { celebrate, chime, haptic } from '../fx'
import { useStore } from '../store'
import { Button, Icon, LevelPill, Photo, TopBar } from '../components/ui'
import { Logo, QuadraMark } from '../components/Logo'

const toLatin = (s) => s.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
const fa0 = (s) => s.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d])
const HERO = ['./img/welcome.jpg']

export default function Gate() {
  const { loginPlayer, user } = useStore()
  const [step, setStep] = useState('welcome') // welcome → phone → otp → name → level → done | admin
  const [mode, setMode] = useState('signup')
  const [dir, setDir] = useState(1)
  const [form, setForm] = useState({ phone: '', name: '', level: null })
  const set = (p) => setForm((f) => ({ ...f, ...p }))
  const order = ['welcome', 'phone', 'otp', 'name', 'level', 'done']
  const go = (s) => { setDir(order.indexOf(s) >= order.indexOf(step) ? 1 : -1); setStep(s) }
  const back = () => go(step === 'admin' ? 'welcome' : order[order.indexOf(step) - 1])
  const afterOtp = () => {
    // کاربر قبلی همین دستگاه مستقیم وارد می‌شود
    if (mode === 'login' && user) { loginPlayer(user); return }
    go('name')
  }
  const finish = () => { celebrate(); chime('level'); haptic([20, 40, 20]); go('done') }
  const progress = { phone: 0, otp: 1, name: 2, level: 3 }[step]

  return (
    <div className="auth">
      <HeroSlides dim={step !== 'welcome'} admin={step === 'admin'} />
      <AnimatePresence mode="popLayout" custom={dir} initial={false}>
        <motion.div key={step} className={`auth-pane ${step === 'welcome' ? 'welcome' : ''}`} custom={dir}
          variants={{ in: (d) => ({ x: d * -60, opacity: 0 }), on: { x: 0, opacity: 1 }, out: (d) => ({ x: d * 60, opacity: 0 }) }}
          initial="in" animate="on" exit="out" transition={{ type: 'spring', stiffness: 300, damping: 32 }}>
          {step === 'welcome' && <Welcome onStart={() => { setMode('signup'); go('phone') }} onLogin={() => { setMode('login'); go('phone') }} onAdmin={() => go('admin')} />}
          {step === 'admin' && <AdminLogin onBack={back} />}
          {!['welcome', 'done', 'admin'].includes(step) && (
            <div className="auth-card">
              <TopBar onBack={back} total={4} step={progress} title={mode === 'login' && step === 'phone' ? 'ورود' : 'عضویت در کوادرا'} transparent />
              {step === 'phone' && <PhoneStep value={form.phone} onChange={(phone) => set({ phone })} onNext={() => go('otp')} mode={mode} />}
              {step === 'otp' && <OtpStep phone={form.phone} onNext={afterOtp} />}
              {step === 'name' && <NameStep form={form} set={set} onNext={() => go('level')} />}
              {step === 'level' && <LevelStep value={form.level} onChange={(level) => set({ level })} onNext={finish} />}
            </div>
          )}
          {step === 'done' && <Done form={form} onEnter={() => loginPlayer({ ...form, joined: Date.now() })} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function HeroSlides({ dim, admin }) {
  const [i, setI] = useState(0)
  useEffect(() => { if (HERO.length < 2) return; const t = setInterval(() => setI((x) => (x + 1) % HERO.length), 4200); return () => clearInterval(t) }, [])
  return (
    <div className="auth-bg">
      <AnimatePresence>
        <motion.div key={i} className="auth-bg-img" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.4 }}>
          <Photo src={HERO[i]} zoom pos="57% 50%" />
        </motion.div>
      </AnimatePresence>
      <div className={`auth-bg-shade ${dim ? 'dim' : ''} ${admin ? 'admin' : ''}`} />
      <div className="grain" />
    </div>
  )
}

function Welcome({ onStart, onLogin, onAdmin }) {
  const words = ['به سادگی زمین رزرو کن،', 'بازی بچین', 'و لذت ببر.']
  return (
    <div className="welcome-in">
      <motion.div className="brand" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Logo tone="light" size={20} />
        <span className="brand-tag">باشگاه پدل · ۴ زمین</span>
      </motion.div>
      <div className="welcome-copy">
        <h1>
          {words.map((w, i) => (
            <motion.span key={w} className={i === 2 ? 'hl' : ''} initial={{ opacity: 0, y: 40, rotate: 3 }} animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: 0.3 + i * 0.15, type: 'spring', stiffness: 200, damping: 18 }}>{w}</motion.span>
          ))}
        </h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ delay: 0.8 }}>
          مدرن‌ترین زمین پدل استان البرز
        </motion.p>
        <motion.div className="welcome-stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
          <span><b>۴</b>زمین پانورامیک</span><span><b>۷–۲۴</b>هر روز</span><span><b>۵۶+</b>بازیکن فعال</span>
        </motion.div>
      </div>
      <motion.div className="welcome-cta" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95 }}>
        <Button full variant="q" onClick={onStart}>شروع کنیم</Button>
        <Button full variant="glass" onClick={onLogin}>قبلاً عضو شده‌ام</Button>
        <button className="admin-link" onClick={onAdmin}><Icon name="shield" size={16} /> ورود مدیر باشگاه</button>
      </motion.div>
    </div>
  )
}

function AdminLogin({ onBack }) {
  const { loginAdmin, toast } = useStore()
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [err, setErr] = useState(false)
  const [busy, setBusy] = useState(false)
  const submit = () => {
    if (u.trim().toLowerCase() !== 'admin' || p !== 'quadra') { setErr(true); haptic([30, 30, 30]); return }
    setBusy(true); chime('success')
    setTimeout(() => { loginAdmin(); toast({ icon: '🛡', title: 'خوش آمدید، مدیر', body: 'پنل مدیریت کوادرا' }) }, 700)
  }
  return (
    <div className="admin-gate">
      <motion.div className="admin-card" animate={err ? { x: [0, -10, 10, -6, 6, 0] } : {}} transition={{ duration: 0.4 }} onAnimationComplete={() => setErr(false)}>
        <button className="icon-btn ghost" onClick={onBack} aria-label="بازگشت"><Icon name="back" /></button>
        <div className="admin-card-head">
          <QuadraMark size={44} tone="light" />
          <div><b>پنل مدیریت</b><small>فقط برای کارکنان کوادرا</small></div>
        </div>
        <label className="field dark"><Icon name="user" /><input dir="ltr" placeholder="نام کاربری" value={u} onChange={(e) => setU(e.target.value)} autoFocus /></label>
        <label className="field dark"><Icon name="lock" /><input dir="ltr" type="password" placeholder="رمز عبور" value={p} onChange={(e) => setP(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} /></label>
        <Button full variant="q" onClick={submit} disabled={!u || !p || busy}>{busy ? 'در حال ورود…' : 'ورود به پنل'}</Button>
        <p className="demo-hint">نسخه‌ی نمایشی — نام کاربری <code>admin</code> · رمز <code>quadra</code></p>
      </motion.div>
    </div>
  )
}

function PhoneStep({ value, onChange, onNext, mode }) {
  const valid = /^09\d{9}$/.test(value)
  const pretty = value.replace(/^(\d{4})(\d{0,3})(\d{0,4}).*/, (_, a, b, c) => [a, b, c].filter(Boolean).join(' '))
  return (
    <div className="step-body">
      <h2>{mode === 'login' ? 'خوش برگشتی 👋' : 'شماره موبایلت؟'}</h2>
      <p className="muted">یک کد ۴ رقمی برات پیامک می‌کنیم.</p>
      <label className={`field phone ${valid ? 'ok' : ''}`}>
        <Icon name="phone" />
        <input inputMode="numeric" autoFocus dir="ltr" placeholder="0912 345 6789" value={fa0(pretty)}
          onChange={(e) => onChange(toLatin(e.target.value).replace(/\D/g, '').slice(0, 11))}
          onKeyDown={(e) => e.key === 'Enter' && valid && onNext()} />
        <AnimatePresence>{valid && <motion.span className="field-ok" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Icon name="check" size={16} stroke={3} /></motion.span>}</AnimatePresence>
      </label>
      <Button full variant="q" disabled={!valid} onClick={onNext}>ارسال کد</Button>
      <button className="link center" onClick={() => { onChange('09120000000'); setTimeout(onNext, 150) }}>ورود سریع نمایشی</button>
    </div>
  )
}

function OtpStep({ phone, onNext }) {
  const [code, setCode] = useState(['', '', '', ''])
  const [auto, setAuto] = useState(false)
  const [sec, setSec] = useState(59)
  const refs = useRef([])
  useEffect(() => { refs.current[0]?.focus() }, [])
  useEffect(() => { const t = setInterval(() => setSec((s) => Math.max(0, s - 1)), 1000); return () => clearInterval(t) }, [])
  // شبیه‌سازی دریافت خودکار پیامک (WebOTP)
  useEffect(() => {
    const t = setTimeout(() => {
      setAuto(true)
      '1234'.split('').forEach((d, i) => setTimeout(() => { haptic(6); setCode((c) => { const n = [...c]; n[i] = d; return n }) }, i * 140))
    }, 1500)
    return () => clearTimeout(t)
  }, [])
  const full = code.every(Boolean)
  useEffect(() => { if (full) { chime('success'); const t = setTimeout(onNext, 600); return () => clearTimeout(t) } }, [full])
  const put = (i, v) => {
    const d = toLatin(v).replace(/\D/g, '').slice(-1)
    setCode((c) => { const n = [...c]; n[i] = d; return n })
    if (d && i < 3) refs.current[i + 1]?.focus()
  }
  return (
    <div className="step-body">
      <h2>کد تأیید</h2>
      <p className="muted">به <b dir="ltr">{fa0(phone)}</b> ارسال شد</p>
      <div className="otp" dir="ltr">
        {code.map((d, i) => (
          <motion.input key={i} ref={(el) => (refs.current[i] = el)} inputMode="numeric" value={d ? fa0(d) : ''}
            className={d ? 'filled' : ''} animate={d ? { scale: [1, 1.15, 1] } : {}} transition={{ duration: 0.25 }}
            onChange={(e) => put(i, e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Backspace' && !d && i > 0) refs.current[i - 1]?.focus() }} />
        ))}
      </div>
      <AnimatePresence>
        {auto && <motion.p className="auto-sms" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>✨ کد از پیامک خودکار خوانده شد</motion.p>}
      </AnimatePresence>
      <p className="muted center">{sec > 0 ? `ارسال مجدد تا ${fa(sec)} ثانیه` : <button className="link">ارسال مجدد کد</button>}</p>
    </div>
  )
}

function NameStep({ form, set, onNext }) {
  const ok = form.name.trim().length >= 2
  return (
    <div className="step-body">
      <h2>چی صدات کنیم؟</h2>
      <label className="field">
        <Icon name="user" />
        <input autoFocus placeholder="نام و نام خانوادگی" value={form.name} onChange={(e) => set({ name: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && ok && onNext()} />
      </label>
      <Button full variant="q" disabled={!ok} onClick={onNext}>ادامه</Button>
    </div>
  )
}

const QUIZ = [
  { q: 'چند وقته پدل بازی می‌کنی؟', a: ['تازه شروع کردم', 'کمتر از ۶ ماه', '۶ ماه تا ۲ سال', 'بیشتر از ۲ سال'] },
  { q: 'از دیوار پشتی استفاده می‌کنی؟', a: ['نه هنوز', 'گاهی', 'معمولاً', 'همیشه، حتی حمله'] },
  { q: 'تجربه‌ی مسابقه داری؟', a: ['نه', 'دوستانه', 'باشگاهی', 'رسمی'] },
]

function LevelStep({ value, onChange, onNext }) {
  const [quiz, setQuiz] = useState(null)
  const [score, setScore] = useState(0)
  const answer = (k) => {
    haptic(8)
    const s = score + k
    if (quiz < QUIZ.length - 1) { setScore(s); setQuiz(quiz + 1) } else {
      onChange(LEVELS[Math.max(0, Math.min(8, 8 - s))].id); setQuiz(null); setScore(0); chime('success')
    }
  }
  return (
    <div className="step-body">
      <h2>سطحت چیه؟</h2>
      <p className="muted">برای مچ‌میکینگ — بعد از هر بازی دقیق‌تر می‌شه.</p>
      <AnimatePresence mode="wait">
        {quiz === null ? (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="quiz-cta" onClick={() => { setQuiz(0); setScore(0) }}>
              <Icon name="sparkle" /> مطمئن نیستم — با ۳ سؤال کمکم کن
            </button>
            <div className="level-list">
              {LEVELS.map((l) => (
                <motion.button key={l.id} className={`level-row ${value === l.id ? 'on' : ''}`} whileTap={{ scale: 0.98 }} onClick={() => { haptic(6); onChange(l.id) }}>
                  <LevelPill id={l.id} />
                  <div><b>{l.title}</b><small>{l.desc}</small></div>
                  {value === l.id && <motion.span layoutId="lvl-check" className="lvl-check"><Icon name="check" size={16} stroke={3} /></motion.span>}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key={'q' + quiz} className="quiz" initial={{ x: -40, opacity: 0, rotate: -2 }} animate={{ x: 0, opacity: 1, rotate: 0 }} exit={{ x: 40, opacity: 0, rotate: 2 }}>
            <span className="quiz-n">{fa(quiz + 1)} / {fa(QUIZ.length)}</span>
            <h3>{QUIZ[quiz].q}</h3>
            {QUIZ[quiz].a.map((a, k) => (
              <motion.button key={a} className="quiz-a" whileTap={{ scale: 0.97 }} onClick={() => answer(k)}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: k * 0.05 }}>{a}</motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {quiz === null && <Button full variant="q" disabled={!value} onClick={onNext}>تموم شد!</Button>}
    </div>
  )
}

function Done({ form, onEnter }) {
  return (
    <div className="done">
      <motion.div className="done-badge" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 14 }}>
        <LevelPill id={form.level} big />
      </motion.div>
      <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>{form.name}، آماده‌ای!</motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ delay: 0.45 }}>سطح شروع: {form.level} · رتبه‌ی برنز</motion.p>
      <motion.div className="xp-pop" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, type: 'spring' }}>+۲۰ XP · ۵۰۰ هزار تومان اعتبار هدیه</motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} style={{ width: '100%' }}>
        <Button full variant="q" onClick={onEnter}>بزن بریم</Button>
      </motion.div>
    </div>
  )
}
