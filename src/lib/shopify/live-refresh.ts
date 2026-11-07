export function startLiveRefresh(refresh: () => void, intervalMs = 60_000) {
  const update = () => { if (document.visibilityState === 'visible') refresh(); };
  const timer = window.setInterval(update, intervalMs);
  window.addEventListener('focus', update);
  document.addEventListener('visibilitychange', update);
  return () => {
    window.clearInterval(timer);
    window.removeEventListener('focus', update);
    document.removeEventListener('visibilitychange', update);
  };
}
