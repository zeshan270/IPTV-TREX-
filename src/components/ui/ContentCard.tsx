"use client";

import Image from "next/image";
import clsx from "clsx";
import { HiHeart, HiOutlineHeart, HiStar } from "react-icons/hi2";
import { useState } from "react";

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
}: ContentCardProps) {
  const [imgError, setImgError] = useState(false);
  const numRating = typeof rating === "string" ? parseFloat(rating) : rating;
  const stars = numRating ? Math.round((numRating / 10) * 5) : 0;

  return (
    <div
      className={clsx(
        "group relative overflow-hidden rounded-xl bg-[#1a1a2e] border border-[#2a2a45] transition-all duration-300 card-hover cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#25253d]">
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
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#25253d]">
            <span className="text-3xl font-bold text-gray-600">
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
            className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm transition-all hover:bg-black/70"
          >
            {isFavorite ? (
              <HiHeart className="h-4 w-4 text-red-500" />
            ) : (
              <HiOutlineHeart className="h-4 w-4 text-white/70" />
            )}
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-white truncate">{title}</h3>
        <div className="mt-1 flex items-center gap-2">
          {stars > 0 && (
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <HiStar
                  key={i}
                  className={clsx(
                    "h-3 w-3",
                    i < stars ? "text-yellow-400" : "text-gray-600"
                  )}
                />
              ))}
            </div>
          )}
          {year && <span className="text-xs text-gray-500">{year}</span>}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs text-gray-500 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
