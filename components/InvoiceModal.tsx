import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Copy, QrCode, FileDown, Edit, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { useInvoice } from "@/contexts/InvoiceContext";
import html2pdf from "html2pdf.js";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InvoiceModal = ({ isOpen, onClose }: InvoiceModalProps) => {
  const { invoiceData } = useInvoice();

  const handleCopyLink = () => {
    // Implement copy link functionality
  };

  const handleGetQRCode = () => {
    // Implement QR code generation
  };

  const handleDownloadPDF = () => {
    const invoice = document.getElementById("invoice-content");
    const opt = {
      margin: 1,
      filename: `invoice-${invoiceData.invoiceNumber}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    if (invoice) {
      const originalTransform = invoice.style.transform;
      invoice.style.transform = "scale(1)";

      html2pdf()
        .set(opt)
        .from(invoice)
        .save()
        .then(() => {
          invoice.style.transform = originalTransform;
        });
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
              The invoice is ready. Copy the link, generate a QR code, or
              download the file to share.
            </p>
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
            <Button variant="outline" className="flex-1 gap-2">
              <Edit size={16} />
              Edit invoice
            </Button>
            <Button variant="default" className="flex-1 gap-2 bg-black">
              <Plus size={16} />
              New invoice
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceModal;
