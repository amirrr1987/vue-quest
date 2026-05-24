import type { CompactTopic } from '../compact'
import { cs, cm, ct } from './_helpers'

export const javascriptExtraTopics: CompactTopic[] = [
  {
    slug: 'coercion-equality',
    foundation: cs(
      '`[] == false` نتیجه چیست؟',
      'a',
      [
        ['a', 'true (با coercion)'],
        ['b', 'false همیشه'],
        ['c', 'SyntaxError'],
      ],
      '== عجیب است؛ === استفاده کن.',
    ),
    intermediate: cm(
      'مقادیر falsy در JS؟',
      ['a', 'b', 'c', 'd'],
      [
        ['a', '0'],
        ['b', '""'],
        ['c', 'null'],
        ['d', 'NaN'],
      ],
      'همچنین false و undefined.',
    ),
    advanced: ct('Object.is(0, -0) برابر false است.', true, '=== آن‌ها را true می‌داند.'),
    expert: cs(
      'چرا lint eqeqeq توصیه می‌شود؟',
      'a',
      [
        ['a', 'کاهش باگ مقایسه ضمنی'],
        ['b', 'کند کردن'],
        ['c', 'حذف number'],
      ],
      'استثناهای محدود در rule config.',
    ),
    cto: cs(
      'قرارداد مقایسه در تیم؟',
      'a',
      [
        ['a', '=== پیش‌فرض؛ == فقط با comment'],
        ['b', '== همیشه'],
        ['c', 'بدون lint'],
      ],
      'consistency در review.',
    ),
  },
  {
    slug: 'json-serialize',
    foundation: cs(
      'JSON.stringify چه چیزهایی را در object حذف می‌کند؟',
      'a',
      [
        ['a', 'function و undefined'],
        ['b', 'همه number'],
        ['c', 'string'],
      ],
      'Symbol هم در object معمولاً حذف می‌شود.',
    ),
    intermediate: ct('JSON.parse به‌تنهایی Date را revive نمی‌کند.', true, 'reviver یا تبدیل دستی لازم است.'),
    advanced: cs(
      'circular reference در JSON.stringify؟',
      'a',
      [
        ['a', 'TypeError'],
        ['b', 'null خاموش'],
        ['c', 'همیشه موفق'],
      ],
      'از replacer یا ساختار بدون cycle استفاده کن.',
    ),
    expert: cm(
      'محدودیت JSON برای قرارداد API؟',
      ['a', 'b', 'd'],
      [
        ['a', 'bigint قدیماً بدون replacer'],
        ['b', 'undefined در object حذف می‌شود'],
        ['c', 'همیشه بهتر از Protobuf'],
        ['d', 'نیاز به versioning schema'],
      ],
      'برای contract سخت از schema tooling استفاده کن.',
    ),
    cto: cs(
      'سیاست breaking change API عمومی؟',
      'a',
      [
        ['a', 'semver + migration + دوره deprecation'],
        ['b', 'break بدون اطلاع'],
        ['c', 'بدون مستندات'],
      ],
      'consumer-driven contract در سازمان.',
    ),
  },
  {
    slug: 'timers-raf',
    foundation: cs(
      'requestAnimationFrame برای animation چه ventaja دارد؟',
      'a',
      [
        ['a', 'همگام با refresh نمایش'],
        ['b', 'همیشه کندتر از setInterval'],
        ['c', 'فقط در Node'],
      ],
      'برای repaint UI مناسب است.',
    ),
    intermediate: ct('setInterval ممکن است callbackها را روی هم انباشت کند.', true, 'با delta timestamp کنترل کن.'),
    advanced: cs(
      'queueMicrotask چه صفی است؟',
      'a',
      [
        ['a', 'microtask'],
        ['b', 'macrotask'],
        ['c', 'render only'],
      ],
      'بعد از sync code و قبل از macrotask بعدی.',
    ),
    expert: cs(
      'first-input delay به چه ربط دارد؟',
      'a',
      [
        ['a', 'blocking main thread قبل از تعامل اول'],
        ['b', 'فقط DNS'],
        ['c', 'فقط CSS'],
      ],
      'کاهش long task در startup.',
    ),
    cto: cs(
      'بودجه long task در main thread؟',
      'a',
      [
        ['a', 'شکستن کار و اندازه‌گیری RUM'],
        ['b', 'نامحدود'],
        ['c', 'فقط desktop'],
      ],
      'Core Web Vitals در SLO.',
    ),
  },
  {
    slug: 'dom-events',
    foundation: cs(
      'event bubbling یعنی رویداد از کجا به کجا می‌رود؟',
      'a',
      [
        ['a', 'از target به اجداد'],
        ['b', 'از window به target فقط'],
        ['c', 'بدون حرکت'],
      ],
      'capture برعکس است.',
    ),
    intermediate: cs(
      'preventDefault چه می‌کند؟',
      'a',
      [
        ['a', 'عمل پیش‌فرض مرورگر را لغو می‌کند'],
        ['b', 'توقف propagation'],
        ['c', 'حذف listener'],
      ],
      'stopPropagation جدا است.',
    ),
    advanced: ct('passive listener برای scroll/touch نمی‌تواند preventDefault کند.', true, 'برای smooth scroll.'),
    expert: cm(
      'event delegation مزایا؟',
      ['a', 'b', 'd'],
      [
        ['a', 'یک listener برای لیست dynamic'],
        ['b', 'کمتر memory برای item زیاد'],
        ['c', 'همیشه کندتر'],
        ['d', 'ساده‌تر add/remove item'],
      ],
      'الگوی رایج در Vue.',
    ),
    cto: cs(
      'a11y keyboard برای custom control؟',
      'a',
      [
        ['a', 'role، focus، keyboard handler استاندارد'],
        ['b', 'فقط mouse'],
        ['c', 'بدون تست'],
      ],
      'WCAG در acceptance criteria.',
    ),
  },
  {
    slug: 'strict-module',
    foundation: ct('کد داخل ES module به‌صورت strict اجرا می‌شود.', true, 'نیاز به "use strict" جدا نیست.'),
    intermediate: cs(
      'this در strict function call ساده؟',
      'a',
      [
        ['a', 'undefined'],
        ['b', 'window'],
        ['c', 'global object همیشه'],
      ],
      'در sloppy به global bind می‌شد.',
    ),
    advanced: cm(
      'تفاوت script type=module و classic؟',
      ['a', 'b', 'd'],
      [
        ['a', 'defer پیش‌فرض module'],
        ['b', 'scope module جدا'],
        ['c', 'import در classic native'],
        ['d', 'strict در module'],
      ],
      'classic می‌تواند global pollution داشته باشد.',
    ),
    expert: cs(
      'eval در codebase production؟',
      'a',
      [
        ['a', 'ممنوع؛ CSP و امنیت'],
        ['b', 'توصیه‌شده'],
        ['c', 'برای perf'],
      ],
      'new Function هم مشکوک است.',
    ),
    cto: cs(
      'quality gate در CI برای JS؟',
      'a',
      [
        ['a', 'lint + typecheck + test + audit'],
        ['b', 'فقط build'],
        ['c', 'بدون gate'],
      ],
      'shift-left quality.',
    ),
  },
  {
    slug: 'map-set-weak',
    foundation: cs(
      'تفاوت Map و plain object برای key؟',
      'a',
      [
        ['a', 'Map هر نوع key و size property دارد'],
        ['b', 'هیچ'],
        ['c', 'object همیشه سریع‌تر برای همه'],
      ],
      'Map برای frequent add/delete بهتر است.',
    ),
    intermediate: ct('Set تکرار را نگه نمی‌دارد.', true, 'برای unique collection.'),
    advanced: cs(
      'WeakMap چرا iterate نشدنی است؟',
      'a',
      [
        ['a', 'کلیدها weak هستند و ممکن است GC شوند'],
        ['b', 'bug'],
        ['c', 'فقط IE'],
      ],
      'API برای cache وابسته به object.',
    ),
    expert: cm(
      'انتخاب Map vs Object؟',
      ['a', 'b'],
      [
        ['a', 'Map برای key غیر string'],
        ['b', 'Map وقتی تعداد entry زیاد و پویا'],
        ['c', 'object همیشه برای JSON API داخلی'],
        ['d', 'Map برای prototype chain lookup'],
      ],
      'برای record ثابت object مناسب است.',
    ),
    cto: cs(
      'cache در memory سرویس فرانت؟',
      'a',
      [
        ['a', 'TTL، max size، invalidation rule'],
        ['b', 'بی‌نهایت'],
        ['c', 'فقط localStorage'],
      ],
      'operational cost memory.',
    ),
  },
  {
    slug: 'promise-patterns',
    foundation: cs(
      'Promise.race برنده کیست؟',
      'a',
      [
        ['a', 'اولین settle شده'],
        ['b', 'آخرین'],
        ['c', 'همه'],
      ],
      'برای timeout pattern.',
    ),
    intermediate: cs(
      'async function بدون await چه برمی‌گرداند؟',
      'a',
      [
        ['a', 'Promise'],
        ['b', 'undefined sync'],
        ['c', 'Generator'],
      ],
      'همیشه Promise wrap.',
    ),
    advanced: ct('return await در try/catch داخل async مفید است.', true, 'خطا در try گرفته می‌شود.'),
    expert: cm(
      'anti-pattern در async؟',
      ['a', 'b'],
      [
        ['a', 'forEach با async callback بدون await'],
        ['b', 'unhandled fire-and-forget'],
        ['c', 'parallel با Promise.all وقتی مستقل'],
        ['d', 'abort signal'],
      ],
      'for...of با await یا Promise.all.',
    ),
    cto: cs(
      'idempotency در retry client؟',
      'a',
      [
        ['a', 'کلید idempotency برای POST حساس'],
        ['b', 'retry بی‌حد'],
        ['c', 'بدون log'],
      ],
      'جلوگیری از duplicate side effect.',
    ),
  },
  {
    slug: 'number-math',
    foundation: cs(
      'Number.isNaN(NaN) vs isNaN("x")؟',
      'a',
      [
        ['a', 'Number.isNaN فقط برای NaN واقعی'],
        ['b', 'یکسان'],
        ['c', 'isNaN دقیق‌تر'],
      ],
      'isNaN coercion می‌کند.',
    ),
    intermediate: ct('0.1 + 0.2 === 0.3 در JS false است.', true, 'خطای اعشار IEEE754.'),
    advanced: cs(
      'Number.EPSILON برای مقایسه float؟',
      'a',
      [
        ['a', 'حد تحمل نسبی'],
        ['b', 'حذف float'],
        ['c', 'bigint'],
      ],
      'یا از decimal library.',
    ),
    expert: cm(
      'parseInt("08", 10) در engine مدرن؟',
      ['a', 'b'],
      [
        ['a', '8 (octal قدیمی حذف)'],
        ['b', 'همیشه radix بده'],
        ['c', 'SyntaxError همیشه'],
        ['d', 'Infinity'],
      ],
      'radix 10 explicit کن.',
    ),
    cto: cs(
      'نمایش پول در UI؟',
      'a',
      [
        ['a', 'Intl + minor units از backend'],
        ['b', 'float JS'],
        ['c', 'string concat'],
      ],
      'قرارداد monetary در API.',
    ),
  },
  {
    slug: 'object-frozen',
    foundation: cs(
      'Object.freeze چه می‌کند؟',
      'a',
      [
        ['a', 'ممنوعیت add/delete/change property'],
        ['b', 'deep freeze'],
        ['c', 'async lock'],
      ],
      'shallow است.',
    ),
    intermediate: ct('seal اجازه change value می‌دهد ولی add/delete نه.', true, 'بین freeze و preventExtensions.'),
    advanced: cs(
      'immutable library vs freeze؟',
      'a',
      [
        ['a', 'Immer draft برای nested راحت‌تر'],
        ['b', 'یکی هستند'],
        ['c', 'freeze همیشه deep'],
      ],
      'perf و ergonomics Immer.',
    ),
    expert: cm(
      'const object چه تضمینی می‌دهد؟',
      ['a', 'b'],
      [
        ['a', 'binding قابل reassign نیست'],
        ['b', 'propertyها قابل mutate‌اند'],
        ['c', 'deep immutable'],
        ['d', 'همیشه freeze'],
      ],
      'const ≠ immutable object.',
    ),
    cto: cs(
      'readonly types در TS با runtime؟',
      'a',
      [
        ['a', 'compile-time؛ runtime نیاز به قرارداد/Immer'],
        ['b', 'خودکار runtime'],
        ['c', 'بدون TS'],
      ],
      'دو لایه type و runtime.',
    ),
  },
  {
    slug: 'labels-goto',
    foundation: ct('break و continue می‌توانند label داشته باشند.', true, 'برای loop تو در تو.'),
    intermediate: cs(
      'switch case بدون break؟',
      'a',
      [
        ['a', 'fall-through به case بعد'],
        ['b', 'خطا'],
        ['c', 'return اجباری'],
      ],
      'گاهی عمدی؛ معمولاً break بزن.',
    ),
    advanced: cs(
      'try/finally بدون catch؟',
      'a',
      [
        ['a', 'مجاز؛ finally همیشه اجرا می‌شود'],
        ['b', 'SyntaxError'],
        ['c', 'فقط Python'],
      ],
      'برای cleanup resource.',
    ),
    expert: cm(
      'مدیریت resource sync؟',
      ['a', 'b'],
      [
        ['a', 'try/finally'],
        ['b', 'using declaration (JS advanced)'],
        ['c', 'فراموش dispose'],
        ['d', 'defer macro'],
      ],
      'Disposable pattern در TC39.',
    ),
    cto: cs(
      'کد پیچیده control-flow؟',
      'a',
      [
        ['a', 'refactor به guard clause و تابع کوچک'],
        ['b', 'label بیشتر'],
        ['c', 'بدون review'],
      ],
      'خوانایی در maintainability.',
    ),
  },
  {
    slug: 'perf-bundle',
    foundation: cs(
      'tree shaking به چه نیاز دارد؟',
      'a',
      [
        ['a', 'ESM static import/export'],
        ['b', 'فقط CSS'],
        ['c', 'eval'],
      ],
      'sideEffects:false در package.json.',
    ),
    intermediate: ct('dynamic import به code splitting کمک می‌کند.', true, 'Vite/Webpack chunk می‌سازند.'),
    advanced: cm(
      'کاهش bundle؟',
      ['a', 'b', 'd'],
      [
        ['a', 'lazy route'],
        ['b', 'import selective از lodash'],
        ['c', 'import کل ant بدون نیاز'],
        ['d', 'analyze با rollup-plugin-visualizer'],
      ],
      'بودجه KB در CI.',
    ),
    expert: cs(
      'side effect در module چیست؟',
      'a',
      [
        ['a', 'کدی هنگام import اجرا می‌شود'],
        ['b', 'فقط CSS'],
        ['c', 'type only'],
      ],
      'tree-shake را می‌شکند.',
    ),
    cto: cs(
      'performance budget در release؟',
      'a',
      [
        ['a', 'حداکثر JS/CSS و LCP threshold'],
        ['b', 'بدون اندازه‌گیری'],
        ['c', 'فقط dev'],
      ],
      'gate در CI/CD.',
    ),
  },
  {
    slug: 'testing-mock',
    foundation: cs(
      'Vitest/Jest mock function چیست؟',
      'a',
      [
        ['a', 'جاسازی تابع با ردیابی فراخوانی'],
        ['b', 'فقط E2E'],
        ['c', 'CSS mock'],
      ],
      'vi.fn() در Vitest.',
    ),
    intermediate: ct('unit test باید سریع و deterministic باشد.', true, 'شبکه واقعی mock شود.'),
    advanced: cs(
      'spyOn object method برای چیست؟',
      'a',
      [
        ['a', 'ردیابی بدون جایگزین کامل implementation'],
        ['b', 'حذف تست'],
        ['c', 'production'],
      ],
      'restore بعد از تست.',
    ),
    expert: cm(
      'testing pyramid در frontend؟',
      ['a', 'b', 'c'],
      [
        ['a', 'unit زیاد'],
        ['b', 'integration متوسط'],
        ['c', 'E2E کم ولی critical path'],
        ['d', 'فقط manual'],
      ],
      'هزینه نگهداری E2E بالاست.',
    ),
    cto: cs(
      'قرارداد coverage در سازمان؟',
      'a',
      [
        ['a', 'هدف معقول + تمرکز روی critical path'],
        ['b', '100% اجباری همه جا'],
        ['c', 'بدون تست'],
      ],
      'کیفیت مهم‌تر از عدد خام.',
    ),
  },
]
