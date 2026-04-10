"use client";

import clsx from "clsx";
import { IconType } from "react-icons";
import { HiArrowUp, HiArrowDown } from "react-icons/hi";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: IconType;
  iconColor?: string;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
}

export default function StatsCard({
  label,
  value,
  icon: Icon,
  iconColor = "text-blue-400",
  trend,
}: StatsCardProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 text-xs">
              {trend.isPositive ? (
                <HiArrowUp className="w-3 h-3 text-emerald-400" />
              ) : (
                <HiArrowDown className="w-3 h-3 text-red-400" />
              )}
              <span
                className={clsx(
                  trend.isPositive ? "text-emerald-400" : "text-red-400"
                )}
              >
                {trend.value}%
              </span>
              <span className="text-gray-500">{trend.label}</span>
            </div>
          )}
        </div>
        <div
          className={clsx(
            "w-11 h-11 rounded-lg flex items-center justify-center bg-gray-700/50",
            iconColor
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
