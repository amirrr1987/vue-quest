import { onMounted, onBeforeUnmount, type Ref, watch, nextTick } from 'vue'
import gsap from 'gsap'

/**
 * stagger ورودی المنت‌ها (مثل گزینه‌ها، کارت‌ها، آیتم‌های لیست)
 * ref = عنصر wrapper ← فرزندان مستقیم stagger می‌شوند.
 */
export function useStaggerIn(
  containerRef: Ref<HTMLElement | null>,
  selector: string,
  options: { delay?: number; stagger?: number; y?: number } = {},
) {
  const { delay = 0.05, stagger = 0.06, y = 18 } = options
  let ctx: gsap.Context | null = null

  function animate() {
    if (!containerRef.value) return
    ctx?.revert()
    ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.value!.querySelectorAll(selector),
        { opacity: 0, y },
        { opacity: 1, y: 0, stagger, duration: 0.35, ease: 'power2.out', delay },
      )
    }, containerRef.value)
  }

  onMounted(animate)
  onBeforeUnmount(() => ctx?.revert())

  return { replay: animate }
}

/**
 * شمارنده عددی (counter from 0 → target) — برای آمار داشبورد.
 */
export function useCountUp(
  targetRef: Ref<HTMLElement | null>,
  value: Ref<number>,
  options: { duration?: number } = {},
) {
  const { duration = 0.8 } = options
  const proxy = { val: 0 }

  function animateTo(newVal: number) {
    if (!targetRef.value) return
    gsap.to(proxy, {
      val: newVal,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        if (targetRef.value) {
          targetRef.value.textContent = Math.round(proxy.val).toLocaleString('fa-IR')
        }
      },
    })
  }

  onMounted(() => animateTo(value.value))
  watch(value, (n) => animateTo(n))
}

/**
 * تکان (shake) — بازخورد خطا برای پاسخ نادرست.
 */
export function shakeElement(el: HTMLElement | null) {
  if (!el) return
  gsap.fromTo(
    el,
    { x: 0 },
    {
      x: -8, duration: 0.06, ease: 'power2.inOut',
      yoyo: true, repeat: 5,
      onComplete: () => gsap.set(el, { x: 0 }),
    },
  )
}

/**
 * pulse (scale up → down) — بازخورد مثبت.
 */
export function pulseElement(el: HTMLElement | null) {
  if (!el) return
  gsap.fromTo(
    el,
    { scale: 1 },
    { scale: 1.06, duration: 0.18, ease: 'power2.out', yoyo: true, repeat: 1 },
  )
}

/**
 * pop-in — برای ظاهر شدن المنت‌ها مثل dots تغییر‌یافته.
 */
export function popIn(el: HTMLElement | null) {
  if (!el) return
  gsap.fromTo(
    el,
    { scale: 0, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2)' },
  )
}

/**
 * celebratory burst — انفجار ذرات برای صفحه نتیجه.
 * ذرات به صورت absolute روی container ساخته و animate می‌شوند.
 */
export function celebrationBurst(container: HTMLElement | null, count = 24) {
  if (!container) return
  const colors = ['#52c41a', '#1677ff', '#faad14', '#722ed1', '#ff4d4f', '#13c2c2']
  const rect = container.getBoundingClientRect()
  const cx = rect.width / 2
  const cy = rect.height / 3

  for (let i = 0; i < count; i++) {
    const dot = document.createElement('span')
    dot.style.cssText = `position:absolute;width:8px;height:8px;border-radius:50%;pointer-events:none;left:${cx}px;top:${cy}px;z-index:10;`
    dot.style.backgroundColor = colors[i % colors.length]!
    container.style.position = 'relative'
    container.style.overflow = 'hidden'
    container.appendChild(dot)

    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4
    const dist = 60 + Math.random() * 120

    gsap.to(dot, {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist - 30,
      opacity: 0,
      scale: 0.2 + Math.random() * 1.8,
      duration: 0.7 + Math.random() * 0.5,
      ease: 'power2.out',
      onComplete: () => dot.remove(),
    })
  }
}

/**
 * GSAP hooks برای <Transition> — می‌توان مستقیماً به @enter / @leave وصل کرد.
 */
export const slideTransition = {
  onEnter(el: Element, done: () => void) {
    gsap.fromTo(
      el, { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', onComplete: done },
    )
  },
  onLeave(el: Element, done: () => void) {
    gsap.to(el, { opacity: 0, y: -16, duration: 0.2, ease: 'power2.in', onComplete: done })
  },
}

/**
 * fade transition hooks
 */
export const fadeTransition = {
  onEnter(el: Element, done: () => void) {
    gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out', onComplete: done })
  },
  onLeave(el: Element, done: () => void) {
    gsap.to(el, { opacity: 0, duration: 0.2, ease: 'power2.in', onComplete: done })
  },
}

/**
 * slide-RTL direction-aware: برای سوالات آزمون.
 * direction = 1 (جلو/بعدی → slide از چپ) | -1 (عقب/قبلی → slide از راست)
 */
export function makeDirectionalSlide(direction: Ref<1 | -1>) {
  return {
    onEnter(el: Element, done: () => void) {
      const fromX = direction.value === 1 ? -40 : 40
      gsap.fromTo(
        el,
        { opacity: 0, x: fromX },
        { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out', onComplete: done },
      )
    },
    onLeave(el: Element, done: () => void) {
      const toX = direction.value === 1 ? 40 : -40
      gsap.to(el, { opacity: 0, x: toX, duration: 0.2, ease: 'power2.in', onComplete: done })
    },
  }
}

/**
 * re-trigger stagger children هر بار key تغییر کنه (مثلاً عوض شدن سوال).
 */
export function useStaggerOnChange(
  containerRef: Ref<HTMLElement | null>,
  selector: string,
  trigger: Ref<unknown>,
  options: { stagger?: number; y?: number } = {},
) {
  const { stagger = 0.05, y = 14 } = options

  watch(trigger, async () => {
    await nextTick()
    if (!containerRef.value) return
    const els = containerRef.value.querySelectorAll(selector)
    if (!els.length) return
    gsap.fromTo(
      els,
      { opacity: 0, y },
      { opacity: 1, y: 0, stagger, duration: 0.3, ease: 'power2.out' },
    )
  })
}
