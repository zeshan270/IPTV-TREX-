"use client";

import { HiOutlineExclamationTriangle } from "react-icons/hi2";
import clsx from "clsx";

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorDisplay({
  message,
  onRetry,
  className,
}: ErrorDisplayProps) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center gap-4 rounded-xl bg-[#1a1a2e]/80 border border-red-500/20 p-8",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
        <HiOutlineExclamationTriangle className="h-7 w-7 text-red-400" />
      </div>
      <p className="text-center text-sm text-gray-300 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#0f0f1a]"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
