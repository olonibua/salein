"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import InvoiceModal from "@/components/InvoiceModal";
import { cn } from "@/lib/utils";

interface TeamMember {
  email: string;
  id: string;
}

interface InvoiceSettingsPanelProps {
  onBack: () => void;
}

interface InvoiceSettingsState {
  recipientEmail: string;
  teamEmails: string[];
  amount: number;
  reminderEnabled: boolean;
  reminderInterval: "daily" | "weekly" | "biweekly" | "monthly";
  reminderCount: number;
}

const InvoiceSettingsPanel = ({ onBack }: InvoiceSettingsPanelProps) => {
  const [settings, setSettings] = useState<InvoiceSettingsState>({
    recipientEmail: "",
    teamEmails: [],
    amount: 0,
    reminderEnabled: false,
    reminderInterval: "weekly",
    reminderCount: 3,
  });
  const [newTeamEmail, setNewTeamEmail] = useState("");
  //   const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/invoices/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientEmail: settings.recipientEmail,
          teamEmails: settings.teamEmails,
          amount: settings.amount,
          reminderEnabled: settings.reminderEnabled,
          reminderInterval: settings.reminderInterval,
          reminderCount: settings.reminderCount,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save invoice settings");
      }

      toast.success("Settings saved successfully");
      setShowInvoiceModal(true);
    } catch (error) {
      toast.error("Failed to save settings");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addTeamMember = () => {
    if (!newTeamEmail || !newTeamEmail.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }

    // Check for duplicates
    if (settings.teamEmails.includes(newTeamEmail)) {
      toast.error("This email is already added");
      return;
    }

    setSettings((prev) => ({
      ...prev,
      teamEmails: [...prev.teamEmails, newTeamEmail],
    }));
    setNewTeamEmail("");
    toast.success("Team member added successfully");
  };

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-100",
        "w-full md:w-[380px] lg:w-[420px]", // Responsive widths
        "h-screen fixed top-0 right-0 md:relative", // Full height, fixed on mobile
        "transition-all duration-300 ease-in-out", // Smooth transitions
        "z-50" // Ensure it's above other content
      )}
    >
      {/* Header */}
      <div className="sticky top-0 bg-white z-10">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl md:text-2xl font-semibold">
              Invoice Settings
            </h1>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div
        className={cn(
          "h-[calc(100vh-76px)] overflow-y-auto",
          "scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300",
          "pb-safe" // iOS safe area padding
        )}
      >
        <div className="p-4 md:p-6 space-y-6 md:space-y-8">
          {/* Recipient Details */}
          <section className="space-y-4">
            <h2 className="text-sm font-medium text-gray-500">
              RECIPIENT DETAILS
            </h2>
            <div className="space-y-3">
              <label className="text-sm font-medium block">
                Default Recipient Email
              </label>
              <Input
                type="email"
                value={settings.recipientEmail}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    recipientEmail: e.target.value,
                  }))
                }
                placeholder="recipient@example.com"
                className="w-full"
              />
            </div>
          </section>

          {/* Team Members */}
          <section className="space-y-4">
            <h2 className="text-sm font-medium text-gray-500">TEAM MEMBERS</h2>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={newTeamEmail}
                  onChange={(e) => setNewTeamEmail(e.target.value)}
                  placeholder="team@example.com"
                  className="flex-1"
                />
                <Button
                  onClick={addTeamMember}
                  variant="outline"
                  className="whitespace-nowrap"
                >
                  Add
                </Button>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {settings.teamEmails.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                  >
                    <span className="text-sm truncate flex-1 mr-2">
                      {email}
                    </span>
                    <button
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          teamEmails: prev.teamEmails.filter(
                            (e) => e !== email
                          ),
                        }))
                      }
                      className="text-gray-400 hover:text-gray-600 p-1"
                      aria-label="Remove team member"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Reminders */}
          <section className="space-y-4">
            <h2 className="text-sm font-medium text-gray-500">
              REMINDER SETTINGS
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Enable Reminders</label>
                <Switch
                  checked={settings.reminderEnabled}
                  onCheckedChange={(value) =>
                    setSettings((prev) => ({ ...prev, reminderEnabled: value }))
                  }
                />
              </div>

              {settings.reminderEnabled && (
                <div className="space-y-4 animate-in fade-in-50">
                  <div className="space-y-2">
                    <label className="text-sm font-medium block">
                      Number of Reminders
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={settings.reminderCount}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          reminderCount: Number(e.target.value),
                        }))
                      }
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium block">
                      Reminder Interval
                    </label>
                    <select
                      className="w-full rounded-md border p-2.5 bg-white"
                      value={settings.reminderInterval}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          reminderInterval: e.target.value as
                            | "daily"
                            | "weekly"
                            | "biweekly"
                            | "monthly",
                        }))
                      }
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Save Button - Fixed at bottom on mobile */}
          <div
            className={cn(
              "mt-6 md:mt-8",
              "sticky bottom-0 left-0 right-0",
              "bg-white p-4 md:p-0",
              "border-t md:border-0 border-gray-100"
            )}
          >
            <Button
              className="w-full h-11"
              onClick={handleSaveSettings}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>

      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => {
          setShowInvoiceModal(false);
          onBack();
        }}
        recipientEmail={settings.recipientEmail}
        reminderEnabled={settings.reminderEnabled}
        mode="settings"
        settings={{
          teamEmails: settings.teamEmails,
          reminderCount: settings.reminderCount,
          reminderInterval: settings.reminderInterval,
        }}
      />
    </div>
  );
};

export default InvoiceSettingsPanel;
