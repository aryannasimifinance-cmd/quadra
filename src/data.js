// داده‌های نمونه‌ی باشگاه کوادرا — نام‌ها، قیمت‌ها و آمارها ساختگی‌اند
const img = (n) => `./img/${n}.jpg`

export const CLUB = {
  name: 'کوادرا', en: 'QUADRA', tagline: 'باشگاه پدل',
  address: 'تهران — آدرس نمونه', phone: '۰۲۱ ۰۰۰۰ ۰۰۰۰', open: 7, close: 24,
}

export const COURTS = [
  { id: 1, name: 'زمین ۱', nick: 'سنترکورت', kind: 'پانورامیک', indoor: true, img: img('court-pano') },
  { id: 2, name: 'زمین ۲', nick: 'گلس‌هاوس', kind: 'پانورامیک', indoor: true, img: img('court-indoor') },
  { id: 3, name: 'زمین ۳', nick: 'بلو', kind: 'استاندارد', indoor: true, img: img('court-blue') },
  { id: 4, name: 'زمین ۴', nick: 'اسکای', kind: 'روباز', indoor: false, img: img('court-outdoor') },
]
export const courtById = (id) => COURTS.find((c) => c.id === id)

export const DURATIONS = [
  { h: 1, name: '۶۰ دقیقه' },
  { h: 1.5, name: '۹۰ دقیقه', tag: 'محبوب' },
  { h: 2, name: '۱۲۰ دقیقه' },
]

export const DEFAULT_PRICING = { offpeak: 1200000, peak: 1600000, peakFrom: 17 } // هر ساعت، کل زمین

export const LEVELS = [
  { id: 'A', title: 'حرفه‌ای', desc: 'سابقه مسابقه‌ی رسمی، کنترل کامل همه‌ی ضربه‌ها', color: '#141413', base: 2200 },
  { id: 'B+', title: 'پیشرفته‌ی قوی', desc: 'تاکتیک تیمی، اسمش و ویبورا', color: '#24344F', base: 1950 },
  { id: 'B', title: 'پیشرفته', desc: 'رالی طولانی، استفاده از دیوار و زاویه', color: '#2F5D8C', base: 1750 },
  { id: 'B-', title: 'نیمه‌پیشرفته', desc: 'ضربه‌های ثابت، شروع بازی تاکتیکی', color: '#2C7FA0', base: 1550 },
  { id: 'C+', title: 'متوسط قوی', desc: 'رالی پیوسته، سرویس مطمئن', color: '#0E9F98', base: 1400 },
  { id: 'C', title: 'متوسط', desc: 'بازی منظم با چند ماه سابقه', color: '#3DA57E', base: 1250 },
  { id: 'C-', title: 'متوسط مبتدی', desc: 'ضربه‌های پایه را بلدی ولی هنوز ناپایدار', color: '#B8901C', base: 1100 },
  { id: 'D+', title: 'مبتدی باتجربه', desc: 'چند بار بازی کرده‌ای و قوانین را می‌دانی', color: '#D0692F', base: 950 },
  { id: 'D', title: 'تازه‌کار', desc: 'تازه شروع کرده‌ای — خوش آمدی!', color: '#C2503A', base: 800 },
]
export const levelIndex = (id) => LEVELS.findIndex((l) => l.id === id)
export const levelById = (id) => LEVELS.find((l) => l.id === id) || LEVELS[5]
export const nearLevels = (id, span = 1) => {
  const i = Math.max(0, levelIndex(id))
  return LEVELS.slice(Math.max(0, i - span), i + span + 1).map((l) => l.id)
}

export const DAYPARTS = [
  { id: 'any', name: 'هر ساعتی', from: 7, to: 24 },
  { id: 'morning', name: 'صبح', from: 7, to: 12 },
  { id: 'noon', name: 'ظهر', from: 12, to: 17 },
  { id: 'evening', name: 'عصر', from: 17, to: 21 },
  { id: 'night', name: 'شب', from: 21, to: 24 },
]

