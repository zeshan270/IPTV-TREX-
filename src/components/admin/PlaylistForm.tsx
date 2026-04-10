"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";

export interface PlaylistFormData {
  id?: string;
  name: string;
  type: "m3u" | "xtream";
  m3uUrl: string;
  serverUrl: string;
  username: string;
  password: string;
  isActive: boolean;
}

interface PlaylistFormProps {
  initial?: Partial<PlaylistFormData>;
  onSave: (data: PlaylistFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function PlaylistForm({
  initial,
  onSave,
  onCancel,
  loading = false,
}: PlaylistFormProps) {
  const [form, setForm] = useState<PlaylistFormData>({
    name: "",
    type: "m3u",
    m3uUrl: "",
    serverUrl: "",
    username: "",
    password: "",
    isActive: true,
    ...initial,
  });

  useEffect(() => {
    if (initial) {
      setForm((prev) => ({ ...prev, ...initial }));
    }
  }, [initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Playlist Name
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          placeholder="My Playlist"
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Type Toggle */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Type
        </label>
        <div className="flex gap-1 bg-gray-700 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setForm({ ...form, type: "m3u" })}
            className={clsx(
              "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors",
              form.type === "m3u"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white"
            )}
          >
            M3U
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, type: "xtream" })}
            className={clsx(
              "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors",
              form.type === "xtream"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white"
            )}
          >
            Xtream
          </button>
        </div>
      </div>

      {/* M3U fields */}
      {form.type === "m3u" && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            M3U URL
          </label>
          <input
            type="url"
            value={form.m3uUrl}
            onChange={(e) => setForm({ ...form, m3uUrl: e.target.value })}
            required
            placeholder="https://example.com/playlist.m3u"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      )}

      {/* Xtream fields */}
      {form.type === "xtream" && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Server URL
            </label>
            <input
              type="url"
              value={form.serverUrl}
              onChange={(e) => setForm({ ...form, serverUrl: e.target.value })}
              required
              placeholder="http://example.com:8080"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
                required
                placeholder="username"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                required
                placeholder="password"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </>
      )}

      {/* Active toggle */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">Active</label>
        <button
          type="button"
          onClick={() => setForm({ ...form, isActive: !form.isActive })}
          className={clsx(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
            form.isActive ? "bg-blue-600" : "bg-gray-600"
          )}
        >
          <span
            className={clsx(
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
              form.isActive ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : initial?.id ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}
