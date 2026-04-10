"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import clsx from "clsx";
import {
  HiOutlineArrowLeft,
  HiOutlineTerminal,
  HiOutlineSave,
  HiOutlineTrash,
  HiOutlinePlus,
} from "react-icons/hi";
import DeviceCommandDialog from "@/components/admin/DeviceCommandDialog";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { adminFetch } from "@/lib/admin-store";

interface DeviceDetail {
  id: string;
  macAddress: string;
  deviceName: string;
  deviceModel: string;
  appVersion: string;
  isActive: boolean;
  activatedAt: string | null;
  lastSeenAt: string | null;
  expiresAt: string | null;
  createdAt?: string;
  notes?: string;
  playlists?: { id: string; name: string; type: string }[];
  commandHistory?: { id: string; command: string; payload?: string; createdAt: string; status: string }[];
}

export default function DeviceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const deviceId = params.id as string;

  const [device, setDevice] = useState<DeviceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Edit state
  const [editName, setEditName] = useState("");
  const [editExpiry, setEditExpiry] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editActive, setEditActive] = useState(false);

  // Dialogs
  const [commandOpen, setCommandOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [removePlaylistId, setRemovePlaylistId] = useState<string | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDevice = useCallback(async () => {
    try {
      const res = await adminFetch(`/api/devices/${deviceId}`);
      if (!res.ok) throw new Error("Device not found");
      const data = await res.json();
      setDevice(data);
      setEditName(data.deviceName || "");
      setEditExpiry(data.expiresAt ? data.expiresAt.split("T")[0] : "");
      setEditNotes(data.notes || "");
      setEditActive(data.isActive);
    } catch {
      showToast("Failed to load device", "error");
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    fetchDevice();
  }, [fetchDevice]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await adminFetch(`/api/devices/${deviceId}`, {
        method: "PUT",
        body: JSON.stringify({
          deviceName: editName,
          expiresAt: editExpiry ? new Date(editExpiry).toISOString() : null,
          notes: editNotes,
          isActive: editActive,
        }),
      });
      if (!res.ok) throw new Error();
      showToast("Device updated");
      fetchDevice();
    } catch {
      showToast("Failed to update device", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await adminFetch(`/api/devices/${deviceId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      router.push("/admin/devices");
    } catch {
      showToast("Failed to delete device", "error");
    }
    setDeleteOpen(false);
  };

  const handleSendCommand = async (command: string, payload?: string) => {
    const res = await adminFetch(`/api/devices/${deviceId}/command`, {
      method: "POST",
      body: JSON.stringify({ command, payload }),
    });
    if (!res.ok) throw new Error("Failed to send command");
    showToast("Command sent");
    fetchDevice();
  };

  const handleRemovePlaylist = async (playlistId: string) => {
    try {
      await adminFetch(`/api/devices/${deviceId}/command`, {
        method: "POST",
        body: JSON.stringify({ command: "remove_playlist", payload: playlistId }),
      });
      showToast("Playlist removed");
      fetchDevice();
    } catch {
      showToast("Failed to remove playlist", "error");
    }
    setRemovePlaylistId(null);
  };

  const handleAssignPlaylist = async () => {
    const playlistId = prompt("Enter Playlist ID to assign:");
    if (!playlistId) return;
    try {
      await adminFetch(`/api/devices/${deviceId}/command`, {
        method: "POST",
        body: JSON.stringify({ command: "assign_playlist", payload: playlistId }),
      });
      showToast("Playlist assigned");
      fetchDevice();
    } catch {
      showToast("Failed to assign playlist", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!device) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">Device not found</p>
        <button
          onClick={() => router.push("/admin/devices")}
          className="px-4 py-2 text-sm bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
        >
          Back to Devices
        </button>
      </div>
    );
  }

  const formatDate = (d: string | null) =>
    d ? format(new Date(d), "MMM dd, yyyy HH:mm") : "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/devices")}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {device.deviceName || "Unnamed Device"}
            </h1>
            <p className="text-sm text-gray-400 font-mono">
              {device.macAddress}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCommandOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            <HiOutlineTerminal className="w-4 h-4" />
            Send Command
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <HiOutlineTrash className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
            <h3 className="text-sm font-medium text-gray-300 mb-4">
              Device Information
            </h3>
            <dl className="space-y-3">
              {[
                ["MAC Address", device.macAddress],
                ["Model", device.deviceModel || "—"],
                ["App Version", device.appVersion || "—"],
                [
                  "Status",
                  <span
                    key="status"
                    className={clsx(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                      device.isActive
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-red-500/20 text-red-400"
                    )}
                  >
                    {device.isActive ? "Active" : "Inactive"}
                  </span>,
                ],
                ["Created", formatDate(device.createdAt || null)],
                ["Activated", formatDate(device.activatedAt)],
                ["Last Seen", formatDate(device.lastSeenAt)],
                ["Expires", formatDate(device.expiresAt)],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between">
                  <dt className="text-xs text-gray-500">{label}</dt>
                  <dd className="text-sm text-gray-300">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Edit form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
            <h3 className="text-sm font-medium text-gray-300 mb-4">
              Edit Device
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Device Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={editExpiry}
                  onChange={(e) => setEditExpiry(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Notes
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">Active</label>
                <button
                  type="button"
                  onClick={() => setEditActive(!editActive)}
                  className={clsx(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    editActive ? "bg-blue-600" : "bg-gray-600"
                  )}
                >
                  <span
                    className={clsx(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      editActive ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <HiOutlineSave className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>

          {/* Assigned playlists */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-300">
                Assigned Playlists
              </h3>
              <button
                onClick={handleAssignPlaylist}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"
              >
                <HiOutlinePlus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
            {device.playlists && device.playlists.length > 0 ? (
              <div className="space-y-2">
                {device.playlists.map((pl) => (
                  <div
                    key={pl.id}
                    className="flex items-center justify-between px-3 py-2 bg-gray-700/50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm text-white">{pl.name}</p>
                      <p className="text-xs text-gray-500 uppercase">
                        {pl.type}
                      </p>
                    </div>
                    <button
                      onClick={() => setRemovePlaylistId(pl.id)}
                      className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No playlists assigned
              </p>
            )}
          </div>

          {/* Command history */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
            <h3 className="text-sm font-medium text-gray-300 mb-4">
              Command History
            </h3>
            {device.commandHistory && device.commandHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="px-3 py-2 text-left text-xs text-gray-400 uppercase">
                        Command
                      </th>
                      <th className="px-3 py-2 text-left text-xs text-gray-400 uppercase">
                        Payload
                      </th>
                      <th className="px-3 py-2 text-left text-xs text-gray-400 uppercase">
                        Status
                      </th>
                      <th className="px-3 py-2 text-left text-xs text-gray-400 uppercase">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {device.commandHistory.map((cmd) => (
                      <tr key={cmd.id}>
                        <td className="px-3 py-2 text-gray-300 font-mono text-xs">
                          {cmd.command}
                        </td>
                        <td className="px-3 py-2 text-gray-400 text-xs truncate max-w-[200px]">
                          {cmd.payload || "—"}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={clsx(
                              "inline-flex px-2 py-0.5 rounded-full text-xs font-medium",
                              cmd.status === "success"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : cmd.status === "pending"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-red-500/20 text-red-400"
                            )}
                          >
                            {cmd.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-500 text-xs">
                          {formatDate(cmd.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No commands sent yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <DeviceCommandDialog
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        onSend={handleSendCommand}
        deviceName={device.deviceName || device.macAddress}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Device"
        message="Are you sure you want to delete this device? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />

      <ConfirmDialog
        open={removePlaylistId !== null}
        onClose={() => setRemovePlaylistId(null)}
        onConfirm={() => removePlaylistId && handleRemovePlaylist(removePlaylistId)}
        title="Remove Playlist"
        message="Remove this playlist from the device?"
        confirmLabel="Remove"
        variant="warning"
      />

      {/* Toast */}
      {toast && (
        <div
          className={clsx(
            "fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg border",
            toast.type === "success"
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              : "bg-red-500/20 text-red-400 border-red-500/30"
          )}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