export const COACHES = [
  { id: 'k1', name: 'کاوه رحیمی', title: 'سرمربی باشگاه', level: 'A', exp: 9, rating: 4.9, price: 1800000, img: img('coach-a'), focus: ['تکنیک دیوار', 'ویبورا', 'تاکتیک'], bio: 'مربی درجه‌یک فدراسیون؛ برنامه‌ی تمرینی مرحله‌به‌مرحله برای رسیدن به سطح بعدی.' },
  { id: 'k2', name: 'نازنین فرهی', title: 'مربی بانوان', level: 'A', exp: 7, rating: 5.0, price: 1700000, img: img('coach-b'), focus: ['فوت‌وورک', 'دفاع', 'لوب'], bio: 'قهرمان سابق کشور؛ کلاس‌های خصوصی و گروهی بانوان.' },
  { id: 'k3', name: 'آرش کیانی', title: 'شروع از صفر', level: 'B+', exp: 5, rating: 4.8, price: 1200000, img: img('coach-c'), focus: ['مبتدی', 'سرویس', 'قوانین'], bio: 'صبور و دقیق؛ بهترین انتخاب برای اولین جلسه‌ها.' },
  { id: 'k4', name: 'سینا مقدم', title: 'آمادگی مسابقه', level: 'A', exp: 11, rating: 4.9, price: 2100000, img: img('overhead'), focus: ['اسمش', 'آنالیز ویدیو', 'ذهن مسابقه'], bio: 'عضو تیم ملی؛ آماده‌سازی برای تورنمنت‌ها و رنکینگ.' },
]
export const coachById = (id) => COACHES.find((c) => c.id === id)

// پکیج‌های مربی — قیمت بر اساس نرخ جلسه‌ی مربی
export const COACH_PACKS = [
  { id: 'one', name: 'تک جلسه', sessions: 1, off: 0, people: 1 },
  { id: 'four', name: '۴ جلسه', sessions: 4, off: 0.08, people: 1, tag: '۸٪ تخفیف' },
  { id: 'eight', name: '۸ جلسه', sessions: 8, off: 0.15, people: 1, tag: 'به‌صرفه‌ترین' },
  { id: 'group', name: 'گروهی ۴ نفره', sessions: 1, off: 0, people: 4, mult: 0.4, tag: 'هر نفر' },
]
export const coachPackPrice = (coach, pack) => Math.round(coach.price * pack.sessions * (1 - pack.off) * (pack.mult || 1) / 10000) * 10000

export const PACKAGES = [
  { id: 'p5', kind: 'credit', name: 'پکیج ۵ سانس', sub: '۵ سانس ۹۰ دقیقه‌ای · هر ساعتی', credits: 5, price: 9900000, was: 11000000, days: 60, img: img('action-wide'), perks: ['۱۰٪ ارزان‌تر از رزرو تکی', 'قابل استفاده برای بازی باز', '۶۰ روز اعتبار'] },
  { id: 'p10', kind: 'credit', name: 'پکیج ۱۰ سانس', sub: '۱۰ سانس ۹۰ دقیقه‌ای · هر ساعتی', credits: 10, price: 18700000, was: 22000000, days: 120, img: img('four-women'), perks: ['۱۵٪ ارزان‌تر', 'هدیه: یک قوطی توپ', '۱۲۰ روز اعتبار'], tag: 'پرفروش' },
  { id: 'gold', kind: 'member', name: 'عضویت طلایی', sub: 'ماهانه', off: 0.15, price: 2900000, days: 30, img: img('reach'), perks: ['۱۵٪ تخفیف همه‌ی رزروها', 'رزرو تا ۱۴ روز جلوتر', '۲ برابر امتیاز XP'] },
  { id: 'black', kind: 'member', name: 'عضویت بلک', sub: 'سه‌ماهه', off: 0.25, price: 7400000, days: 90, img: img('hit'), perks: ['۲۵٪ تخفیف همه‌ی رزروها', 'اولویت در تورنمنت‌ها', '۲ برابر XP + کمد اختصاصی'], tag: 'VIP' },
]
export const packageById = (id) => PACKAGES.find((p) => p.id === id)

