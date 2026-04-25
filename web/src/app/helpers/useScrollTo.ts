// src/app/helpers/useScrollTo.ts
import { useEffect, useRef } from "react";

export function useScrollTo(dependency: unknown) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dependency !== undefined && dependency !== null && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [dependency]);

  return ref;
}