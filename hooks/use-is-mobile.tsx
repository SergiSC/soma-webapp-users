import { useEffect, useState } from "react";

export function useIsMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);

    // Function to update state
    const handleChange = (e: MediaQueryList | MediaQueryListEvent) => {
      setIsMobile("matches" in e ? e.matches : (e as MediaQueryList).matches);
    };

    // Initial check
    handleChange(mediaQuery);

    // Listen for changes
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [breakpoint]);

  return isMobile;
}
