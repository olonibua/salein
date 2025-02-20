"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

import { ArrowLeft, Plus, Upload, FileText, Clock, Trash2 } from "lucide-react";
import InvoiceModal from "@/components/InvoiceModal";
import { cn } from "@/lib/utils";
import InvoiceCreationPanel from "./InvoiceCreationPanel";
import Invoice from "../Invoice/Invoice";
import UploadInvoiceModal from "../Invoice/UploadInvoiceModal";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
  teamEmails: string[];
  reminderEnabled: boolean;
  reminderInterval: "daily" | "weekly" | "biweekly" | "monthly";
  reminderCount: number;
  invoiceDate: string;
  dueDate: string;
}

type ReminderInterval = "daily" | "weekly" | "biweekly" | "monthly";

const InvoiceSettingsPanel = ({ onBack }: InvoiceSettingsPanelProps) => {
  // State for view management
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [invoiceMode, setInvoiceMode] = useState<InvoiceMode>(null);
  
  // State for invoice records
  const [invoiceRecords, setInvoiceRecords] = useState<InvoiceRecord[]>([]);
  console.log(invoiceRecords)
  const [loading, setLoading] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Add state for countdown
  const [countdowns, setCountdowns] = useState<{ [key: string]: string }>({});

  const router = useRouter();

  // Add useEffect to load invoices from localStorage
  useEffect(() => {
    const loadInvoices = () => {
      try {
        const savedInvoices = localStorage.getItem('invoices');
        if (savedInvoices) {
          setInvoiceRecords(JSON.parse(savedInvoices));
        }
      } catch (error) {
        console.error('Error loading invoices:', error);
      }
    };

    loadInvoices();
    // Add event listener for storage changes
    window.addEventListener('storage', loadInvoices);
    return () => window.removeEventListener('storage', loadInvoices);
  }, []);

  // Update countdowns every second
  useEffect(() => {
    const updateCountdowns = () => {
      const newCountdowns: { [key: string]: string } = {};
      invoiceRecords.forEach((invoice) => {
        if (invoice.dueDate) {
          const dueDate = new Date(invoice.dueDate);
          const now = new Date();
          
          // Ensure proper date comparison
          if (dueDate.getTime() > now.getTime()) {
            newCountdowns[invoice.id] = formatDistanceToNow(dueDate, { 
              addSuffix: true,
              includeSeconds: true 
            });
          } else {
            newCountdowns[invoice.id] = 'Overdue';
          }
        }
      });
      setCountdowns(newCountdowns);
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000); // Update every second for more accuracy
    return () => clearInterval(interval);
  }, [invoiceRecords]);

  // Handle mode selection
  const handleModeSelection = (mode: InvoiceMode) => {
    if (mode === "upload") {
      setShowUploadModal(true);
    } else {
      setInvoiceMode(mode);
      setViewMode("create");
    }
  };

  const handleInvoiceUploaded = () => {
    setShowUploadModal(false);
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleDeleteInvoice = (id: string) => {
    try {
      // Get current invoices from localStorage
      const savedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      // Filter out the deleted invoice
      const updatedInvoices = savedInvoices.filter((invoice: InvoiceRecord) => invoice.id !== id);
      // Save back to localStorage
      localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
      // Update state
      setInvoiceRecords(updatedInvoices);
      
      toast.success("Invoice deleted successfully");
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error("Failed to delete invoice");
    }
  };

  return (
    <div className={cn("flex w-full h-screen bg-gray-50", {
      "opacity-50 transition-opacity duration-300": isTransitioning
    })}>
      {/* Main Panel - Now wider */}
      <div className={cn("w-full h-screen border-r border-gray-200 bg-white")}>
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
                    <h2 className="text-xl font-semibold">Create New Invoice</h2>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due In</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoiceRecords.map((invoice) => (
                        <tr key={invoice.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">
                              {invoice.id}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-500">
                              {invoice.recipientEmail}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              invoice.status === 'sent' 
                                ? 'bg-green-100 text-green-800'
                                : invoice.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {invoice.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            £{(invoice.amount || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            }) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            }) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm ${
                              countdowns[invoice.id]?.toLowerCase().includes('ago') ? 'text-red-500' : 'text-gray-500'
                            }`}>
                              {countdowns[invoice.id] || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <button
                              onClick={() => handleDeleteInvoice(invoice.id)}
                              className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-full"
                              title="Delete Invoice"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : viewMode === "create" ? (
            <div className="flex flex-1 md:space-x-3 p-10 bg-gray-100 mx-auto">
              <div className="hidden md:block flex-1">
                <Invoice />
              </div>
              <InvoiceCreationPanel
                onUpload={() => {}}
                onCreateInvoice={() => {}}
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* Modals */}
      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        recipientEmail=""
      />

      <UploadInvoiceModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleInvoiceUploaded}
      />
    </div>
  );
};

export default InvoiceSettingsPanel;