// ---------- فروشگاه ----------
export const CATEGORIES = [
  { id: 'all', name: 'همه' },
  { id: 'racket', name: 'راکت' },
  { id: 'shoes', name: 'کفش' },
  { id: 'apparel', name: 'لباس' },
  { id: 'balls', name: 'توپ' },
  { id: 'bags', name: 'ساک' },
  { id: 'acc', name: 'لوازم جانبی' },
]
const S = ['S', 'M', 'L', 'XL']
const SHOE = ['۳۹', '۴۰', '۴۱', '۴۲', '۴۳', '۴۴', '۴۵']
export const PRODUCTS = [
  { id: 'r1', cat: 'racket', brand: 'Volt', name: 'راکت Volt Carbon 18K', price: 14900000, was: 16900000, img: img('racket-orange'), rating: 4.9, reviews: 64, tag: 'پرفروش', stock: 6, gender: 'unisex', level: 'پیشرفته', desc: 'قاب کربن ۱۸K با تعادل بالا برای ضربه‌های قدرتی؛ مناسب اسمش و ویبورا.', specs: [['وزن', '۳۶۵ گرم'], ['شکل', 'الماسی'], ['هسته', 'EVA سخت'], ['تعادل', 'بالا']] },
  { id: 'r2', cat: 'racket', brand: 'Nordic', name: 'راکت Nordic Control', price: 9800000, img: img('racket-ball'), rating: 4.7, reviews: 41, stock: 9, gender: 'unisex', level: 'متوسط', desc: 'سر گرد و نقطه‌ی شیرین بزرگ؛ کنترل و دقت برای بازیکن‌های متوسط.', specs: [['وزن', '۳۵۵ گرم'], ['شکل', 'گرد'], ['هسته', 'EVA نرم'], ['تعادل', 'پایین']] },
  { id: 'r3', cat: 'racket', brand: 'Atlas', name: 'راکت Atlas Hybrid', price: 7400000, was: 8200000, img: img('rackets'), rating: 4.6, reviews: 28, tag: 'تخفیف', stock: 4, gender: 'unisex', level: 'مبتدی', desc: 'سبک و بخشنده؛ بهترین شروع برای سال اول پدل.', specs: [['وزن', '۳۴۵ گرم'], ['شکل', 'قطره‌ای'], ['هسته', 'فوم'], ['تعادل', 'متوسط']] },
  { id: 'r4', cat: 'racket', brand: 'Volt', name: 'راکت Volt Shadow', price: 12600000, img: img('hit'), rating: 4.8, reviews: 19, tag: 'جدید', stock: 3, gender: 'unisex', level: 'پیشرفته', desc: 'نسخه‌ی مشکی محدود؛ سطح زبر سه‌بعدی برای اسپین بیشتر.', specs: [['وزن', '۳۶۰ گرم'], ['شکل', 'قطره‌ای'], ['هسته', 'EVA'], ['سطح', 'زبر 3D']] },
  { id: 'r5', cat: 'racket', brand: 'Atlas', name: 'راکت Atlas Red Pro', price: 8900000, img: img('racket-red'), rating: 4.5, reviews: 22, stock: 7, gender: 'unisex', level: 'متوسط', desc: 'تعادل همه‌کاره بین قدرت و کنترل.', specs: [['وزن', '۳۵۸ گرم'], ['شکل', 'قطره‌ای'], ['هسته', 'EVA'], ['تعادل', 'متوسط']] },
  { id: 's1', cat: 'shoes', brand: 'Wilson', name: 'کفش Wilson Rush Pro', price: 8600000, img: img('shoe-wilson'), rating: 4.8, reviews: 37, tag: 'پرفروش', stock: 12, gender: 'unisex', sizes: SHOE, desc: 'زیره‌ی هرینگ‌بون برای چمن مصنوعی و شن؛ ثبات در حرکات جانبی.', specs: [['زیره', 'هرینگ‌بون'], ['کاربرد', 'چمن / شن'], ['وزن', '۳۶۰ گرم']] },
  { id: 's2', cat: 'shoes', brand: 'Asics', name: 'کفش Asics Gel-Court', price: 7900000, was: 8900000, img: img('shoe-asics'), rating: 4.7, reviews: 52, tag: 'تخفیف', stock: 8, gender: 'women', sizes: SHOE.slice(0, 5), desc: 'ژل ضربه‌گیر پاشنه و رویه‌ی تنفسی؛ سبک برای بازی‌های طولانی.', specs: [['زیره', 'Omni'], ['ضربه‌گیر', 'GEL'], ['وزن', '۳۱۰ گرم']] },
  { id: 's3', cat: 'shoes', brand: 'Atlas', name: 'کفش Atlas Clay Grip', price: 6400000, img: img('shoe-black'), rating: 4.5, reviews: 18, stock: 5, gender: 'men', sizes: SHOE.slice(2), desc: 'چسبندگی بالا روی کورت شنی؛ پنجه‌ی تقویت‌شده.', specs: [['زیره', 'Clay'], ['کاربرد', 'شن'], ['وزن', '۳۸۰ گرم']] },
  { id: 'a1', cat: 'apparel', brand: 'Quadra', name: 'تی‌شرت کوادرا Club', price: 1900000, art: { type: 'tee', color: '#141413' }, colors: [{ n: 'مشکی', c: '#141413' }, { n: 'سفید', c: '#F4F2EC' }, { n: 'فیروزه‌ای', c: '#19C9C1' }], rating: 4.9, reviews: 88, tag: 'جدید', stock: 40, gender: 'unisex', sizes: S, desc: 'پارچه‌ی دری‌فیت سبک با لوگوی کوادرا؛ لباس رسمی باشگاه.', specs: [['جنس', 'پلی‌استر دری‌فیت'], ['فرم', 'Regular']] },
  { id: 'a2', cat: 'apparel', brand: 'Quadra', name: 'پولو کوادرا Pro', price: 2400000, art: { type: 'polo', color: '#F4F2EC' }, colors: [{ n: 'سفید', c: '#F4F2EC' }, { n: 'مشکی', c: '#141413' }], rating: 4.7, reviews: 31, stock: 22, gender: 'men', sizes: S, desc: 'یقه‌دار، خنک و رسمی برای تورنمنت‌ها.', specs: [['جنس', 'پنبه + الاستان'], ['فرم', 'Slim']] },
  { id: 'a3', cat: 'apparel', brand: 'Quadra', name: 'شلوارک کوادرا Court', price: 1600000, art: { type: 'shorts', color: '#24344F' }, colors: [{ n: 'سرمه‌ای', c: '#24344F' }, { n: 'مشکی', c: '#141413' }], rating: 4.6, reviews: 26, stock: 18, gender: 'men', sizes: S, desc: 'جیب توپ کناری و کش راحت.', specs: [['جنس', 'پلی‌استر'], ['جیب', 'دو جیب توپ']] },
  { id: 'a4', cat: 'apparel', brand: 'Quadra', name: 'دامن‌شلوارک کوادرا', price: 1750000, art: { type: 'skirt', color: '#19C9C1' }, colors: [{ n: 'فیروزه‌ای', c: '#19C9C1' }, { n: 'سفید', c: '#F4F2EC' }, { n: 'مشکی', c: '#141413' }], rating: 4.8, reviews: 34, stock: 14, gender: 'women', sizes: S.slice(0, 3), desc: 'شلوارک داخلی با جیب توپ؛ حرکت آزاد.', specs: [['جنس', 'پلی‌استر + اسپندکس']] },
  { id: 'a5', cat: 'apparel', brand: 'Quadra', name: 'هودی کوادرا Night', price: 3200000, was: 3600000, art: { type: 'hoodie', color: '#141413' }, colors: [{ n: 'مشکی', c: '#141413' }, { n: 'طوسی', c: '#9A988F' }], rating: 4.9, reviews: 47, tag: 'تخفیف', stock: 9, gender: 'unisex', sizes: S, desc: 'هودی گرم برای بعد از بازی‌های شبانه‌ی زمین ۴.', specs: [['جنس', 'پنبه ۸۰٪'], ['فرم', 'Oversize']] },
  { id: 'a6', cat: 'apparel', brand: 'Quadra', name: 'کلاه کوادرا Cap', price: 900000, art: { type: 'cap', color: '#F4F2EC' }, colors: [{ n: 'سفید', c: '#F4F2EC' }, { n: 'مشکی', c: '#141413' }, { n: 'فیروزه‌ای', c: '#19C9C1' }], rating: 4.6, reviews: 52, stock: 30, gender: 'unisex', desc: 'نقاب سبک و تنفسی، بند قابل تنظیم.', specs: [['جنس', 'پلی‌استر سوراخ‌دار']] },
  { id: 'b1', cat: 'balls', brand: 'Volt', name: 'توپ پدل Volt Pro — قوطی ۳تایی', price: 650000, img: img('ball-tubes'), rating: 4.8, reviews: 120, tag: 'پرفروش', stock: 80, gender: 'unisex', desc: 'توپ رسمی تورنمنت‌های کوادرا؛ فشار پایدار.', specs: [['تعداد', '۳ عدد'], ['فشار', 'استاندارد']] },
  { id: 'b2', cat: 'balls', brand: 'Nordic', name: 'توپ Nordic Speed', price: 520000, img: img('ball-one'), rating: 4.5, reviews: 44, stock: 50, gender: 'unisex', desc: 'سرعت بیشتر برای زمین‌های سرپوشیده.', specs: [['تعداد', '۳ عدد'], ['کاربرد', 'سرپوشیده']] },
  { id: 'b3', cat: 'balls', brand: 'Volt', name: 'کارتن توپ Volt — ۲۴ قوطی', price: 13900000, was: 15600000, img: img('ball-close'), rating: 4.9, reviews: 12, tag: 'تخفیف', stock: 6, gender: 'unisex', desc: 'برای تیم‌ها و مربی‌ها؛ ۷۲ توپ.', specs: [['تعداد', '۷۲ عدد']] },
  { id: 'g1', cat: 'bags', brand: 'Quadra', name: 'ساک راکت کوادرا Tour', price: 4200000, art: { type: 'bag', color: '#141413' }, colors: [{ n: 'مشکی', c: '#141413' }, { n: 'فیروزه‌ای', c: '#19C9C1' }], rating: 4.8, reviews: 29, tag: 'جدید', stock: 7, gender: 'unisex', desc: 'جای ۳ راکت، جیب حرارتی و جای کفش جدا.', specs: [['ظرفیت', '۳ راکت'], ['جیب کفش', 'دارد']] },
  { id: 'g2', cat: 'bags', brand: 'Quadra', name: 'کوله کوادرا Daily', price: 2600000, art: { type: 'backpack', color: '#9A988F' }, colors: [{ n: 'طوسی', c: '#9A988F' }, { n: 'مشکی', c: '#141413' }], rating: 4.6, reviews: 15, stock: 11, gender: 'unisex', desc: 'کوله‌ی روزمره با جای یک راکت.', specs: [['ظرفیت', '۲۵ لیتر']] },
  { id: 'x1', cat: 'acc', brand: 'Volt', name: 'اورگریپ Volt — بسته ۳تایی', price: 380000, art: { type: 'grip', color: '#19C9C1' }, colors: [{ n: 'فیروزه‌ای', c: '#19C9C1' }, { n: 'سفید', c: '#F4F2EC' }, { n: 'مشکی', c: '#141413' }], rating: 4.7, reviews: 96, stock: 60, gender: 'unisex', desc: 'جذب عرق و چسبندگی بالا.', specs: [['تعداد', '۳ عدد']] },
  { id: 'x2', cat: 'acc', brand: 'Quadra', name: 'مچ‌بند کوادرا — جفت', price: 290000, art: { type: 'band', color: '#141413' }, colors: [{ n: 'مشکی', c: '#141413' }, { n: 'فیروزه‌ای', c: '#19C9C1' }], rating: 4.5, reviews: 40, stock: 45, gender: 'unisex', desc: 'حوله‌ای نرم با لوگوی بافته‌شده.', specs: [['تعداد', '۲ عدد']] },
  { id: 'x3', cat: 'acc', brand: 'Quadra', name: 'قمقمه‌ی حرارتی کوادرا', price: 850000, art: { type: 'bottle', color: '#19C9C1' }, colors: [{ n: 'فیروزه‌ای', c: '#19C9C1' }, { n: 'مشکی', c: '#141413' }, { n: 'سفید', c: '#F4F2EC' }], rating: 4.9, reviews: 58, tag: 'پرفروش', stock: 25, gender: 'unisex', desc: '۷۵۰ میلی‌لیتر؛ ۱۲ ساعت سرد.', specs: [['حجم', '۷۵۰ml'], ['جنس', 'استیل']] },
  { id: 'x4', cat: 'acc', brand: 'Quadra', name: 'حوله‌ی ورزشی کوادرا', price: 690000, art: { type: 'towel', color: '#F4F2EC' }, colors: [{ n: 'سفید', c: '#F4F2EC' }, { n: 'مشکی', c: '#141413' }], rating: 4.6, reviews: 21, stock: 2, gender: 'unisex', desc: 'میکروفایبر، سریع‌خشک.', specs: [['ابعاد', '۴۰×۸۰']] },
]
export const productById = (id) => PRODUCTS.find((p) => p.id === id)
export const BRANDS = [...new Set(PRODUCTS.map((p) => p.brand))]

