"use client";

import { useEffect, useCallback, useRef } from "react";

/**
 * Spatial navigation hook for Android TV D-pad support.
 * Manages focus between focusable elements within a container.
 *
 * Usage:
 * ```
 * const containerRef = useSpatialNav({ columns: 5, selector: "[data-focusable]" });
 * return <div ref={containerRef}>...</div>
 * ```
 */

interface SpatialNavOptions {
  /** CSS selector for focusable items within the container */
  selector?: string;
  /** Number of columns in grid layout (for up/down navigation) */
  columns?: number;
  /** Whether to auto-focus the first item on mount */
  autoFocus?: boolean;
  /** Callback when an item is selected (Enter/OK pressed) */
  onSelect?: (el: HTMLElement, index: number) => void;
  /** Whether this navigation layer is active (for nested/layered nav) */
  active?: boolean;
  /** Enable left-right wrap-around */
  loop?: boolean;
}

export function useSpatialNav(options: SpatialNavOptions = {}) {
  const {
    selector = "[data-focusable]",
    columns = 1,
    autoFocus = false,
    onSelect,
    active = true,
    loop = false,
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const focusedIndexRef = useRef(0);

  const getFocusables = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];
    return Array.from(containerRef.current.querySelectorAll(selector));
  }, [selector]);

  const focusIndex = useCallback(
    (index: number) => {
      const items = getFocusables();
      if (items.length === 0) return;
      const clamped = Math.max(0, Math.min(index, items.length - 1));
      focusedIndexRef.current = clamped;
      items[clamped]?.focus({ preventScroll: false });
    },
    [getFocusables]
  );

  // Auto-focus first item
  useEffect(() => {
    if (autoFocus && active) {
      const t = setTimeout(() => focusIndex(0), 100);
      return () => clearTimeout(t);
    }
  }, [autoFocus, active, focusIndex]);

  // Keyboard handler
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const items = getFocusables();
      if (items.length === 0) return;

      // Find currently focused index
      const activeEl = document.activeElement as HTMLElement;
      let currentIndex = items.indexOf(activeEl);
      if (currentIndex < 0) currentIndex = focusedIndexRef.current;

      let nextIndex = currentIndex;
      let handled = false;

      switch (e.key) {
        case "ArrowRight":
          if (loop) {
            nextIndex = (currentIndex + 1) % items.length;
          } else {
            nextIndex = Math.min(currentIndex + 1, items.length - 1);
          }
          handled = true;
          break;
        case "ArrowLeft":
          if (loop) {
            nextIndex = (currentIndex - 1 + items.length) % items.length;
          } else {
            nextIndex = Math.max(currentIndex - 1, 0);
          }
          handled = true;
          break;
        case "ArrowDown":
          nextIndex = Math.min(currentIndex + columns, items.length - 1);
          handled = true;
          break;
        case "ArrowUp":
          nextIndex = Math.max(currentIndex - columns, 0);
          handled = true;
          break;
        case "Enter":
        case " ":
          if (onSelect) {
            e.preventDefault();
            onSelect(items[currentIndex], currentIndex);
          }
          return;
        default:
          return;
      }

      if (handled) {
        e.preventDefault();
        focusIndex(nextIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, columns, loop, getFocusables, focusIndex, onSelect]);

  return containerRef;
}
