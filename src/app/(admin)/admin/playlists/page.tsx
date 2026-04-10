"use client";

import { useEffect, useState, useCallback } from "react";
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineLink,
} from "react-icons/hi";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import PlaylistForm, { PlaylistFormData } from "@/components/admin/PlaylistForm";
import AssignPlaylistDialog from "@/components/admin/AssignPlaylistDialog";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { adminFetch } from "@/lib/admin-store";
import clsx from "clsx";

interface Playlist {
  id: string;
  name: string;
  type: "m3u" | "xtream";
  m3uUrl?: string;
  serverUrl?: string;
  username?: string;
  password?: string;
  isActive: boolean;
  deviceCount?: number;
  createdAt?: string;
}

interface DeviceOption {
  id: string;
  macAddress: string;
  deviceName: string;
}

export default function AdminPlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [assignPlaylistId, setAssignPlaylistId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [devices, setDevices] = useState<DeviceOption[]>([]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPlaylists = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await adminFetch(`/api/playlists?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPlaylists(Array.isArray(data) ? data : data.playlists ?? []);
    } catch {
      showToast("Failed to load playlists", "error");
    } finally {
      setLoading(false);
    }
  }, [search]);

  const fetchDevices = useCallback(async () => {
    try {
      const res = await adminFetch("/api/devices?limit=1000");
      if (!res.ok) return;
      const data = await res.json();
      setDevices(Array.isArray(data) ? data : data.devices ?? []);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleSave = async (data: PlaylistFormData) => {
    setFormLoading(true);
    try {
      const body: Record<string, unknown> = {
        name: data.name,
        type: data.type,
        isActive: data.isActive,
      };
      if (data.type === "m3u") {
        body.m3uUrl = data.m3uUrl;
      } else {
        body.serverUrl = data.serverUrl;
        body.username = data.username;
        body.password = data.password;
      }

      if (editingPlaylist) {
        const res = await adminFetch(`/api/playlists/${editingPlaylist.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error();
        showToast("Playlist updated");
      } else {
        const res = await adminFetch("/api/playlists", {
          method: "POST",
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error();
        showToast("Playlist created");
      }
      setFormOpen(false);
      setEditingPlaylist(null);
      fetchPlaylists();
    } catch {
      showToast("Failed to save playlist", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await adminFetch(`/api/playlists/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("Playlist deleted");
      fetchPlaylists();
    } catch {
      showToast("Failed to delete playlist", "error");
    }
    setDeleteTarget(null);
  };

  const handleToggleActive = async (pl: Playlist) => {
    try {
      const res = await adminFetch(`/api/playlists/${pl.id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !pl.isActive }),
      });
      if (!res.ok) throw new Error();
      setPlaylists((prev) =>
        prev.map((p) =>
          p.id === pl.id ? { ...p, isActive: !p.isActive } : p
        )
      );
    } catch {
      showToast("Failed to toggle playlist", "error");
    }
  };

  const handleAssign = async (deviceIds: string[]) => {
    if (!assignPlaylistId) return;
    const res = await adminFetch(`/api/playlists/${assignPlaylistId}/assign`, {
      method: "POST",
      body: JSON.stringify({ deviceIds }),
    });
    if (!res.ok) throw new Error("Failed to assign playlist");
    showToast(`Playlist assigned to ${deviceIds.length} device(s)`);
    fetchPlaylists();
  };

  const openEdit = (pl: Playlist) => {
    setEditingPlaylist(pl);
    setFormOpen(true);
  };

  const openCreate = () => {
    setEditingPlaylist(null);
    setFormOpen(true);
  };

  const openAssign = (id: string) => {
    setAssignPlaylistId(id);
    fetchDevices();
  };

  const assignPlaylist = playlists.find((p) => p.id === assignPlaylistId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Playlists</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage M3U and Xtream playlists
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Create Playlist
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-64">
        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search playlists..."
          className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    URL / Server
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Active
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                    Devices
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {playlists.map((pl) => (
                  <tr
                    key={pl.id}
                    className="hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-white font-medium">
                      {pl.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-300 uppercase">
                        {pl.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs truncate max-w-[250px] hidden md:table-cell">
                      {pl.type === "m3u"
                        ? pl.m3uUrl || "—"
                        : pl.serverUrl || "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleActive(pl)}
                        className={clsx(
                          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                          pl.isActive ? "bg-blue-600" : "bg-gray-600"
                        )}
                      >
                        <span
                          className={clsx(
                            "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                            pl.isActive ? "translate-x-4.5" : "translate-x-0.5"
                          )}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-400 text-xs hidden sm:table-cell">
                      {pl.deviceCount ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(pl)}
                          title="Edit"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                        >
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openAssign(pl.id)}
                          title="Assign to Devices"
                          className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-colors"
                        >
                          <HiOutlineLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(pl.id)}
                          title="Delete"
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {playlists.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-gray-500"
                    >
                      No playlists found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Playlist form dialog */}
      <Dialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingPlaylist(null);
        }}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-2xl">
            <DialogTitle className="text-lg font-semibold text-white mb-5">
              {editingPlaylist ? "Edit Playlist" : "Create Playlist"}
            </DialogTitle>
            <PlaylistForm
              initial={
                editingPlaylist
                  ? {
                      id: editingPlaylist.id,
                      name: editingPlaylist.name,
                      type: editingPlaylist.type,
                      m3uUrl: editingPlaylist.m3uUrl || "",
                      serverUrl: editingPlaylist.serverUrl || "",
                      username: editingPlaylist.username || "",
                      password: editingPlaylist.password || "",
                      isActive: editingPlaylist.isActive,
                    }
                  : undefined
              }
              onSave={handleSave}
              onCancel={() => {
                setFormOpen(false);
                setEditingPlaylist(null);
              }}
              loading={formLoading}
            />
          </DialogPanel>
        </div>
      </Dialog>

      {/* Assign dialog */}
      <AssignPlaylistDialog
        open={assignPlaylistId !== null}
        onClose={() => setAssignPlaylistId(null)}
        onAssign={handleAssign}
        devices={devices}
        playlistName={assignPlaylist?.name}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Delete Playlist"
        message="Are you sure you want to delete this playlist? Devices using it will lose access."
        confirmLabel="Delete"
        variant="danger"
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