// ---------- ابزار ----------
export function hash(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) }
  return (h >>> 0) / 4294967295
}
export const fa = (n) => Number(n).toLocaleString('fa-IR')
export const toman = (n) => fa(Math.round(n / 1000) * 1000) + ' تومان'
export const mil = (n) => (n >= 1e9 ? fa(+(n / 1e9).toFixed(2)) + ' میلیارد' : fa(+(n / 1e6).toFixed(1)) + ' میلیون') + ' تومان'
export const short = (n) => (n >= 1e9 ? fa(+(n / 1e9).toFixed(1)) + ' میلیارد' : n >= 1e6 ? fa(+(n / 1e6).toFixed(1)) + ' م' : fa(n))
export function hourLabel(h) {
  const hh = Math.floor(h) % 24, mm = h % 1 ? '۳۰' : '۰۰'
  return `${fa(hh).padStart(2, '۰')}:${mm}`
}
export const range = (s, d) => `${hourLabel(s)}–${hourLabel(s + d)}`

export function nextDays(n = 14, from = 0) {
  const out = []
  const base = new Date(); base.setHours(0, 0, 0, 0)
  for (let i = from; i < from + n; i++) { const d = new Date(base); d.setDate(base.getDate() + i); out.push(d) }
  return out
}
export const dayKey = (d) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
export const todayKey = () => dayKey(new Date())
export const fromKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d) }
export const addDays = (k, n) => { const d = fromKey(k); d.setDate(d.getDate() + n); return dayKey(d) }
const wd = new Intl.DateTimeFormat('fa-IR', { weekday: 'long' })
const wds = new Intl.DateTimeFormat('fa-IR', { weekday: 'short' })
const dm = new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'long' })
const dn = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' })
export const weekday = (d) => wd.format(d)
export const weekdayShort = (d) => wds.format(d)
export const dayNum = (d) => dn.format(d)
export const dayMonth = (d) => dm.format(d)
export function dayLabel(d) {
  if (typeof d === 'string') d = fromKey(d)
  const t = new Date(); t.setHours(0, 0, 0, 0)
  const diff = Math.round((d - t) / 864e5)
  if (diff === 0) return 'امروز'
  if (diff === 1) return 'فردا'
  if (diff === -1) return 'دیروز'
  return weekday(d)
}
export const isWeekend = (d) => d.getDay() === 4 || d.getDay() === 5
export const daysFromToday = (k) => Math.round((fromKey(k) - fromKey(todayKey())) / 864e5)

