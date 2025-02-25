"use client";

import { useState, useRef } from 'react';
import { Dialog, DialogContent,  DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion,  } from 'framer-motion';
import { Upload,  Check, X, AlertTriangle, FileText } from 'lucide-react';
import InvoiceSettingsModal from "../InvoiceSettingsModal";
import { toast } from "sonner";

interface UploadedInvoiceDetails {
  invoiceDate: string;
  dueDate: string;
  amount: number;
  invoiceName: string;
  paymentDetails?: string;
}

interface UploadInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: () => void;
}

const UploadInvoiceModal = ({ isOpen, onClose, onUpload }: UploadInvoiceModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const recipientEmail = "";
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File | undefined) => {
    if (!file) return;

    if (!file.type.includes("pdf")) {
      setError("Please upload a PDF file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      setError("File size should be less than 5MB");
      return;
    }

    setError(null);
    setFile(file);
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendInvoice = async (
    recipientEmail: string,
    teamEmails: string[] = [],
    uploadedInvoiceDetails?: UploadedInvoiceDetails
  ) => {
    try {
      if (!file || !recipientEmail) {
        toast.error("File and recipient email are required");
        return;
      }

      const fileBuffer = await file.arrayBuffer();
      const fileArray = Array.from(new Uint8Array(fileBuffer));

      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: recipientEmail,
          teamEmails: teamEmails,
          subject: `Invoice: ${uploadedInvoiceDetails?.invoiceName || file.name}`,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Invoice Details</h2>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Invoice Name:</strong> ${uploadedInvoiceDetails?.invoiceName || file.name}</p>
                ${uploadedInvoiceDetails?.amount ? `<p><strong>Amount Due:</strong> ${new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(uploadedInvoiceDetails.amount)}</p>` : ''}
                ${uploadedInvoiceDetails?.dueDate ? `<p><strong>Due Date:</strong> ${new Date(uploadedInvoiceDetails.dueDate).toLocaleDateString()}</p>` : ''}
                ${uploadedInvoiceDetails?.paymentDetails ? `<p style="font-family: monospace;"><strong>Payment Details:</strong> ${uploadedInvoiceDetails.paymentDetails}</p>` : ''}
              </div>
              
              <p>Please find the attached invoice document for your records.</p>
              
              ${
                uploadedInvoiceDetails?.dueDate
                  ? `
                <p style="color: #666;">
                  <strong>Note:</strong> Payment is due by ${new Date(uploadedInvoiceDetails.dueDate).toLocaleDateString()}. 
                  Payment reminders will be sent automatically.
                </p>
              `
                  : ""
              }
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 14px;">
                  If you have any questions, please don't hesitate to reach out.
                </p>
              </div>
            </div>
          `,
          pdfBuffer: fileArray,
          fileName: file.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send invoice");
      }

      // Single success toast after all operations complete
      onClose();
      onUpload();
    } catch (error) {
      console.error("Error sending invoice:", error);
      toast.error("Failed to send invoice");
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 rounded-xl max-h-[90vh] max-w-[95vw]">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-800 py-6 px-6 text-white">
            <DialogTitle className="text-xl sm:text-2xl font-bold">
              Upload Invoice
            </DialogTitle>
            <p className="text-indigo-100 mt-1 text-sm sm:text-base">
              Upload an existing invoice to send to your clients
            </p>
          </div>
          
          <div className="p-5 sm:p-6">
            <div
              className={`border-2 border-dashed rounded-lg p-6 sm:p-8 transition-colors ${
                isDragging 
                  ? 'border-blue-400 bg-blue-50' 
                  : error 
                    ? 'border-red-200 bg-red-50' 
                    : 'border-gray-200 hover:border-gray-300'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {!file ? (
                <div className="flex flex-col items-center justify-center text-center">
                  {error ? (
                    <div className="text-red-500 mb-3">
                      <AlertTriangle size={36} className="mx-auto mb-2" />
                      <p className="text-sm">{error}</p>
                    </div>
                  ) : (
                    <Upload 
                      size={36} 
                      className={`mx-auto mb-3 ${
                        isDragging ? 'text-blue-500' : 'text-gray-400'
                      }`} 
                    />
                  )}
                  
                  <h3 className="text-lg font-medium mb-2">
                    {error ? 'Try again' : 'Drag & Drop your invoice here'}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Support for PDF files only. Max size 5MB.
                  </p>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="relative border-gray-300"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span>Browse Files</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="sr-only"
                      accept=".pdf"
                      onChange={handleFileInput}
                    />
                  </Button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-3"
                >
                  <FileText size={24} className="text-blue-500" />
                  <span className="font-medium">{file.name}</span>
                  <button
                    onClick={clearFile}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X size={18} />
                  </button>
                </motion.div>
              )}
            </div>
            
            {error && (
              <div className="mt-4 flex items-center gap-2 text-red-500 text-sm">
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}
            
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!file || !!error}
                onClick={() => setShowSettings(true)}
                className={`bg-indigo-600 hover:bg-indigo-700 text-white ${
                  !file || !!error ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                <Check className="mr-2 h-4 w-4" />
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <InvoiceSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSendInvoice={handleSendInvoice}
        recipientEmail={recipientEmail}
        isUploadedInvoice={true}
        uploadedInvoiceDetails={{
          invoiceDate: new Date().toISOString().split('T')[0],
          dueDate: '',
          amount: 0,
          invoiceName: file?.name || '',
          paymentDetails: '',
        }}
      />
    </>
  );
};

export default UploadInvoiceModal;
