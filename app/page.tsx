"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { InvoiceProvider } from "@/contexts/InvoiceContext";
import { User, LogOut, BookOpen, Menu, X, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/Auth/AuthModal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const { user, isAuthenticated, logout } = useAuth();
  
  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleInvoiceUploaded = (): void => {
    setShowUploadModal(false);
  };

  const handleShowAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setMobileMenuOpen(false); // Close mobile menu when auth modal opens
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch {
      toast.error("Failed to log out");
    }
  };

  return (
    <InvoiceProvider>
      
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Desktop and Mobile Header */}
        <nav className="sticky top-0 z-50 bg-white shadow-sm px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h2 className="font-semibold text-xl">SaleIn</h2>
              
              {/* Show "How to Use" button only on desktop */}
              <Button 
                variant="ghost" 
                onClick={() => setShowHowToUseModal(true)}
                className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <BookOpen size={18} />
                <span>How to Use</span>
              </Button>
            </div>
            
            {/* Desktop auth section */}
            <div className="hidden md:flex items-center gap-4">
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
            
            {/* Mobile menu toggle */}
            <button 
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
        
        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-64 bg-white shadow-lg z-50 pt-16 flex flex-col md:hidden"
            >
              <div className="flex flex-col p-4 flex-1">
                {isAuthenticated ? (
                  <div className="border-b border-gray-100 pb-4 mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-gray-500 text-xs">{user?.email}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleLogout}
                      className="w-full mt-3 flex items-center justify-center gap-2"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </Button>
                  </div>
                ) : (
                  <div className="border-b border-gray-100 pb-4 mb-4">
                    <h3 className="font-medium text-gray-900 mb-3">Account</h3>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full flex items-center justify-start gap-2"
                        onClick={() => handleShowAuth("login")}
                      >
                        <LogIn size={16} />
                        <span>Sign In</span>
                      </Button>
                      <Button 
                        variant="default"
                        className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-start gap-2"
                        onClick={() => handleShowAuth("signup")}
                      >
                        <UserPlus size={16} />
                        <span>Create Account</span>
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900 mb-2">Help</h3>
                  <Button 
                    variant="ghost" 
                    className="w-full flex items-center justify-start gap-2 text-gray-600 hover:text-gray-900"
                    onClick={() => {
                      setShowHowToUseModal(true);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <BookOpen size={16} />
                    <span>How to Use</span>
                  </Button>
                </div>
              </div>
              
              {/* Version info at bottom */}
              <div className="px-4 py-3 text-xs text-gray-500 border-t border-gray-100">
                Version 1.0.0
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Page overlay when mobile menu is open */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black z-40 md:hidden"
          />
        )}
        
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
