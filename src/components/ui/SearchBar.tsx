"use client";

import { useState, useEffect, useRef } from "react";
import { HiMagnifyingGlass, HiXMark } from "react-icons/hi2";
import clsx from "clsx";

interface SearchBarProps {
  value?: string;
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
  className?: string;
  autoFocus?: boolean;
}

export default function SearchBar({
  value: externalValue,
  placeholder = "Search...",
  onSearch,
  debounceMs = 300,
  className,
  autoFocus,
}: SearchBarProps) {
  const [query, setQuery] = useState(externalValue ?? "");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (externalValue !== undefined) {
      setQuery(externalValue);
    }
  }, [externalValue]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearch(query);
    }, debounceMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, debounceMs, onSearch]);

  return (
    <div className={clsx("relative", className)}>
      <HiMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full rounded-lg border border-[#2a2a38] bg-[#181820] py-2.5 pl-10 pr-10 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
        >
          <HiXMark className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
