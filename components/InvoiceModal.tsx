import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Copy, QrCode, FileDown, Upload, FileText, X } from "lucide-react";
import { Button } from "./ui/button";
import { useInvoice } from "@/contexts/InvoiceContext";
import html2pdf from "html2pdf.js";
import { toast } from "sonner";
import Invoice from "./Invoice/Invoice";
import { useState } from "react";
// import { useRouter } from "next/navigation";
import InvoiceSettingsModal from "./InvoiceSettingsModal";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientEmail: string;
  isUploadedInvoice?: boolean;
  settings?: {
    teamEmails: string[];
    reminderCount: number;
    reminderInterval: "daily" | "weekly" | "biweekly" | "monthly";
    uploadedInvoiceDetails?: {
      invoiceDate: string;
      dueDate: string;
      amount: number;
      invoiceName: string;
    };
  };
}

interface InvoiceDetails {
  invoiceDate: string;
  dueDate: string;
  amount: number;
  invoiceName: string;
}

const InvoiceModal = ({
  isOpen,
  onClose,
  recipientEmail,
  // settings,
}: InvoiceModalProps) => {
  const [isSending, setIsSending] = useState(false);
  const { invoiceData } = useInvoice();
  const [showSettings, setShowSettings] = useState(false);
  const [isUploadMode, setIsUploadMode] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleCopyLink = async () => {
    try {
      const invoiceLink = `${window.location.origin}/invoice/${invoiceData.invoiceNumber}`;
      await navigator.clipboard.writeText(invoiceLink);
      toast.success("Invoice link copied to clipboard");
    } catch (err) {
      console.error("Failed to copy link:", err);
      toast.error("Failed to copy link to clipboard");
    }
  };

  const handleGetQRCode = () => {
    // setShowQR(!showQR);
  };

  const handleDownloadPDF = () => {
    const invoice = document.getElementById("invoice-content");
    if (!invoice) {
      toast.error("Invoice content not found");
      return;
    }

    const opt = {
      margin: 1,
      filename: `invoice-${invoiceData.invoiceNumber}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    // Remove zoom transformation before generating PDF
    const originalTransform = invoice.style.transform;
    invoice.style.transform = "scale(1)";

    html2pdf()
      .set(opt)
      .from(invoice)
      .save()
      .then(() => {
        invoice.style.transform = originalTransform;
        toast.success("Invoice downloaded successfully");
      })
      .catch((error: Error) => {
        console.error("PDF download error:", error);
        toast.error("Failed to download invoice");
      });
  };

  const handleConfigureSettings = () => {
    setShowSettings(true);
  };

  const handleSendInvoice = async (
    recipientEmail: string,
    teamEmails: string[] = [],
    uploadedDetails?: InvoiceDetails
  ) => {
    if (isSending) return;
    setIsSending(true);

    try {
      const invoiceDetails: InvoiceDetails = uploadedDetails || {
        invoiceDate: invoiceData.invoiceDate,
        dueDate: invoiceData.dueDate,
        amount: invoiceData.total,
        invoiceName: `Invoice #${invoiceData.invoiceNumber}`,
      };

      const emailContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Invoice Details</h2>
          <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
            ${
              invoiceDetails.invoiceName
                ? `<p><strong>Invoice Name:</strong> ${invoiceDetails.invoiceName}</p>`
                : ""
            }
            <p><strong>Amount:</strong> ${invoiceDetails.amount}</p>
            <p><strong>Invoice Date:</strong> ${invoiceDetails.invoiceDate}</p>
            <p><strong>Due Date:</strong> ${invoiceDetails.dueDate}</p>
          </div>
          <p>Please find the attached invoice document.</p>
          ${
            invoiceDetails.dueDate
              ? `<p><strong>Payment Due:</strong> ${invoiceDetails.dueDate}</p>`
              : ""
          }
          <p>Payment reminders will be sent automatically.</p>
        </div>
      `;

      // Convert invoice HTML to PDF
      const invoiceElement = document.getElementById("invoice-content");
      if (!invoiceElement) {
        toast.error("Invoice content not found");
        return;
      }

      const opt = {
        margin: 1,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      };

      const pdfBlob = await html2pdf()
        .set(opt)
        .from(invoiceElement)
        .outputPdf("blob");

      // Convert Blob to ArrayBuffer
      const pdfBuffer = await pdfBlob.arrayBuffer();

      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipientEmail,
          teamEmails,
          subject: `Invoice: ${invoiceDetails.invoiceName || "New Invoice"}`,
          htmlContent: emailContent,
          pdfBuffer: Array.from(new Uint8Array(pdfBuffer)),
          fileName: `invoice-${Date.now()}.pdf`,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to send invoice");
      }

      if (!data.success) {
        throw new Error(data.error || data.details || "Failed to send invoice");
      }

      toast.success("Invoice sent successfully!");
      onClose();
    } catch (error) {
      console.error("Error sending invoice:", error);
      throw error; // Re-throw the error so it's caught by toast.promise
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setIsUploadMode(false);
    toast.success("Invoice uploaded successfully");
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">
                Your Invoice is ready! 🎉
              </h2>
              <p className="text-gray-500 mt-2">
                Send this invoice to {recipientEmail}
              </p>
            </div>

            {/* Hidden Invoice for PDF Generation */}
            <div className="hidden">
              <Invoice />
            </div>

            {/* Invoice Card */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Invoice for</p>
                  <p className="text-3xl font-semibold mt-1">
                    £ {invoiceData.total.toFixed(2)}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="text-pink-500">
                  ○
                </Button>
              </div>
              <div className="flex justify-between mt-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span>{invoiceData.invoiceDate}</span>
                </div>
                <div>#{invoiceData.invoiceNumber}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 p-4 h-auto"
                onClick={handleCopyLink}
              >
                <Copy size={20} />
                <span className="text-sm">Copy link</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 p-4 h-auto"
                onClick={handleGetQRCode}
              >
                <QrCode size={20} />
                <span className="text-sm">Get QR code</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 p-4 h-auto"
                onClick={handleDownloadPDF}
              >
                <FileDown size={20} />
                <span className="text-sm">Download PDF</span>
              </Button>
            </div>

           
            {/* Bottom Buttons */}
            <div className="flex gap-4 mt-4">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-black"
                onClick={() => handleConfigureSettings()}
              >
                Configure & Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Upload Modal */}
      <Dialog open={isUploadMode} onOpenChange={() => setIsUploadMode(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">Upload Invoice</h2>
              <p className="text-gray-500 mt-2">
                Upload an existing invoice to send
              </p>
            </div>

            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center
                ${uploadedFile ? 'border-green-500 bg-green-50' : 'border-gray-200'}
              `}
            >
              {uploadedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText size={24} className="text-green-500" />
                  <span className="font-medium">{uploadedFile.name}</span>
                  <button
                    onClick={() => setUploadedFile(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={32} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">
                    Drag and drop your invoice here, or{" "}
                    <label className="text-blue-500 hover:text-blue-600 cursor-pointer">
                      browse
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                      />
                    </label>
                  </p>
                  <p className="text-sm text-gray-400">
                    Supports: PDF (Max size: 5MB)
                  </p>
                </>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsUploadMode(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-black"
                disabled={!uploadedFile}
                onClick={() => {
                  handleFileUpload(uploadedFile!);
                }}
              >
                Upload & Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <InvoiceSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSendInvoice={handleSendInvoice}
        recipientEmail={recipientEmail}
        invoiceDate={invoiceData.invoiceDate}
        dueDate={invoiceData.dueDate}
        amount={invoiceData.total}
      />
    </>
  );
};

export default InvoiceModal;
