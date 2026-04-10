"use client";

import clsx from "clsx";

interface LoadingSpinnerProps {
  text?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function LoadingSpinner({
  text,
  size = "md",
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-5 w-5 border-2",
    md: "h-10 w-10 border-3",
    lg: "h-16 w-16 border-4",
  };

  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center gap-3",
        className
      )}
    >
      <div
        className={clsx(
          "animate-spin rounded-full border-solid border-indigo-500 border-t-transparent",
          sizeClasses[size]
        )}
      />
      {text && (
        <p className="text-sm text-gray-400 animate-pulse">{text}</p>
      )}
    </div>
  );
}
