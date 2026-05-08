import { useEffect, useState } from "react";

/**
 * Always shows a loader for at least `minMs` milliseconds on every mount.
 * This ensures the loading screen is visible even when data loads instantly (cached).
 */
export function usePageLoader(minMs = 500) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    const timer = setTimeout(() => setReady(true), minMs);
    return () => clearTimeout(timer);
  }, []); // runs on every mount

  return ready;
}
