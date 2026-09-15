'use client';

import { useEffect, useState } from 'react';

/** Visakhapatnam local time, rendered only after mount so SSR and client never disagree. */
export function LocalTime({ timeZone }: { timeZone: string }) {
  const [t, setT] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone, hour12: false });
    const tick = () => setT(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, [timeZone]);
  return (
    <span className="num" suppressHydrationWarning>
      {t ?? '--:--'} IST
    </span>
  );
}