export function isPeak(date, h, pricing) {
  return isWeekend(typeof date === 'string' ? fromKey(date) : date) || h >= pricing.peakFrom
}
// قیمت کل زمین برای یک بازه — هر نیم‌ساعت جداگانه حساب می‌شود
export function priceFor(date, start, dur, pricing) {
  let sum = 0
  for (let t = start; t < start + dur; t += 0.5) sum += (isPeak(date, t, pricing) ? pricing.peak : pricing.offpeak) / 2
  return sum
}

// ---------- اعضا ----------
const FIRST = ['آرین', 'نیما', 'سارا', 'مهسا', 'کیان', 'پارسا', 'الناز', 'رها', 'سینا', 'امید', 'تینا', 'بهار', 'ماهان', 'یاسمن', 'دانیال', 'نگار', 'آرمان', 'شیوا', 'پویا', 'هستی', 'رامین', 'لیلا', 'سپهر', 'مریم', 'کامیار', 'ترانه', 'بردیا', 'آیدا']
const LAST = ['کریمی', 'محمدی', 'رضایی', 'نوری', 'صالحی', 'جعفری', 'فرهادی', 'شریفی', 'طاهری', 'بهرامی', 'احمدی', 'موسوی', 'کاظمی', 'یزدانی']
export const MEMBERS = Array.from({ length: 56 }, (_, i) => {
  const r = (k) => hash('m' + i + k)
  const level = LEVELS[Math.min(8, Math.floor(r('lv') * r('lv2') * 9 + r('l3') * 3))].id
  const games = 3 + Math.floor(r('g') * 160)
  return {
    id: 'm' + i,
    name: FIRST[Math.floor(r('f') * FIRST.length)] + ' ' + LAST[Math.floor(r('l') * LAST.length)],
    phone: '0912' + String(1000000 + Math.floor(r('p') * 8999999)),
    level, games, wins: Math.floor(games * (0.3 + r('w') * 0.45)),
    points: levelById(level).base + Math.floor(r('pt') * 240),
    joined: Math.floor(r('j') * 400), last: Math.floor(r('ls') * r('ls2') * 70),
    member: r('mb') < 0.18 ? 'gold' : r('mb') < 0.24 ? 'black' : null,
  }
})
export const memberById = (id) => MEMBERS.find((m) => m.id === id)

