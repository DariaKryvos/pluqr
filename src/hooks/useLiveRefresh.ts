'use client';
import { useEffect, useRef } from 'react';
import { startLiveRefresh } from '../lib/shopify/live-refresh';
export function useLiveRefresh(refresh: () => void) {
  const callback = useRef(refresh);
  useEffect(() => { callback.current = refresh; });
  useEffect(() => startLiveRefresh(() => callback.current()), []);
}
