"use client";

import { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { HiOutlineTerminal } from "react-icons/hi";

const COMMAND_TYPES = [
  { value: "assign_playlist", label: "Assign Playlist", payloadLabel: "Playlist ID" },
  { value: "remove_playlist", label: "Remove Playlist", payloadLabel: "Playlist ID" },
  { value: "clear_cache", label: "Clear Cache", payloadLabel: null },
  { value: "restart", label: "Restart", payloadLabel: null },
  { value: "send_message", label: "Send Message", payloadLabel: "Message" },
  { value: "update", label: "Update", payloadLabel: "Version (optional)" },
] as const;

interface DeviceCommandDialogProps {
  open: boolean;
  onClose: () => void;
  onSend: (command: string, payload?: string) => Promise<void>;
  deviceName?: string;
}

export default function DeviceCommandDialog({
  open,
  onClose,
  onSend,
  deviceName,
}: DeviceCommandDialogProps) {
  const [commandType, setCommandType] = useState<string>(COMMAND_TYPES[0].value);
  const [payload, setPayload] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedCommand = COMMAND_TYPES.find((c) => c.value === commandType);

  const handleSend = async () => {
    setError("");
    setLoading(true);
    try {
      await onSend(commandType, payload || undefined);
      setPayload("");
      setCommandType(COMMAND_TYPES[0].value);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send command");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
              <HiOutlineTerminal className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-white">
                Send Command
              </DialogTitle>
              {deviceName && (
                <p className="text-xs text-gray-400">To: {deviceName}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* Command type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Command Type
              </label>
              <select
                value={commandType}
                onChange={(e) => {
                  setCommandType(e.target.value);
                  setPayload("");
                }}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {COMMAND_TYPES.map((cmd) => (
                  <option key={cmd.value} value={cmd.value}>
                    {cmd.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Payload input */}
            {selectedCommand?.payloadLabel && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  {selectedCommand.payloadLabel}
                </label>
                {commandType === "send_message" ? (
                  <textarea
                    value={payload}
                    onChange={(e) => setPayload(e.target.value)}
                    placeholder={`Enter ${selectedCommand.payloadLabel.toLowerCase()}...`}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={payload}
                    onChange={(e) => setPayload(e.target.value)}
                    placeholder={`Enter ${selectedCommand.payloadLabel.toLowerCase()}...`}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                )}
              </div>
            )}

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Command"}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
