"use client";

import { useEffect, useState, useCallback } from "react";
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineLightningBolt,
  HiOutlineBan,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi";
import DeviceTable, { DeviceRow } from "@/components/admin/DeviceTable";
import DeviceCommandDialog from "@/components/admin/DeviceCommandDialog";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { adminFetch } from "@/lib/admin-store";
import clsx from "clsx";

const PAGE_SIZE = 20;
const STATUS_OPTIONS = ["All", "Active", "Inactive", "Expired"] as const;

export default function AdminDevicesPage() {
  const [devices, setDevices] = useState<DeviceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Dialogs
  const [commandDeviceId, setCommandDeviceId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [bulkAction, setBulkAction] = useState<"activate" | "deactivate" | "delete" | null>(null);
  const [addFormOpen, setAddFormOpen] = useState(false);

  // Add device form
  const [newMac, setNewMac] = useState("");
  const [newName, setNewName] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDevices = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: PAGE_SIZE.toString(),
      });
      if (search) params.set("search", search);
      if (statusFilter !== "All") params.set("status", statusFilter.toLowerCase());

      const res = await adminFetch(`/api/devices?${params}`);
      if (!res.ok) throw new Error("Failed to fetch devices");
      const data = await res.json();

      const deviceList = Array.isArray(data) ? data : data.devices ?? [];
      setDevices(deviceList);
      setTotal(data.total ?? deviceList.length);
    } catch {
      showToast("Failed to load devices", "error");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    setLoading(true);
    fetchDevices();
  }, [fetchDevices]);

  // Debounce search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const res = await adminFetch(`/api/devices/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: active }),
      });
      if (!res.ok) throw new Error();
      setDevices((prev) =>
        prev.map((d) => (d.id === id ? { ...d, isActive: active } : d))
      );
      showToast(`Device ${active ? "activated" : "deactivated"}`);
    } catch {
      showToast("Action failed", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await adminFetch(`/api/devices/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setDevices((prev) => prev.filter((d) => d.id !== id));
      setSelected((prev) => prev.filter((s) => s !== id));
      showToast("Device deleted");
    } catch {
      showToast("Failed to delete device", "error");
    }
    setDeleteTarget(null);
  };

  const handleSendCommand = async (command: string, payload?: string) => {
    if (!commandDeviceId) return;
    const res = await adminFetch(`/api/devices/${commandDeviceId}/command`, {
      method: "POST",
      body: JSON.stringify({ command, payload }),
    });
    if (!res.ok) throw new Error("Failed to send command");
    showToast("Command sent");
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selected.length === 0) return;
    try {
      for (const id of selected) {
        if (bulkAction === "delete") {
          await adminFetch(`/api/devices/${id}`, { method: "DELETE" });
        } else {
          await adminFetch(`/api/devices/${id}`, {
            method: "PUT",
            body: JSON.stringify({
              isActive: bulkAction === "activate",
            }),
          });
        }
      }
      showToast(`Bulk ${bulkAction} completed for ${selected.length} devices`);
      setSelected([]);
      fetchDevices();
    } catch {
      showToast("Bulk action failed", "error");
    }
    setBulkAction(null);
  };

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      const res = await adminFetch("/api/devices", {
        method: "POST",
        body: JSON.stringify({ macAddress: newMac, deviceName: newName }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to add device");
      }
      showToast("Device added");
      setNewMac("");
      setNewName("");
      setAddFormOpen(false);
      fetchDevices();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to add device", "error");
    } finally {
      setAddLoading(false);
    }
  };

  const commandDevice = devices.find((d) => d.id === commandDeviceId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Devices</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage all registered devices
          </p>
        </div>
        <button
          onClick={() => setAddFormOpen(!addFormOpen)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Add Device
        </button>
      </div>

      {/* Add device form */}
      {addFormOpen && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-300 mb-4">
            Add New Device
          </h3>
          <form
            onSubmit={handleAddDevice}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="text"
              value={newMac}
              onChange={(e) => setNewMac(e.target.value)}
              placeholder="MAC Address (e.g. 00:1A:2B:3C:4D:5E)"
              required
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Device Name (optional)"
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={addLoading}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {addLoading ? "Adding..." : "Add"}
              </button>
              <button
                type="button"
                onClick={() => setAddFormOpen(false)}
                className="px-4 py-2 bg-gray-700 text-gray-300 text-sm rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters + Bulk actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search MAC or name..."
              className="pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Bulk actions */}
        {selected.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">
              {selected.length} selected
            </span>
            <button
              onClick={() => setBulkAction("activate")}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30"
            >
              <HiOutlineLightningBolt className="w-3.5 h-3.5" />
              Activate
            </button>
            <button
              onClick={() => setBulkAction("deactivate")}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30"
            >
              <HiOutlineBan className="w-3.5 h-3.5" />
              Deactivate
            </button>
            <button
              onClick={() => setBulkAction("delete")}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
            >
              <HiOutlineTrash className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Device table */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <DeviceTable
            devices={devices}
            selected={selected}
            onSelectChange={setSelected}
            onToggleActive={handleToggleActive}
            onDelete={(id) => setDeleteTarget(id)}
            onSendCommand={(id) => setCommandDeviceId(id)}
          />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing {(page - 1) * PAGE_SIZE + 1} -{" "}
            {Math.min(page * PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <HiOutlineChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={clsx(
                    "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                    page === pageNum
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <HiOutlineChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Command dialog */}
      <DeviceCommandDialog
        open={commandDeviceId !== null}
        onClose={() => setCommandDeviceId(null)}
        onSend={handleSendCommand}
        deviceName={commandDevice?.deviceName || commandDevice?.macAddress}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Delete Device"
        message="Are you sure you want to delete this device? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />

      {/* Bulk action confirm */}
      <ConfirmDialog
        open={bulkAction !== null}
        onClose={() => setBulkAction(null)}
        onConfirm={handleBulkAction}
        title={`Bulk ${bulkAction}`}
        message={`Are you sure you want to ${bulkAction} ${selected.length} device(s)?`}
        confirmLabel={bulkAction === "delete" ? "Delete All" : "Confirm"}
        variant={bulkAction === "delete" ? "danger" : "warning"}
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
