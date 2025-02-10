"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Plus, Upload, FileText, Clock } from "lucide-react";
import InvoiceModal from "@/components/InvoiceModal";
import { cn } from "@/lib/utils";
import InvoiceCreationPanel from "./InvoiceCreationPanel";
import Invoice from "../Invoice/Invoice";
import UploadInvoiceModal from "../Invoice/UploadInvoiceModal";

// interface TeamMember {
//   email: string;
//   id: string;
// }

interface InvoiceSettingsPanelProps {
  onBack: () => void;
}

type InvoiceMode = "create" | "upload" | null;
type ViewMode = "list" | "create" | "upload";

interface InvoiceRecord {
  id: string;
  recipientEmail: string;
  status: "sent" | "pending" | "failed";
  createdAt: string;
  amount: number;
}

type ReminderInterval = "daily" | "weekly" | "biweekly" | "monthly";

const InvoiceSettingsPanel = ({ onBack }: InvoiceSettingsPanelProps) => {
  // State for view management
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [invoiceMode, setInvoiceMode] = useState<InvoiceMode>(null);
  
  // State for invoice records
  const [invoiceRecords, setInvoiceRecords] = useState<InvoiceRecord[]>([]);
  
  // Original settings state
  const [settings, setSettings] = useState({
    recipientEmail: "",
    teamEmails: [] as string[],
    amount: 0,
    reminderEnabled: false,
    reminderInterval: "weekly" as ReminderInterval,
    reminderCount: 3,
  });

  const [loading, setLoading] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Handle mode selection
  const handleModeSelection = (mode: InvoiceMode) => {
    if (mode === "upload") {
      setShowUploadModal(true);
    } else {
      setInvoiceMode(mode);
      setViewMode("create");
    }
  };

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
    if (!settings.teamEmails.includes(settings.recipientEmail)) {
      setSettings((prev) => ({
        ...prev,
        teamEmails: [...prev.teamEmails, prev.recipientEmail],
      }));
    }
  };

  const handleInvoiceUploaded = () => {
    setShowUploadModal(false);
    setIsTransitioning(true);
    setViewMode("upload");
    setTimeout(() => setIsTransitioning(false), 300);
  };

  return (
    <div className={cn("flex w-full h-screen bg-gray-50", {
      "opacity-50 transition-opacity duration-300": isTransitioning
    })}>
      {/* Main Panel - Now wider */}
      <div
        className={cn(
          "w-full",
          "h-screen border-r border-gray-200 bg-white",
          ""
        )}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="p-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Invoice Dashboard</h1>
            {viewMode !== "list" && (
              <Button
                variant="ghost"
                onClick={() => {
                  setViewMode("list");
                  setInvoiceMode(null);
                }}
              >
                <ArrowLeft className="mr-2" size={16} />
                Back to Dashboard
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {viewMode === "list" ? (
            <>
              {/* Mode Selection Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <button
                  onClick={() => handleModeSelection("create")}
                  className="p-6 border rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Plus className="text-blue-600" size={24} />
                    </div>
                    <h2 className="text-xl font-semibold">
                      Create New Invoice
                    </h2>
                  </div>
                  <p className="text-gray-600">
                    Create a professional invoice using our template
                  </p>
                </button>

                <button
                  onClick={() => handleModeSelection("upload")}
                  className="p-6 border rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Upload className="text-blue-600" size={24} />
                    </div>
                    <h2 className="text-xl font-semibold">Upload Invoice</h2>
                  </div>
                  <p className="text-gray-600">
                    Upload an existing invoice to send
                  </p>
                </button>
              </div>

              {/* Recent Invoices */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Recent Invoices</h2>
                  <Button variant="outline">
                    <FileText className="mr-2" size={16} />
                    View All
                  </Button>
                </div>

                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invoice
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Recipient
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* Placeholder for invoice records */}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : viewMode === "create" ? (
            <div className="flex flex-1 md:space-x-3 p-10 bg-gray-100 mx-auto">
              <div className="hidden md:block flex-1 ">
                <Invoice />
              </div>
              <InvoiceCreationPanel
                onUpload={() => {}}
                onCreateInvoice={() => {}}
                //@ts-ignore
                // onUpload={() => setShowUploadModal(true)}
                //@ts-ignore
                // onCreateInvoice={handleInvoiceCreated}
              />
            </div>
          ) : (
            
            // Upload view - maintain original settings panel functionality
            <div className="max-w-2xl mx-auto">
              {/* Original settings content */}
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
                <h2 className="text-sm font-medium text-gray-500">
                  TEAM MEMBERS
                </h2>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      value={settings.recipientEmail}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          recipientEmail: e.target.value,
                        }))
                      }
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
                    <label className="text-sm font-medium">
                      Enable Reminders
                    </label>
                    <Switch
                      checked={settings.reminderEnabled}
                      onCheckedChange={(value) =>
                        setSettings((prev) => ({
                          ...prev,
                          reminderEnabled: value,
                        }))
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
          )}
        </div>
      </div>

      {/* Preview Panel - Only show in create/upload mode */}
      {viewMode !== "list" && (
        <div className="hidden lg:block flex-1 bg-gray-50 p-6">
          {/* Preview content */}
        </div>
      )}

      {/* Modals */}
      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        recipientEmail={settings.recipientEmail}
        settings={{
          teamEmails: settings.teamEmails,
          reminderCount: settings.reminderCount,
          reminderInterval: settings.reminderInterval,
        }}
      />

      {/* Add Modal */}
      <UploadInvoiceModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleInvoiceUploaded}
      />
    </div>
  );
};

export default InvoiceSettingsPanel;
