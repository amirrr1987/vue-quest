import type { CompactTopic } from '../compact'
import { cs, cm, ct } from './_helpers'

const topics = (items: CompactTopic[]) => items

export const javascriptNewTopics = topics([
  {
    slug: 'bigint-symbol',
    foundation: cs(
      'کدام نوع برای اعداد خیلی بزرگ‌تر از Number.MAX_SAFE_INTEGER مناسب است؟',
      'a',
      [
        ['a', 'bigint'],
        ['b', 'number'],
        ['c', 'string only'],
      ],
      'bigint با پسوند n یا BigInt() ساخته می‌شود.',
    ),
    intermediate: cm(
      'کدام primitiveها ES2020+ هستند یا مرتبط؟',
      ['a', 'c'],
      [
        ['a', 'bigint'],
        ['b', 'object'],
        ['c', 'symbol'],
        ['d', 'function'],
      ],
      'function نوع primitive نیست؛ object است.',
    ),
    advanced: ct(
      'symbolها برای کلیدهای property یکتا و مخفی از for...in مناسب‌اند.',
      true,
      'Symbol.iterator و metadata رایج است.',
    ),
    expert: cs(
      'مقایسه `typeof 1n` چیست؟',
      'a',
      [
        ['a', 'bigint'],
        ['b', 'number'],
        ['c', 'object'],
      ],
      'bigint نوع جداگانه دارد.',
    ),
    cto: cs(
      'در API مالی سازمانی چرا bigint/string decimal ترجیح داده می‌شود؟',
      'a',
      [
        ['a', 'دقت عددی و جلوگیری از خطای float'],
        ['b', 'سرعت بیشتر همیشه'],
        ['c', 'سادگی JSON'],
      ],
      'IEEE float برای پول خطرناک است؛ قرارداد decimal لازم است.',
    ),
  },
  {
    slug: 'weakmap-weakset',
    foundation: cs(
      'WeakMap کلیدها را چگونه نگه می‌دارد؟',
      'a',
      [
        ['a', 'weak reference به object'],
        ['b', 'string copy'],
        ['c', 'index number'],
      ],
      'بدون reference قوی، entry جمع‌آوری می‌شود.',
    ),
    intermediate: ct('WeakMap قابل iterate با forEach سراسری نیست.', true, 'API عمداً محدود است.'),
    advanced: cm(
      'کاربرد WeakMap/WeakSet؟',
      ['a', 'b'],
      [
        ['a', 'metadata روی DOM node'],
        ['b', 'cache وابسته به object بدون leak'],
        ['c', 'ذخیره token در localStorage'],
        ['d', 'لیست همه کاربران'],
      ],
      'برای داده سراسری از Map استفاده کن.',
    ),
    expert: cs(
      'FinalizationRegistry برای چیست؟',
      'a',
      [
        ['a', 'callback هنگام GC object'],
        ['b', 'deep clone'],
        ['c', 'Promise.all'],
      ],
      'برای cleanup resource وابسته به object.',
    ),
    cto: cs(
      'چرا cache سراسری بدون TTL در SPA طولانی خطرناک است؟',
      'a',
      [
        ['a', 'memory leak و داده کهنه'],
        ['b', 'فقط IE'],
        ['c', 'مشکلی ندارد'],
      ],
      'سیاست eviction و weak ref بخش architecture است.',
    ),
  },
  {
    slug: 'proxy-reflect',
    foundation: cs(
      'Proxy چه کاری می‌کند؟',
      'a',
      [
        ['a', 'trap روی عملیات object'],
        ['b', 'HTTP proxy'],
        ['c', 'CSS'],
      ],
      'با handler.get/set و غیره intercept می‌شود.',
    ),
    intermediate: ct('Reflect متدهایی متناظر با trapهای Proxy دارد.', true, 'Reflect.get و غیره استاندارد است.'),
    advanced: singleProxyExpert(),
    expert: cm(
      'موارد استفاده Proxy در کتابخانه‌ها؟',
      ['a', 'b', 'd'],
      [
        ['a', 'reactive system (Vue)'],
        ['b', 'validation/lazy property'],
        ['c', 'جایگزین SQL'],
        ['d', 'observable immutable draft'],
      ],
      'Proxy پایه reactivity مدرن است.',
    ),
    cto: cs(
      'چرا Proxy روی objectهای third-party ناشناس خطرناک است؟',
      'a',
      [
        ['a', 'شکستن invariant و perf غیرقابل پیش‌بینی'],
        ['b', 'همیشه امن'],
        ['c', 'فقط Safari'],
      ],
      'boundary و copy امن قبل از wrap.',
    ),
  },
  {
    slug: 'regex-unicode',
    foundation: cs(
      'flag `u` در RegExp چه می‌دهد؟',
      'a',
      [
        ['a', 'unicode code point'],
        ['b', 'uppercase'],
        ['c', 'ungreedy only'],
      ],
      'u برای surrogate pair و \\p{...} لازم است.',
    ),
    intermediate: cm(
      'کدام RegExp flagها رایج‌اند؟',
      ['a', 'b', 'd'],
      [
        ['a', 'g global'],
        ['b', 'i ignoreCase'],
        ['c', 'x xml'],
        ['d', 'm multiline'],
      ],
      'flag x در JS استاندارد نیست.',
    ),
    advanced: ct('lookbehind (?<=...) در JS مدرن پشتیبانی می‌شود.', true, 'ES2018 اضافه شد.'),
    expert: cs(
      'catastrophic backtracking چیست؟',
      'a',
      [
        ['a', 'regex پیچیده روی ورودی بلند CPU می‌خورد'],
        ['b', 'garbage collection'],
        ['c', 'async deadlock'],
      ],
      'از ReDoS با audit regex و timeout جلوگیری کن.',
    ),
    cto: cs(
      'اعتبارسنجی input با regex در لایه UI کافی است؟',
      'a',
      [
        ['a', 'خیر؛ server-side validation الزامی است'],
        ['b', 'بله همیشه'],
        ['c', 'فقط mobile'],
      ],
      'defense in depth و schema سمت سرور.',
    ),
  },
  {
    slug: 'error-types',
    foundation: cs(
      'برای throw خطای سفارشی از چه استفاده می‌کنیم؟',
      'a',
      [
        ['a', 'class extends Error'],
        ['b', 'string throw only'],
        ['c', 'alert()'],
      ],
      'Error subclass stack trace بهتری دارد.',
    ),
    intermediate: cm(
      'کدام global error hookها وجود دارند؟',
      ['a', 'b'],
      [
        ['a', 'window.onerror'],
        ['b', 'unhandledrejection'],
        ['c', 'onCSS'],
        ['d', 'oncompile'],
      ],
      'Sentry و مشابه روی این‌ها hook می‌زنند.',
    ),
    advanced: ct('AggregateError چند خطا را در Promise.any/all گزارش می‌کند.', true, 'ES2021 برای allSettled/any.'),
    expert: cs(
      'cause chain در Error با option `{ cause }` چه فایده دارد؟',
      'a',
      [
        ['a', 'ردیابی root cause در wrap'],
        ['b', 'حذف stack'],
        ['c', 'فقط TypeScript'],
      ],
      'برای لایه service که خطا wrap می‌کند.',
    ),
    cto: cs(
      'سیاست خطا در frontend platform چه باید شامل شود؟',
      'a',
      [
        ['a', 'taxonomy، correlation id، user message، retry'],
        ['b', 'فقط toast'],
        ['c', 'بدون log'],
      ],
      'یکپارچگی observability cross-team.',
    ),
  },
  {
    slug: 'intl-api',
    foundation: cs(
      'Intl.NumberFormat برای چیست؟',
      'a',
      [
        ['a', 'فرمت عدد و ارز locale-aware'],
        ['b', 'HTTP'],
        ['c', 'regex'],
      ],
      'برای فارسی و RTL در UI مهم است.',
    ),
    intermediate: cs(
      'Intl.DateTimeFormat با timeZone چه می‌کند؟',
      'a',
      [
        ['a', 'نمایش زمان در zone مشخص'],
        ['b', 'تغییر سرور UTC'],
        ['c', 'حذف Date'],
      ],
      'همیشه UTC در wire و format در UI.',
    ),
    advanced: ct('Intl.RelativeTimeFormat برای «۲ ساعت پیش» استفاده می‌شود.', true, 'جایگزین دستی fragile است.'),
    expert: cm(
      'چرا hardcode فرمت تاریخ در اپ چندزبانه بد است؟',
      ['a', 'b'],
      [
        ['a', 'ناسازگاری locale'],
        ['b', 'نگهداری سخت'],
        ['c', 'سریع‌تر همیشه'],
        ['d', 'مشکل compliance گزارش'],
      ],
      'centralize formatting در utility.',
    ),
    cto: cs(
      'استراتژی i18n در مقیاس enterprise؟',
      'a',
      [
        ['a', 'ICU messages، fallback locale، QA ترجمه'],
        ['b', 'فقط فارسی'],
        ['c', 'Google Translate در prod'],
      ],
      'قرارداد key و pipeline ترجمه.',
    ),
  },
])

