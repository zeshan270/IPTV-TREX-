"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { HiOutlineSearch, HiOutlineCollection } from "react-icons/hi";

interface DeviceOption {
  id: string;
  macAddress: string;
  deviceName: string;
}

interface AssignPlaylistDialogProps {
  open: boolean;
  onClose: () => void;
  onAssign: (deviceIds: string[]) => Promise<void>;
  devices: DeviceOption[];
  playlistName?: string;
}

export default function AssignPlaylistDialog({
  open,
  onClose,
  onAssign,
  devices,
  playlistName,
}: AssignPlaylistDialogProps) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    if (!search) return devices;
    const q = search.toLowerCase();
    return devices.filter(
      (d) =>
        d.macAddress.toLowerCase().includes(q) ||
        d.deviceName.toLowerCase().includes(q)
    );
  }, [devices, search]);

  const allSelected =
    filtered.length > 0 && filtered.every((d) => selectedIds.includes(d.id));

  const toggleAll = () => {
    if (allSelected) {
      const filteredIds = new Set(filtered.map((d) => d.id));
      setSelectedIds(selectedIds.filter((id) => !filteredIds.has(id)));
    } else {
      const newIds = new Set([...selectedIds, ...filtered.map((d) => d.id)]);
      setSelectedIds(Array.from(newIds));
    }
  };

  const toggleDevice = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAssign = async () => {
    if (selectedIds.length === 0) return;
    setError("");
    setLoading(true);
    try {
      await onAssign(selectedIds);
      setSelectedIds([]);
      setSearch("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-lg bg-gray-800 border border-gray-700 rounded-xl shadow-2xl flex flex-col max-h-[80vh]">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <HiOutlineCollection className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-white">
                  Assign Playlist
                </DialogTitle>
                {playlistName && (
                  <p className="text-xs text-gray-400">
                    Assign &quot;{playlistName}&quot; to devices
                  </p>
                )}
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search devices..."
                className="w-full pl-9 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Device list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1 min-h-0">
            {/* Select all */}
            <button
              onClick={toggleAll}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <input
                type="checkbox"
                checked={allSelected}
                readOnly
                className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
              />
              <span className="text-sm font-medium text-gray-300">
                Select All ({filtered.length})
              </span>
            </button>

            {filtered.map((device) => (
              <button
                key={device.id}
                onClick={() => toggleDevice(device.id)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(device.id)}
                  readOnly
                  className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                />
                <div className="text-left">
                  <p className="text-sm text-white">{device.deviceName || "Unnamed"}</p>
                  <p className="text-xs text-gray-500 font-mono">
                    {device.macAddress}
                  </p>
                </div>
              </button>
            ))}

            {filtered.length === 0 && (
              <p className="text-center text-gray-500 text-sm py-8">
                No devices found
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700">
            {error && (
              <p className="text-sm text-red-400 mb-3">{error}</p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">
                {selectedIds.length} selected
              </span>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={loading || selectedIds.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading
                    ? "Assigning..."
                    : `Assign to ${selectedIds.length} Device${selectedIds.length !== 1 ? "s" : ""}`}
                </button>
              </div>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
