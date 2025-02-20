"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { InvoiceProvider } from "@/contexts/InvoiceContext";

// Dynamic imports with proper typing
const Invoice = dynamic<{}>(
  () => import("@/components/Invoice/Invoice"),
  { ssr: false }
);

const InvoiceCreationPanel = dynamic<{}>(
  () => import("@/components/InvoicePanel/InvoiceCreationPanel"),
  { ssr: false }
);

const InvoiceSettingsPanel = dynamic<{}>(
  () => import("@/components/InvoicePanel/InvoiceSettingsPanel"),
  { ssr: false }
);

const UploadInvoiceModal = dynamic<{
  isOpen: boolean;
  onClose: () => void;
  onUpload: () => void;
}>(
  () => import("@/components/Invoice/UploadInvoiceModal"),
  { ssr: false }
);

export default function Home() {
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

  const handleInvoiceUploaded = (): void => {
    setShowUploadModal(false);
  };

  return (
    <InvoiceProvider>
      <div className="flex flex-col h-screen bg-gray-50">
        <nav className="sticky top-0 z-50 bg-white shadow-sm px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-xl">SaleIn</h2>
        </nav>
        
        <main className="flex-1 container mx-auto">
          <InvoiceSettingsPanel onBack={() => {}} />
        </main>

        <UploadInvoiceModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUpload={handleInvoiceUploaded}
        />
      </div>
    </InvoiceProvider>
  );
}
