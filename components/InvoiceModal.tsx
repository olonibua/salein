import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Copy, QrCode, FileDown } from "lucide-react";
import { Button } from "./ui/button";
import { useInvoice } from "@/contexts/InvoiceContext";
import html2pdf from "html2pdf.js";
import { toast } from "sonner";
import Invoice from "./Invoice/Invoice";
import { useState } from "react";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientEmail: string;
  reminderEnabled: boolean;
  mode?: "create" | "settings";
  settings?: {
    teamEmails: string[];
    reminderCount: number;
    reminderInterval: "daily" | "weekly" | "biweekly" | "monthly";
  };
}

const InvoiceModal = ({
  isOpen,
  onClose,
  recipientEmail,
  reminderEnabled,
  mode = "create",
  settings,
}: InvoiceModalProps) => {
  const [isSending, setIsSending] = useState(false);
  const { invoiceData } = useInvoice();

  const handleCopyLink = () => {
    // Implement copy link functionality
  };

  const handleGetQRCode = () => {
    // Implement QR code generation
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

  const handleSendInvoice = async () => {
    if (isSending) return;
    setIsSending(true);

    try {
      const invoice = document.getElementById("invoice-content");
      if (!invoice) {
        toast.error("Invoice content not found");
        return;
      }

      const opt = {
        margin: 1,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      };

      // Remove zoom transformation before generating PDF
      const originalTransform = invoice.style.transform;
      invoice.style.transform = "scale(1)";

      // Generate PDF buffer
      const pdfBuffer = await html2pdf()
        .set(opt)
        .from(invoice)
        .outputPdf("arraybuffer");

      // Reset transform
      invoice.style.transform = originalTransform;

      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipientEmail,
          teamEmails: settings?.teamEmails || [],
          subject: `Invoice #${invoiceData.invoiceNumber} from ${invoiceData.from.name}`,
          htmlContent: `
            <h1>Invoice #${invoiceData.invoiceNumber}</h1>
            <p>Amount: £${invoiceData.total.toFixed(2)}</p>
            <p>Due Date: ${invoiceData.dueDate}</p>
            <p>Payment reminders will be sent automatically.</p>
          `,
          pdfBuffer: Array.from(new Uint8Array(pdfBuffer)),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send invoice");
      }

      toast.success("Invoice sent successfully!");
      onClose();
    } catch (error) {
      console.error("Error sending invoice:", error);
      toast.error("Failed to send invoice");
    } finally {
      setIsSending(false);
    }
  };

  return (
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
              onClick={handleSendInvoice}
              disabled={isSending}
            >
              {isSending ? "Sending..." : "Send Invoice"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceModal;