function singleProxyExpert() {
  return cs(
    'کدام trap برای log کردن همه setها استفاده می‌شود؟',
    'a',
    [
      ['a', 'set'],
      ['b', 'apply only'],
      ['c', 'construct only'],
    ],
    'get/set/has و غیره قابل intercept هستند.',
  )
}

// Additional 18 topics in part 2 - export merged
export const javascriptNewTopics2 = topics([
  {
    slug: 'array-buffer',
    foundation: cs(
      'ArrayBuffer چیست؟',
      'a',
      [
        ['a', 'حافظه خام باینری'],
        ['b', 'آرایه string'],
        ['c', 'DOM'],
      ],
      'TypedArray نمای روی buffer است.',
    ),
    intermediate: cm(
      'TypedArrayهای رایج؟',
      ['a', 'b', 'd'],
      [
        ['a', 'Uint8Array'],
        ['b', 'Float32Array'],
        ['c', 'StringArray'],
        ['d', 'BigInt64Array'],
      ],
      'StringArray نوع استاندارد نیست.',
    ),
    advanced: ct('DataView برای endianness کنترل‌شده استفاده می‌شود.', true, 'برای پروتکل باینری.'),
    expert: cs(
      'Transferable در postMessage چه می‌کند؟',
      'a',
      [
        ['a', 'مالکیت buffer را منتقل می‌کند'],
        ['b', 'deep copy'],
        ['c', 'حذف Worker'],
      ],
      'بدون copy هزینه؛ buffer در فرستنده detached می‌شود.',
    ),
    cto: cs(
      'پردازش فایل بزرگ در مرورگر؟',
      'a',
      [
        ['a', 'chunk + Worker + stream'],
        ['b', 'read همه در RAM'],
        ['c', 'sync XMLHttpRequest'],
      ],
      'memory budget و progressive UX.',
    ),
  },
  {
    slug: 'fetch-stream',
    foundation: cs(
      'fetch() چه برمی‌گرداند؟',
      'a',
      [
        ['a', 'Promise<Response>'],
        ['b', 'string body'],
        ['c', 'XMLHttpRequest'],
      ],
      'body با .json() یا .text() خوانده می‌شود.',
    ),
    intermediate: ct('Response.body می‌تواند ReadableStream باشد.', true, 'برای stream دانلود/پردازش.'),
    advanced: cs(
      'AbortSignal.timeout(ms) چه می‌کند؟',
      'a',
      [
        ['a', 'درخواست را پس از ms لغو می‌کند'],
        ['b', 'retry خودکار'],
        ['c', 'cache'],
      ],
      'همراه AbortController برای UX timeout.',
    ),
    expert: cm(
      'کدام headerها توسط JS set نمی‌شوند (forbidden)؟',
      ['a', 'b'],
      [
        ['a', 'Host'],
        ['b', 'Cookie (محدود)'],
        ['c', 'X-Custom-App'],
        ['d', 'Content-Type (بعضی caseها)'],
      ],
      'امنیت مرورگر محدودیت دارد.',
    ),
    cto: cs(
      'BFF vs direct browser-to-microservice؟',
      'a',
      [
        ['a', 'BFF برای تجمیع، auth و کاهش surface'],
        ['b', 'همیشه ۲۰ سرویس از مرورگر'],
        ['c', 'بدون CORS'],
      ],
      'architecture امنیت و operability.',
    ),
  },
  {
    slug: 'class-private',
    foundation: cs(
      'فیلد private در class با چه syntax؟',
      'a',
      [
        ['a', '#field'],
        ['b', 'private field'],
        ['c', '_underscore only'],
      ],
      '# واقعاً private در runtime است.',
    ),
    intermediate: ct('static block در class برای init static مجاز است.', true, 'ES2022.'),
    advanced: cs(
      'تفاوت #private و WeakMap encapsulation؟',
      'a',
      [
        ['a', '# زبان‌محور و سریع‌تر برای encapsulation ساده'],
        ['b', 'یکی هستند'],
        ['c', '# public است'],
      ],
      'WeakMap برای metadata روی instance خارجی.',
    ),
    expert: cm(
      'کدام OOP در JS درست است؟',
      ['a', 'b'],
      [
        ['a', 'prototype chain inheritance'],
        ['b', 'composition ترجیح بر deep hierarchy'],
        ['c', 'multiple class inheritance native'],
        ['d', 'mixin با Object.assign محدود'],
      ],
      'multiple inheritance native نیست.',
    ),
    cto: cs(
      'Domain model در frontend تا کجا باید برود؟',
      'a',
      [
        ['a', 'view model نزد UI؛ business سنگین سمت server'],
        ['b', 'همه rule در component'],
        ['c', 'بدون model'],
      ],
      'جلوگیری از duplicate logic.',
    ),
  },
  {
    slug: 'functional-hof',
    foundation: cs(
      'تابع higher-order چیست؟',
      'a',
      [
        ['a', 'تابعی که تابع می‌گیرد یا برمی‌گرداند'],
        ['b', 'فقط async'],
        ['c', 'static method'],
      ],
      'map/filter/reduce نمونه‌اند.',
    ),
    intermediate: cm(
      'کدام متد آرایه functional است؟',
      ['a', 'b', 'c'],
      [
        ['a', 'reduce'],
        ['b', 'map'],
        ['c', 'filter'],
        ['d', 'sort in-place همیشه pure'],
      ],
      'sort mutate می‌کند مگر copy قبلش.',
    ),
    advanced: cs(
      'currying چه فایده‌ای دارد؟',
      'a',
      [
        ['a', 'partial application و reuse'],
        ['b', 'سرعت V8'],
        ['c', 'حذف closure'],
      ],
      'در utility و FP سبک.',
    ),
    expert: ct('تابع pure به side effect بیرونی وابسته نیست.', true, 'تست و reasoning آسان‌تر.'),
    cto: cs(
      'Ramda/lodash در codebase بزرگ؟',
      'a',
      [
        ['a', 'tree-shake و subset تأییدشده؛ پرهیز از import کل'],
        ['b', 'import * همیشه'],
        ['c', 'ممنوعیت کامل'],
      ],
      'bundle budget و consistency.',
    ),
  },
  {
    slug: 'memory-gc',
    foundation: ct('JavaScript با mark-and-sweep GC حافظه را آزاد می‌کند.', true, 'reference counting کامل نیست.'),
    intermediate: cs(
      'closure چه زمانی leak ایجاد می‌کند؟',
      'a',
      [
        ['a', 'نگه داشتن reference به scope بزرگ در listener طولانی'],
        ['b', 'همیشه'],
        ['c', 'هرگز'],
      ],
      'detach listener و null کردن ref.',
    ),
    advanced: cm(
      'علائم memory leak در SPA؟',
      ['a', 'b', 'd'],
      [
        ['a', 'رشد مداوم heap'],
        ['b', 'کندی تدریجی'],
        ['c', 'کاهش bundle'],
        ['d', 'Detached DOM nodes در heap snapshot'],
      ],
      'Chrome Memory profiler.',
    ),
    expert: cs(
      'چرا retain کردن همه log در state بد است؟',
      'a',
      [
        ['a', 'مصرف RAM و GC pressure'],
        ['b', 'سریع‌تر'],
        ['c', 'امنیت بیشتر'],
      ],
      'ring buffer یا pagination log.',
    ),
    cto: cs(
      'بودجه memory در mobile web؟',
      'a',
      [
        ['a', 'profiling دوره‌ای و حذف cache بی‌پایان'],
        ['b', 'نامحدود'],
        ['c', 'فقط desktop'],
      ],
      'SLO perf شامل low-end devices.',
    ),
  },
  {
    slug: 'security-xss',
    foundation: cs(
      'XSS چیست؟',
      'a',
      [
        ['a', 'اجرای script مخرب در context کاربر'],
        ['b', 'SQL injection'],
        ['c', 'DDoS only'],
      ],
      'escape/sanitize و CSP کمک می‌کند.',
    ),
    intermediate: ct('innerHTML با input کاربر بدون sanitize خطرناک است.', true, 'textContent یا sanitizer.'),
    advanced: cs(
      'Content-Security-Policy چه می‌کند؟',
      'a',
      [
        ['a', 'محدودیت منبع script/style'],
        ['b', 'رمزنگاری disk'],
        ['c', 'حذف HTTPS'],
      ],
      'nonce/hash برای inline مجاز.',
    ),
    expert: cm(
      'ذخیره token در localStorage ریسک؟',
      ['a', 'b'],
      [
        ['a', 'دسترسی XSS به token'],
        ['b', 'httpOnly cookie امن‌تر در face XSS'],
        ['c', 'همیشه بی‌خطر'],
        ['d', 'بدون threat model'],
      ],
      'refresh rotation و secure cookie.',
    ),
    cto: cs(
      'Security review frontend چه چیزهایی را چک می‌کند؟',
      'a',
      [
        ['a', 'CSP، dependency audit، secrets، auth flow'],
        ['b', 'فقط رنگ دکمه'],
        ['c', 'فقط E2E'],
      ],
      'shift-left و SCA در CI.',
    ),
  },
])

export const allJavascriptNewTopics = [...javascriptNewTopics, ...javascriptNewTopics2]
