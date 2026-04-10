"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { formatDistanceToNow, format } from "date-fns";
import {
  HiOutlineEye,
  HiOutlineTrash,
  HiOutlineLightningBolt,
  HiOutlineBan,
  HiOutlineChevronUp,
  HiOutlineChevronDown,
  HiOutlineTerminal,
} from "react-icons/hi";

export interface DeviceRow {
  id: string;
  macAddress: string;
  deviceName: string;
  deviceModel?: string;
  appVersion?: string;
  isActive: boolean;
  lastSeenAt: string | null;
  expiresAt: string | null;
  activatedAt?: string | null;
  notes?: string;
}

type SortField = "macAddress" | "deviceName" | "isActive" | "lastSeenAt" | "expiresAt";
type SortDir = "asc" | "desc";

interface DeviceTableProps {
  devices: DeviceRow[];
  selected?: string[];
  onSelectChange?: (ids: string[]) => void;
  onToggleActive?: (id: string, active: boolean) => void;
  onDelete?: (id: string) => void;
  onSendCommand?: (id: string) => void;
  compact?: boolean;
}

export default function DeviceTable({
  devices,
  selected = [],
  onSelectChange,
  onToggleActive,
  onDelete,
  onSendCommand,
  compact = false,
}: DeviceTableProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>("lastSeenAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sorted = useMemo(() => {
    return [...devices].sort((a, b) => {
      let aVal: string | number | boolean = "";
      let bVal: string | number | boolean = "";

      switch (sortField) {
        case "macAddress":
          aVal = a.macAddress;
          bVal = b.macAddress;
          break;
        case "deviceName":
          aVal = a.deviceName || "";
          bVal = b.deviceName || "";
          break;
        case "isActive":
          aVal = a.isActive ? 1 : 0;
          bVal = b.isActive ? 1 : 0;
          break;
        case "lastSeenAt":
          aVal = a.lastSeenAt || "";
          bVal = b.lastSeenAt || "";
          break;
        case "expiresAt":
          aVal = a.expiresAt || "";
          bVal = b.expiresAt || "";
          break;
      }

      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [devices, sortField, sortDir]);

  const allSelected = devices.length > 0 && selected.length === devices.length;

  const toggleSelectAll = () => {
    if (!onSelectChange) return;
    if (allSelected) {
      onSelectChange([]);
    } else {
      onSelectChange(devices.map((d) => d.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (!onSelectChange) return;
    if (selected.includes(id)) {
      onSelectChange(selected.filter((s) => s !== id));
    } else {
      onSelectChange([...selected, id]);
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? (
      <HiOutlineChevronUp className="w-3 h-3 ml-1 inline" />
    ) : (
      <HiOutlineChevronDown className="w-3 h-3 ml-1 inline" />
    );
  };

  const ThButton = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center text-left text-xs font-medium text-gray-400 uppercase tracking-wider hover:text-gray-200 transition-colors"
    >
      {children}
      <SortIcon field={field} />
    </button>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700">
            {onSelectChange && (
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                />
              </th>
            )}
            <th className="px-4 py-3 text-left">
              <ThButton field="macAddress">MAC Address</ThButton>
            </th>
            <th className="px-4 py-3 text-left">
              <ThButton field="deviceName">Name</ThButton>
            </th>
            <th className="px-4 py-3 text-left">
              <ThButton field="isActive">Status</ThButton>
            </th>
            <th className="px-4 py-3 text-left hidden md:table-cell">
              <ThButton field="lastSeenAt">Last Seen</ThButton>
            </th>
            <th className="px-4 py-3 text-left hidden lg:table-cell">
              <ThButton field="expiresAt">Expires</ThButton>
            </th>
            {!compact && (
              <th className="px-4 py-3 text-right">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </span>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700/50">
          {sorted.map((device) => (
            <tr
              key={device.id}
              className="hover:bg-gray-700/30 transition-colors"
            >
              {onSelectChange && (
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(device.id)}
                    onChange={() => toggleSelect(device.id)}
                    className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                  />
                </td>
              )}
              <td className="px-4 py-3">
                <span className="font-mono text-gray-200 text-xs">
                  {device.macAddress}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-300">
                {device.deviceName || "—"}
              </td>
              <td className="px-4 py-3">
                <span
                  className={clsx(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                    device.isActive
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  )}
                >
                  {device.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">
                {device.lastSeenAt
                  ? formatDistanceToNow(new Date(device.lastSeenAt), {
                      addSuffix: true,
                    })
                  : "Never"}
              </td>
              <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                {device.expiresAt
                  ? format(new Date(device.expiresAt), "MMM dd, yyyy")
                  : "—"}
              </td>
              {!compact && (
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => router.push(`/admin/devices/${device.id}`)}
                      title="View"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                    >
                      <HiOutlineEye className="w-4 h-4" />
                    </button>
                    {onToggleActive && (
                      <button
                        onClick={() =>
                          onToggleActive(device.id, !device.isActive)
                        }
                        title={device.isActive ? "Deactivate" : "Activate"}
                        className={clsx(
                          "p-1.5 rounded-lg transition-colors",
                          device.isActive
                            ? "text-yellow-400 hover:bg-yellow-500/20"
                            : "text-emerald-400 hover:bg-emerald-500/20"
                        )}
                      >
                        {device.isActive ? (
                          <HiOutlineBan className="w-4 h-4" />
                        ) : (
                          <HiOutlineLightningBolt className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    {onSendCommand && (
                      <button
                        onClick={() => onSendCommand(device.id)}
                        title="Send Command"
                        className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-colors"
                      >
                        <HiOutlineTerminal className="w-4 h-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(device.id)}
                        title="Delete"
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td
                colSpan={10}
                className="px-4 py-12 text-center text-gray-500"
              >
                No devices found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
