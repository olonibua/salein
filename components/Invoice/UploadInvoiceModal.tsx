import { useState } from "react";
import { Upload, X, FileText, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import InvoiceSettingsModal from "../InvoiceSettingsModal";
import { toast } from "sonner";

interface UploadInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: () => void;
}

const UploadInvoiceModal = ({
  isOpen,
  onClose,
  onUpload,
}: UploadInvoiceModalProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [recipientEmail, setRecipientEmail] = useState("");

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    validateAndSetFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    validateAndSetFile(file);
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

  const handleSendInvoice = async (
    recipientEmail: string,
    teamEmails: string[] = []
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
          subject: `Invoice: ${file.name}`,
          htmlContent: `
            <h1>Invoice</h1>
            <p>Please find the attached invoice.</p>
          `,
          pdfBuffer: fileArray,
          fileName: file.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send invoice");
      }

      toast.success("Invoice sent successfully!");
      onClose();
      onUpload();
    } catch (error) {
      console.error("Error sending invoice:", error);
      toast.error("Failed to send invoice");
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Upload Invoice</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center ${
                dragActive ? "border-blue-500 bg-blue-50" : "border-gray-200"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText size={24} className="text-blue-500" />
                  <span className="font-medium">{file.name}</span>
                  <button
                    onClick={() => setFile(null)}
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
                        onChange={handleFileInput}
                      />
                    </label>
                  </p>
                  <p className="text-sm text-gray-400">
                    Supports: PDF (Max size: 5MB)
                  </p>
                </>
              )}
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-6 flex gap-3 justify-end">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                disabled={!file || !!error}
                onClick={() => setShowSettings(true)}
              >
                Upload Invoice
              </Button>
            </div>
          </div>
        </div>
      </div>

      <InvoiceSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSendInvoice={handleSendInvoice}
        recipientEmail={recipientEmail}
        isUploadedInvoice={true}
      />
    </>
  );
};

export default UploadInvoiceModal;
