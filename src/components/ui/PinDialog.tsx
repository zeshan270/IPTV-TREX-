"use client";

import { useState, useRef, useEffect } from "react";
import { HiLockClosed, HiXMark } from "react-icons/hi2";
import clsx from "clsx";

interface PinDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => void;
  title?: string;
  error?: string;
}

export default function PinDialog({
  isOpen,
  onClose,
  onSubmit,
  title = "Enter PIN",
  error,
}: PinDialogProps) {
  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setDigits(["", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newDigits.every((d) => d !== "")) {
      onSubmit(newDigits.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-2xl bg-[#1a1a2e] border border-[#2a2a45] p-8 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-white transition-colors"
        >
          <HiXMark className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/10">
          <HiLockClosed className="h-7 w-7 text-indigo-400" />
        </div>

        {/* Title */}
        <h2 className="text-center text-lg font-semibold text-white mb-6">
          {title}
        </h2>

        {/* PIN inputs */}
        <div className="flex justify-center gap-3 mb-4">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={clsx(
                "h-14 w-14 rounded-xl border-2 bg-[#0f0f1a] text-center text-2xl font-bold text-white outline-none transition-all",
                error
                  ? "border-red-500 shake"
                  : "border-[#2a2a45] focus:border-indigo-500"
              )}
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <p className="text-center text-sm text-red-400 mt-2">{error}</p>
        )}

        {/* Hint */}
        <p className="text-center text-xs text-gray-500 mt-4">
          Enter your 4-digit parental control PIN
        </p>
      </div>
    </div>
  );
}
