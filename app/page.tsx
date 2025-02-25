"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { InvoiceProvider } from "@/contexts/InvoiceContext";
import { User, LogOut, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/Auth/AuthModal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Dynamic imports with proper typing
// const Invoice = dynamic<{}>(
//   () => import("@/components/Invoice/Invoice"),
//   { ssr: false }
// );

// const InvoiceCreationPanel = dynamic<{}>(
//   () => import("@/components/InvoicePanel/InvoiceCreationPanel"),
//   { ssr: false }
// );

interface InvoiceSettingsPanelProps {
  onBack: () => void;
}

const InvoiceSettingsPanel = dynamic<InvoiceSettingsPanelProps>(
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

// Dynamically import the HowToUseModal
const HowToUseModal = dynamic<{
  isOpen: boolean;
  onClose: () => void;
}>(
  () => import("@/components/HowToUse/HowToUseModal"),
  { ssr: false }
);

export default function Home() {
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showHowToUseModal, setShowHowToUseModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const { user, isAuthenticated, logout } = useAuth();

  const handleInvoiceUploaded = (): void => {
    setShowUploadModal(false);
  };

  const handleShowAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  return (
    <InvoiceProvider>
      <div className="flex flex-col h-screen bg-gray-50">
        <nav className="sticky top-0 z-50 bg-white shadow-sm px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h2 className="font-semibold text-xl">SaleIn</h2>
              
              <Button 
                variant="ghost" 
                onClick={() => setShowHowToUseModal(true)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <BookOpen size={18} />
                <span>How to Use</span>
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                    <User size={16} />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-gray-500 text-xs">{user?.email}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <LogOut size={16} />
                  </Button>
                </div>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleShowAuth("login")}
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleShowAuth("signup")}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </nav>
        
        <main className="flex-1 container mx-auto">
          <InvoiceSettingsPanel onBack={() => {}} />
        </main>

        <UploadInvoiceModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUpload={handleInvoiceUploaded}
        />

        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
        />
        
        <HowToUseModal
          isOpen={showHowToUseModal}
          onClose={() => setShowHowToUseModal(false)}
        />
      </div>
    </InvoiceProvider>
  );
}
