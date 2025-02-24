"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { addDays} from 'date-fns';
import { reminderService } from '@/services/appwrite/reminderService';

// Types
type ReminderInterval = "daily" | "weekly" | "biweekly" | "monthly";
type InvoiceStatus = "sent" | "pending" | "failed";


interface InvoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendInvoice: (
    recipientEmail: string, 
    teamEmails: string[], 
    uploadedDetails?: UploadedInvoiceDetails
  ) => Promise<void>;
  recipientEmail: string;
  invoiceDate?: string;
  dueDate?: string;
  amount?: number;
  isUploadedInvoice?: boolean;
  uploadedInvoiceDetails?: UploadedInvoiceDetails;
}

interface UploadedInvoiceDetails {
  invoiceDate: string;
  dueDate: string;
  amount: number;
  invoiceName: string;
  paymentDetails: string;
}

interface InvoiceSettings {
  recipientEmail: string;
  teamEmails: string[];
  reminderEnabled: boolean;
  reminderInterval: ReminderInterval;
  reminderCount: number;
  reminderTime: string;
  uploadedInvoiceDetails: UploadedInvoiceDetails;
}

interface InvoiceRecord {
  id: string;
  recipientEmail: string;
  status: InvoiceStatus;
  createdAt: string;
  amount: number;
  teamEmails: string[];
  reminderEnabled: boolean;
  reminderInterval: ReminderInterval;
  reminderCount: number;
  invoiceDate: string;
  dueDate: string;
}



