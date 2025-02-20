import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { addDays, addWeeks, addMonths } from 'date-fns';

interface InvoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendInvoice: (recipientEmail: string, teamEmails: string[], uploadedInvoiceDetails?: any) => Promise<void>;
  recipientEmail: string;
  invoiceDate?: string;  // Make optional
  dueDate?: string;      // Make optional
  amount?: number;       // Make optional
  isUploadedInvoice?: boolean; // New prop to check if invoice was uploaded
}

interface InvoiceRecord {
  id: string;
  recipientEmail: string;
  status: "sent" | "pending" | "failed";
  createdAt: string;
  amount: number;
  teamEmails: string[];
  reminderEnabled: boolean;
  reminderInterval: "daily" | "weekly" | "biweekly" | "monthly";
  reminderCount: number;
  invoiceDate: string;
  dueDate: string;
}

interface ReminderSettings {
  enabled: boolean;
  interval: "daily" | "weekly" | "biweekly" | "monthly";
  count: number;
  time: string; // 24-hour format HH:mm
}

const InvoiceSettingsModal = ({
  isOpen,
  onClose,
  onSendInvoice,
  recipientEmail,
  invoiceDate,
  dueDate,
  amount,
  isUploadedInvoice = false
}: InvoiceSettingsModalProps) => {
  console.log('isUploadedInvoice:', isUploadedInvoice);
  const [settings, setSettings] = useState({
    recipientEmail: recipientEmail,
    teamEmails: [] as string[],
    reminderEnabled: false,
    reminderInterval: "weekly" as "daily" | "weekly" | "biweekly" | "monthly",
    reminderCount: 3,
    reminderTime: "09:00",
    // New fields for uploaded invoices
    uploadedInvoiceDetails: {
      invoiceDate: invoiceDate || new Date().toISOString().split('T')[0],
      dueDate: dueDate || addDays(new Date(), 30).toISOString().split('T')[0],
      amount: amount || 0,
      invoiceName: ""
    }
  });

  // console.log(settings);
  const [loading, setLoading] = useState(false);

  const saveInvoiceToStorage = (invoiceData: InvoiceRecord) => {
    try {
      const existingInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');

      const updatedInvoices = [invoiceData, ...existingInvoices].slice(0, 50); // Keep last 50 invoices
      localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };
  

  const scheduleReminders = async (invoiceRecord: InvoiceRecord) => {
    if (!settings.reminderEnabled) return;

    const calculateNextReminderDate = (interval: string, index: number) => {
      const dueDate = new Date(invoiceRecord.dueDate);
      switch (interval) {
        case 'daily':
          return addDays(dueDate, -index);
        case 'weekly':
          return addWeeks(dueDate, -index);
        case 'biweekly':
          return addWeeks(dueDate, -(index * 2));
        case 'monthly':
          return addMonths(dueDate, -index);
        default:
          return dueDate;
      }
    };

    try {
      // Schedule reminders
      for (let i = 1; i <= settings.reminderCount; i++) {
        const reminderDate = calculateNextReminderDate(settings.reminderInterval, i);
        
        // Store reminder in localStorage
        const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
        reminders.push({
          invoiceId: invoiceRecord.id,
          recipientEmail: invoiceRecord.recipientEmail,
          dueDate: invoiceRecord.dueDate,
          amount: amount,
          sendDate: reminderDate.toISOString(),
          status: 'pending'
        });
        localStorage.setItem('reminders', JSON.stringify(reminders));
      }
    } catch (error) {
      console.error('Error scheduling reminders:', error);
    }
  };

  const handleSave = async () => {
    console.log('Settings before save:', settings); // Debug log
    console.log('Is uploaded invoice:', isUploadedInvoice); // Debug log
    
    setLoading(true);
    try {
      if (!settings.recipientEmail) {
        toast.error("Recipient email is required");
        return;
      }

      const uploadedDetails = isUploadedInvoice ? {
        invoiceDate: settings.uploadedInvoiceDetails.invoiceDate,
        dueDate: settings.uploadedInvoiceDetails.dueDate,
        amount: settings.uploadedInvoiceDetails.amount,
        invoiceName: settings.uploadedInvoiceDetails.invoiceName
      } : null;

      console.log('Uploaded details being passed:', uploadedDetails); // Debug log

      await onSendInvoice(
        settings.recipientEmail, 
        settings.teamEmails,
        uploadedDetails
      );
      
      // Create invoice record with the correct date format
      const invoiceRecord: InvoiceRecord = {
        id: `INV-${Date.now()}`,
        recipientEmail: settings.recipientEmail,
        status: "sent",
        createdAt: new Date().toISOString(),
        amount: isUploadedInvoice ? settings.uploadedInvoiceDetails.amount : (amount || 0),
        teamEmails: settings.teamEmails,
        reminderEnabled: settings.reminderEnabled,
        reminderInterval: settings.reminderInterval,
        reminderCount: settings.reminderCount,
        // Use the dates as they are, without converting to ISO string
        invoiceDate: settings.uploadedInvoiceDetails.invoiceDate,
        dueDate: settings.uploadedInvoiceDetails.dueDate
      };

      // console.log('Saving invoice record with dates:', { 
      //   invoiceDate: invoiceRecord.invoiceDate, 
      //   dueDate: invoiceRecord.dueDate,
      //   originalDates: { invoiceDate, dueDate }
      // });

      saveInvoiceToStorage(invoiceRecord);
      
      await scheduleReminders(invoiceRecord);
      
      onClose();
      toast.success("Invoice sent successfully!");
    } catch (error) {
      toast.error("Failed to send invoice");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReminderTimeChange = (time: string) => {
    setSettings((prev) => ({
      ...prev,
      reminderTime: time,
    }));

    toast.success(
      <div className="flex flex-col gap-1">
        <span className="font-medium">Reminder Time Set! ⏰</span>
        <span className="text-sm text-gray-600">
          Reminders will be sent at {time} on scheduled days
        </span>
      </div>,
      {
        duration: 4000,
        className: "bg-gradient-to-r from-blue-50 to-indigo-50",
        position: "bottom-right",
        style: {
          animation: "slide-up 0.4s ease-out",
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="space-y-6 py-4">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Invoice Settings</h2>
            <p className="text-gray-500">Configure your invoice settings before sending</p>
          </div>

          {/* Recipient Details */}
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500">RECIPIENT DETAILS</h3>
            <div className="space-y-3">
              <label className="text-sm font-medium block">Recipient Email</label>
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
            <h3 className="text-sm font-medium text-gray-500">TEAM MEMBERS</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="team@example.com"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement;
                      if (input.value && !settings.teamEmails.includes(input.value)) {
                        setSettings(prev => ({
                          ...prev,
                          teamEmails: [...prev.teamEmails, input.value]
                        }));
                        input.value = '';
                      }
                    }
                  }}
                />
                <Button variant="outline">Add</Button>
              </div>
              <div className="space-y-2">
                {settings.teamEmails.map((email) => (
                  <div key={email} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="text-sm">{email}</span>
                    <button
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          teamEmails: prev.teamEmails.filter((e) => e !== email),
                        }))
                      }
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Uploaded Invoice Details Section */}
          {isUploadedInvoice && (
            <section className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500">INVOICE DETAILS</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block">Invoice Name</label>
                  <Input
                    type="text"
                    value={settings.uploadedInvoiceDetails.invoiceName}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        uploadedInvoiceDetails: {
                          ...prev.uploadedInvoiceDetails,
                          invoiceName: e.target.value
                        }
                      }))
                    }
                    placeholder="Enter invoice name"
                    className="w-full mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block">Invoice Date</label>
                  <Input
                    type="date"
                    value={settings.uploadedInvoiceDetails.invoiceDate}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        uploadedInvoiceDetails: {
                          ...prev.uploadedInvoiceDetails,
                          invoiceDate: e.target.value
                        }
                      }))
                    }
                    className="w-full mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block">Due Date</label>
                  <Input
                    type="date"
                    value={settings.uploadedInvoiceDetails.dueDate}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        uploadedInvoiceDetails: {
                          ...prev.uploadedInvoiceDetails,
                          dueDate: e.target.value
                        }
                      }))
                    }
                    className="w-full mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block">Amount</label>
                  <Input
                    type="number"
                    value={settings.uploadedInvoiceDetails.amount}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        uploadedInvoiceDetails: {
                          ...prev.uploadedInvoiceDetails,
                          amount: parseFloat(e.target.value)
                        }
                      }))
                    }
                    placeholder="0.00"
                    className="w-full mt-1"
                  />
                </div>
              </div>
            </section>
          )}

          {/* Reminder Settings */}
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500">REMINDER SETTINGS</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Enable Reminders</label>
                <Switch
                  checked={settings.reminderEnabled}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, reminderEnabled: checked }))
                  }
                />
              </div>

              {settings.reminderEnabled && (
                <div className="space-y-4 animate-in fade-in-50">
                  <div className="space-y-2">
                    <label className="text-sm font-medium block">Reminder Interval</label>
                    <select
                      className="w-full rounded-md border p-2"
                      value={settings.reminderInterval}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          reminderInterval: e.target.value as typeof settings.reminderInterval,
                        }))
                      }
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium block">Number of Reminders</label>
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
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium block">Reminder Time</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={settings.reminderTime}
                        onChange={(e) => handleReminderTimeChange(e.target.value)}
                        className="flex-1"
                      />
                      <div className="text-sm text-gray-500">
                        {settings.reminderTime ? (
                          <span>
                            {new Date(`2000-01-01T${settings.reminderTime}`).toLocaleTimeString([], {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                        ) : (
                          'Set time'
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Reminders will be sent at this time on scheduled days
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-black text-white"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Invoice"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceSettingsModal; 