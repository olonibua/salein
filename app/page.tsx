"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { InvoiceProvider } from "@/contexts/InvoiceContext";

const Invoice = dynamic(() => import("@/components/Invoice/Invoice"), {
  ssr: false,
});

const InvoiceCreationPanel = dynamic(
  () => import("@/components/InvoicePanel/InvoiceCreationPanel"),
  { ssr: false }
);

const InvoiceSettingsPanel = dynamic(
  () => import("@/components/InvoicePanel/InvoiceSettingsPanel"),
  { ssr: false }
);

const UploadInvoiceModal = dynamic(
  () => import("@/components/Invoice/UploadInvoiceModal"),
  { ssr: false }
);

export default function Home() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleInvoiceCreated = () => {
    setIsTransitioning(true);
    setShowSettings(true);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleInvoiceUploaded = () => {
    setShowUploadModal(false);
    setIsTransitioning(true);
    setShowSettings(true);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleBack = () => {
    setIsTransitioning(true);
    setShowSettings(false);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  return (
    <InvoiceProvider>
      <div className="flex flex-col h-[110vh]">
        <nav className="hidden md:block sticky top-0 z-50 bg-white shadow-sm px-4 py-3">
          <h2 className="font-medium text-xl">SaleIn</h2>
        </nav>
        <div className="flex flex-1 md:space-x-3 p-10 bg-gray-100 mx-auto w-full">
          <div
            className={`w-full transition-opacity duration-300 ${
              isTransitioning ? "opacity-0" : "opacity-100"
            }`}
          >
            {showSettings ? (
              <InvoiceSettingsPanel onBack={handleBack} />
            ) : (
              <>
                <div className="flex">
                  <div className="hidden md:block flex-1">
                    <Invoice />
                  </div>
                  <InvoiceCreationPanel
                    onUpload={() => setShowUploadModal(true)}
                    onCreateInvoice={handleInvoiceCreated}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <UploadInvoiceModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleInvoiceUploaded}
      />
    </InvoiceProvider>
  );
}