// ---------- رویدادها ----------
const EV_NAMES = ['آمریکانوی پنجشنبه', 'مکسیکانوی جمعه', 'کینگ آف کورت', 'جام ماهانه‌ی کوادرا', 'شب میکس دبل']
export function events() {
  return nextDays(21).filter((d) => isWeekend(d)).slice(0, 5).map((d, i) => {
    const r = hash('ev' + dayKey(d))
    const lv = Math.floor(r * 5)
    const cap = i === 3 ? 32 : 16
    return {
      id: 'ev-' + dayKey(d), title: EV_NAMES[i % EV_NAMES.length], date: dayKey(d), start: i === 3 ? 10 : 18, dur: 3,
      levels: LEVELS.slice(lv, lv + 3).map((l) => l.id), cap, taken: Math.floor(cap * (0.4 + hash('tk' + i) * 0.5)),
      fee: i === 3 ? 1500000 : 750000, prize: i === 3 ? 'جایزه‌ی نقدی + جام' : 'راکت Volt + توپ', format: i === 3 ? 'گروهی + حذفی' : 'هر بازی با یار جدید',
      img: [img('four-women'), img('action'), img('reach'), img('action-wide'), img('sitting')][i % 5],
    }
  })
}

// ---------- داده‌ی اولیه‌ی باشگاه (برای پنل مدیر) ----------
const METHODS = ['online', 'online', 'online', 'card', 'cash', 'wallet', 'package']
export const METHOD_NAME = { online: 'درگاه آنلاین', card: 'کارتخوان', cash: 'نقدی', wallet: 'کیف پول', package: 'اعتبار پکیج', 'coach-pack': 'پکیج مربی' }
export const TYPE_NAME = { private: 'رزرو خصوصی', open: 'بازی باز', coach: 'کلاس مربی', event: 'تورنمنت', block: 'تعمیرات' }

