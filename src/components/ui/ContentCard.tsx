"use client";

import Image from "next/image";
import clsx from "clsx";
import { HiHeart, HiOutlineHeart, HiStar } from "react-icons/hi2";
import { useState, useCallback } from "react";

interface ContentCardProps {
  id: string;
  title: string;
  image?: string;
  rating?: string | number;
  year?: string;
  subtitle?: string;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  onClick?: () => void;
  className?: string;
  channelNumber?: number;
}

export default function ContentCard({
  id,
  title,
  image,
  rating,
  year,
  subtitle,
  isFavorite,
  onFavoriteToggle,
  onClick,
  className,
  channelNumber,
}: ContentCardProps) {
  const [imgError, setImgError] = useState(false);
  const numRating = typeof rating === "string" ? parseFloat(rating) : rating;
  const stars = numRating ? Math.round((numRating / 10) * 5) : 0;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick?.();
      }
    },
    [onClick]
  );

  return (
    <div
      tabIndex={0}
      role="button"
      className={clsx(
        "group relative overflow-hidden rounded-xl glass-card cursor-pointer",
        "focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none",
        className
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      {/* Channel number badge */}
      {channelNumber !== undefined && channelNumber > 0 && (
        <div className="absolute top-2 left-2 z-20 flex h-8 min-w-[2rem] items-center justify-center rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600 px-2 shadow-lg">
          <span className="text-sm font-bold text-black">{channelNumber}</span>
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#22222e]">
        {image && !imgError ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#181820] to-[#22222e]">
            <span className="text-4xl font-bold text-gray-600">
              {title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Favorite button */}
        {onFavoriteToggle && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle();
            }}
            tabIndex={-1}
            className="absolute top-2 right-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm transition-all hover:bg-black/70 hover:scale-110"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? (
              <HiHeart className="h-5 w-5 text-red-500 drop-shadow-lg" />
            ) : (
              <HiOutlineHeart className="h-5 w-5 text-white/70" />
            )}
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-base font-semibold text-white truncate leading-tight">
          {title}
        </h3>
        <div className="mt-1.5 flex items-center gap-2">
          {stars > 0 && (
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <HiStar
                  key={i}
                  className={clsx(
                    "h-3.5 w-3.5",
                    i < stars ? "text-yellow-400" : "text-gray-600"
                  )}
                />
              ))}
            </div>
          )}
          {year && <span className="text-sm text-gray-500">{year}</span>}
        </div>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
