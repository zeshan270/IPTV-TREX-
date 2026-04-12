"use client";

import clsx from "clsx";
import type { IconType } from "react-icons";

interface CategoryCardProps {
  name: string;
  count?: number;
  icon?: IconType;
  gradient?: string;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

const defaultGradients = [
  "from-amber-600 to-orange-600",
  "from-orange-600 to-pink-600",
  "from-blue-600 to-amber-600",
  "from-pink-600 to-rose-600",
  "from-emerald-600 to-teal-600",
  "from-orange-600 to-red-600",
];

export default function CategoryCard({
  name,
  count,
  icon: Icon,
  gradient,
  isSelected,
  onClick,
  className,
}: CategoryCardProps) {
  const bg =
    gradient ??
    defaultGradients[
      Math.abs(name.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) %
        defaultGradients.length
    ];

  return (
    <button
      onClick={onClick}
      className={clsx(
        "group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300",
        "bg-gradient-to-br",
        bg,
        isSelected
          ? "ring-2 ring-white/40 shadow-lg shadow-amber-500/20 scale-[1.02]"
          : "hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/10",
        className
      )}
    >
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
      <div className="relative z-10">
        {Icon && (
          <div className="mb-2">
            <Icon className="h-6 w-6 text-white/80" />
          </div>
        )}
        <h3 className="text-sm font-semibold text-white truncate">{name}</h3>
        {count !== undefined && (
          <p className="mt-1 text-xs text-white/60">
            {count} {count === 1 ? "item" : "items"}
          </p>
        )}
      </div>
    </button>
  );
}