export function seedClub() {
  const bookings = []
  const pricing = DEFAULT_PRICING
  const now = new Date()
  for (let d = -27; d <= 13; d++) {
    const k = addDays(todayKey(), d), date = fromKey(k)
    COURTS.forEach((c) => {
      let h = 7
      while (h < 22.5) {
        const r = hash(`s${k}${c.id}${h}`)
        const busyP = (h >= 17 ? 0.62 : h >= 9 && h < 12 ? 0.4 : 0.26) * (isWeekend(date) ? 1.15 : 1) * (d > 3 ? 0.55 : 1)
        if (r > busyP) { h += 0.5; continue }
        const dur = r < busyP * 0.65 ? 1.5 : r < busyP * 0.85 ? 1 : 2
        if (h + dur > 24) break
        const t = hash(`t${k}${c.id}${h}`)
        const type = t < 0.6 ? 'private' : t < 0.82 ? 'open' : 'coach'
        const m = MEMBERS[Math.floor(hash(`m${k}${c.id}${h}`) * MEMBERS.length)]
        const coach = type === 'coach' ? COACHES[Math.floor(t * 40) % COACHES.length] : null
        const price = type === 'coach' ? coach.price * dur : priceFor(k, h, dur, pricing)
        const past = d < 0 || (d === 0 && h + dur <= now.getHours())
        const players = type === 'open'
          ? Array.from({ length: past ? 4 : 1 + Math.floor(hash(`p${k}${c.id}${h}`) * 3) }, (_, j) => j === 0 ? m.id : MEMBERS[Math.floor(hash(`q${k}${c.id}${h}${j}`) * MEMBERS.length)].id)
          : [m.id]
        const pr = hash(`pay${k}${c.id}${h}`)
        const paid = type === 'open' ? Math.round(price / 4) * players.length : (past ? (pr < 0.95 ? price : 0) : pr < 0.6 ? price : pr < 0.75 ? Math.round(price / 2) : 0)
        const cancelled = hash(`x${k}${c.id}${h}`) < 0.03
        bookings.push({
          id: `b${k}-${c.id}-${h}`, court: c.id, date: k, start: h, dur, type, by: m.id, players,
          levels: type === 'open' ? [m.level, ...nearLevels(m.level, 1)].filter((v, i, a) => a.indexOf(v) === i) : null,
          coach: coach?.id || null, price, paid, method: METHODS[Math.floor(pr * 70) % METHODS.length],
          status: cancelled ? 'cancelled' : 'ok', refunded: cancelled && paid > 0, source: hash('src' + k + h) < 0.8 ? 'app' : 'desk',
          at: fromKey(addDays(k, -1 - Math.floor(pr * 5))).getTime() + 36e5 * 10,
        })
        h += dur + (hash(`g${k}${c.id}${h}`) < 0.5 ? 0 : 0.5)
      }
    })
  }
  // تعمیرات نمونه
  bookings.push({ id: 'blk1', court: 4, date: addDays(todayKey(), 2), start: 7, dur: 3, type: 'block', by: null, players: [], price: 0, paid: 0, status: 'ok', note: 'تعویض چمن مصنوعی', at: Date.now() })

  const orders = Array.from({ length: 34 }, (_, i) => {
    const r = (k) => hash('o' + i + k)
    const n = 1 + Math.floor(r('n') * 3)
    const items = Array.from({ length: n }, (_, j) => {
      const p = PRODUCTS[Math.floor(hash('oi' + i + j) * PRODUCTS.length)]
      return { pid: p.id, qty: 1 + Math.floor(hash('oq' + i + j) * (p.cat === 'balls' ? 3 : 1.2)), price: p.price, size: p.sizes?.[1] || null }
    })
    const ago = Math.floor(r('d') * r('d2') * 28)
    return {
      id: 'Q-' + (1200 + i), by: MEMBERS[Math.floor(r('m') * MEMBERS.length)].id, items,
      total: items.reduce((s, x) => s + x.qty * x.price, 0), method: METHODS[Math.floor(r('pm') * 4)],
      status: ago > 2 ? 'delivered' : ago > 0 ? 'ready' : 'new', at: Date.now() - ago * 864e5 - r('h') * 8 * 36e5,
    }
  })
  const sales = Array.from({ length: 26 }, (_, i) => {
    const r = (k) => hash('ps' + i + k)
    const coach = r('k') < 0.45
    const ago = Math.floor(r('d') * 30)
    if (coach) {
      const c = COACHES[Math.floor(r('c') * COACHES.length)], p = COACH_PACKS[1 + Math.floor(r('p') * 2)]
      return { id: 'S-' + (500 + i), kind: 'coach', item: c.id, pack: p.id, name: `${p.name} · ${c.name}`, by: MEMBERS[Math.floor(r('m') * MEMBERS.length)].id, price: coachPackPrice(c, p), method: 'online', at: Date.now() - ago * 864e5 }
    }
    const p = PACKAGES[Math.floor(r('p') * PACKAGES.length)]
    return { id: 'S-' + (500 + i), kind: 'package', item: p.id, name: p.name, by: MEMBERS[Math.floor(r('m') * MEMBERS.length)].id, price: p.price, method: r('pm') < 0.7 ? 'online' : 'card', at: Date.now() - ago * 864e5 }
  })
  const stock = Object.fromEntries(PRODUCTS.map((p) => [p.id, p.stock]))
  return { v: 4, pricing, off: {}, bookings, orders, sales, stock, expenses: [] }
}