const InvoiceSettingsModal = ({
  isOpen,
  onClose,
  onSendInvoice,
  recipientEmail,
  isUploadedInvoice = false,
  uploadedInvoiceDetails
}: InvoiceSettingsModalProps) => {
  const [settings, setSettings] = useState<InvoiceSettings>({
    recipientEmail,
    teamEmails: [],
    reminderEnabled: false,
    reminderInterval: "weekly",
    reminderCount: 3,
    reminderTime: "09:00",
    uploadedInvoiceDetails: uploadedInvoiceDetails || {
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: addDays(new Date(), 30).toISOString().split('T')[0],
      amount: 0,
      invoiceName: "",
      paymentDetails: ""
    }
  });

  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const reminderToastShown = useRef(false);

  // Reset toast ref when modal closes
  useEffect(() => {
    if (!isOpen) {
      reminderToastShown.current = false;
    }
  }, [isOpen]);

  // Helper functions
  const saveInvoiceToStorage = (invoiceData: InvoiceRecord) => {
    try {
      const existingInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      const updatedInvoices = [invoiceData, ...existingInvoices].slice(0, 50);
      localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
      
      // Dispatch custom event to notify of invoice update
      window.dispatchEvent(new Event('invoiceUpdated'));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const scheduleReminders = async (invoiceRecord: InvoiceRecord) => {
    if (!settings.reminderEnabled) {
      return;
    }

    // const calculateNextReminderDate = (interval: ReminderInterval, index: number): Date => {
    //   const now = new Date();
    //   const dueDate = new Date(invoiceRecord.dueDate);
    //   const timeUntilDue = dueDate.getTime() - now.getTime();
    //   const daysUntilDue = Math.ceil(timeUntilDue / (1000 * 60 * 60 * 24));

    //   if (daysUntilDue <= 1) {
    //     return new Date(now.getTime() + 1000 * 60); // Set to 1 minute from now
    //   }

    //   switch (interval) {
    //     case 'daily':
    //       return addDays(now, index + 1);
    //     case 'weekly':
    //       const weeklyInterval = Math.max(1, Math.floor((daysUntilDue - 1) / settings.reminderCount));
    //       return addDays(now, (index + 1) * weeklyInterval);
    //     case 'biweekly':
    //       const biweeklyInterval = Math.max(2, Math.floor((daysUntilDue - 1) / settings.reminderCount));
    //       return addDays(now, (index + 1) * biweeklyInterval);
    //     case 'monthly':
    //       const monthlyInterval = Math.max(7, Math.floor((daysUntilDue - 1) / settings.reminderCount));
    //       return addDays(now, (index + 1) * monthlyInterval);
    //     default:
    //       return addDays(now, 1);
    //   }
    // };

    try {
      const [hours, minutes] = settings.reminderTime.split(':').map(Number);
      const currentDate = new Date();
      const reminderDate = new Date(currentDate);
      
      // Set the reminder time to the user's selected time
      reminderDate.setHours(hours, minutes, 0, 0);
      
      // If the time has already passed today, schedule for tomorrow
      if (reminderDate < currentDate) {
        reminderDate.setDate(reminderDate.getDate() + 1);
      }
      
      await reminderService.createReminder({
        invoiceId: invoiceRecord.id,
        recipientEmail: invoiceRecord.recipientEmail,
        dueDate: invoiceRecord.dueDate,
        amount: isUploadedInvoice ? settings.uploadedInvoiceDetails.amount : (uploadedInvoiceDetails?.amount || 0),
        sendDate: reminderDate.toISOString()
      });

      toast.success(`Reminder scheduled for ${reminderDate.toLocaleTimeString()}`);
    } catch (error) {
      console.error('Error scheduling reminders:', error);
      toast.error('Failed to schedule reminders');
    }
  };

  // Add email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email && emailRegex.test(email);
  };

  // Event handlers
  const handleSave = async () => {
    if (loading) return;
    
    // Validate recipient email
    if (!isValidEmail(settings.recipientEmail)) {
      toast.error("Please enter a valid recipient email address");
      return;
    }

    setLoading(true);
    
    try {
      console.log('Before sending:', {
        recipientEmail: settings.recipientEmail,
        teamEmails: settings.teamEmails,
        uploadedDetails: settings.uploadedInvoiceDetails
      });

      await onSendInvoice(
        settings.recipientEmail, 
        settings.teamEmails,
        isUploadedInvoice ? settings.uploadedInvoiceDetails : undefined  // Only pass uploadedDetails if it's an uploaded invoice
      );
      
      const invoiceRecord: InvoiceRecord = {
        id: `INV-${Date.now()}`,
        recipientEmail: settings.recipientEmail,
        status: "sent",
        createdAt: new Date().toISOString(),
        amount: isUploadedInvoice ? settings.uploadedInvoiceDetails.amount : (uploadedInvoiceDetails?.amount || 0),
        teamEmails: settings.teamEmails,
        reminderEnabled: settings.reminderEnabled,
        reminderInterval: settings.reminderInterval,
        reminderCount: settings.reminderCount,
        invoiceDate: settings.uploadedInvoiceDetails.invoiceDate,
        dueDate: settings.uploadedInvoiceDetails.dueDate
      };

      saveInvoiceToStorage(invoiceRecord);
      await scheduleReminders(invoiceRecord);
      
      onClose();
      toast.success("Invoice sent successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleReminderTimeChange = (time: string) => {
    setSettings(prev => ({ ...prev, reminderTime: time }));
    if (!reminderToastShown.current) {
      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-medium">Reminder Time Set! ⏰</span>
          <span className="text-sm text-gray-600">
            Reminders will be sent at {time} on scheduled days
          </span>
        </div>
      );
      reminderToastShown.current = true;
    }
  };

  const handleAddEmail = () => {
    if (emailInput && !settings.teamEmails.includes(emailInput)) {
      setSettings(prev => ({
        ...prev,
        teamEmails: [...prev.teamEmails, emailInput]
      }));
      setEmailInput('');
    }
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
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddEmail();
                    }
                  }}
                />
                <Button 
                  variant="outline" 
                  onClick={handleAddEmail}
                >
                  Add
                </Button>
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

                <div>
                  <label className="text-sm font-medium block">Payment Details</label>
                  <Input
                    type="text"
                    value={settings.uploadedInvoiceDetails.paymentDetails}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        uploadedInvoiceDetails: {
                          ...prev.uploadedInvoiceDetails,
                          paymentDetails: e.target.value
                        }
                      }))
                    }
                    placeholder="Add bank account or wallet address for payment"
                    className="w-full mt-1 font-mono"
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
              disabled={!isValidEmail(settings.recipientEmail) || loading}
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