/**
 * VectraBase AI — GSAP React Hook with Automatic Context Revert
 * Author: Karthik Kathari (github.com/Karthik-Kathari)
 */

import { useRef, useLayoutEffect, useEffect } from 'react';
import gsap from 'gsap';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function useGSAP(
  callback: (context: gsap.Context) => void,
  dependencies: any[] = []
) {
  const scope = useRef<HTMLDivElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(callback, scope);
    return () => ctx.revert();
  }, dependencies);

  return scope;
}