// ---------- گیمیفیکیشن ----------
export const RANKS = [
  { name: 'برنز', xp: 0, c: '#B07A4E' },
  { name: 'نقره', xp: 150, c: '#9A9A9A' },
  { name: 'طلا', xp: 400, c: '#C9A227' },
  { name: 'پلاتین', xp: 800, c: '#5FB9B4' },
  { name: 'الماس', xp: 1400, c: '#19C9C1' },
  { name: 'افسانه‌ی کوادرا', xp: 2200, c: '#141413' },
]
export function rankOf(xp) {
  let i = 0
  while (i < RANKS.length - 1 && xp >= RANKS[i + 1].xp) i++
  const cur = RANKS[i], next = RANKS[i + 1]
  return { index: i, ...cur, next, progress: next ? (xp - cur.xp) / (next.xp - cur.xp) : 1 }
}

export const BADGES = [
  { id: 'first', icon: '🎾', name: 'اولین سرو', desc: 'اولین رزروت رو زدی' },
  { id: 'host', icon: '📣', name: 'بازی‌ساز', desc: 'یه بازی باز ساختی' },
  { id: 'social', icon: '🤝', name: 'رفیق‌باز', desc: 'به بازی دیگران پیوستی' },
  { id: 'squad', icon: '🧩', name: 'تیم کامل', desc: 'هر چهار جای بازی پر شد' },
  { id: 'quad', icon: '4️⃣', name: 'کوادرا', desc: 'روی هر ۴ زمین بازی کردی' },
  { id: 'early', icon: '🌅', name: 'سحرخیز', desc: 'بازی قبل از ۹ صبح' },
  { id: 'night', icon: '🌙', name: 'شب‌زنده‌دار', desc: 'بازی بعد از ۲۲' },
  { id: 'student', icon: '🧢', name: 'شاگرد', desc: 'اولین کلاس با مربی' },
  { id: 'champ', icon: '🏆', name: 'اهل رقابت', desc: 'ثبت‌نام در تورنمنت' },
  { id: 'shopper', icon: '🛍', name: 'خوش‌تیپ', desc: 'اولین خرید از فروشگاه' },
  { id: 'loyal', icon: '💎', name: 'وفادار', desc: 'پکیج یا عضویت خریدی' },
]

export const CREDITS = [
  'Unsplash — padel photos (Unsplash License)',
  'Nenad Stojković — padel courts aerial (CC BY 2.0, Wikimedia Commons)',
  'Samson Ssemakadde — padel court (CC0, Wikimedia Commons)',
  'Ainali — outdoor padel court Mariestad (CC BY-SA 4.0, Wikimedia Commons)',
  'SG Padel — Mejorset panoramic padel court (CC BY-SA 4.0, Wikimedia Commons)',
  'Wilson Rush Pro tennis shoes (CC BY-SA 4.0, Wikimedia Commons)',
  'Asics Gel Court Bella Femme (CC BY-SA 4.0, Wikimedia Commons)',
  'ChaussuresTennis (CC BY-SA 4.0, Wikimedia Commons)',
  'Cmglee — tennis balls (CC BY-SA 4.0, Wikimedia Commons)',
  'A type of tennis ball; Closeup of a tennis ball (CC0, Wikimedia Commons)',
]
