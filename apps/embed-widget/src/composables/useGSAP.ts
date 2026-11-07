/**
 * VectraBase AI — GSAP Animation Composable for Vue 3
 * Author: Karthik Kathari (github.com/Karthik-Kathari)
 */

import { onUnmounted, ref } from 'vue';
import gsap from 'gsap';

export function useGSAP() {
  const ctx = ref<gsap.Context | null>(null);

  function animate(callback: () => void) {
    if (ctx.value) {
      ctx.value.revert();
    }
    ctx.value = gsap.context(() => {
      callback();
    });
  }

  function fadeIn(target: string | Element, duration = 0.3, delay = 0) {
    return gsap.fromTo(
      target,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration, delay, ease: 'power2.out' }
    );
  }

  function pulseHighlight(target: string | Element) {
    return gsap.fromTo(
      target,
      { scale: 0.98, boxShadow: '0 0 0 rgba(6, 182, 212, 0)' },
      {
        scale: 1,
        boxShadow: '0 0 16px rgba(6, 182, 212, 0.4)',
        duration: 0.4,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
      }
    );
  }

  function animateProgressBar(target: string | Element, targetWidthPct: number) {
    return gsap.fromTo(
      target,
      { width: '0%' },
      { width: `${targetWidthPct}%`, duration: 0.6, ease: 'power2.out' }
    );
  }

  onUnmounted(() => {
    if (ctx.value) {
      ctx.value.revert();
    }
  });

  return {
    gsap,
    animate,
    fadeIn,
    pulseHighlight,
    animateProgressBar,
  };
}

