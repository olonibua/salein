"use client";

import { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, 
  FileText, 
  Upload, 
  Mail, 
  Bell, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    title: "Create an Account",
    description: "Sign up for a free account to start creating and managing invoices.",
    icon: <UserPlus className="w-10 h-10 md:w-12 md:h-12" />,
  },
  {
    title: "Create Invoice",
    description: "Create a professional invoice with our easy-to-use template.",
    icon: <FileText className="w-10 h-10 md:w-12 md:h-12" />,
  },
  {
    title: "Upload Existing Invoice",
    description: "Already have an invoice? Upload it to our system for tracking and reminders.",
    icon: <Upload className="w-10 h-10 md:w-12 md:h-12" />,
  },
  {
    title: "Send to Clients",
    description: "Send invoices directly to your clients with optional team members in CC.",
    icon: <Mail className="w-10 h-10 md:w-12 md:h-12" />,
  },
  {
    title: "Set Reminders",
    description: "Configure automatic payment reminders to ensure timely payments.",
    icon: <Bell className="w-10 h-10 md:w-12 md:h-12" />,
  },
  {
    title: "Track Payments",
    description: "Monitor payment status and keep track of your business cash flow.",
    icon: <CheckCircle className="w-10 h-10 md:w-12 md:h-12" />,
  },
];

const HowToUseModal = ({ isOpen, onClose }: HowToUseModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-black text-white rounded-xl border-none max-h-[90vh] max-w-[90vw]">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative"
        >
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
            <motion.div 
              className="h-full bg-blue-500" 
              initial={{ width: 0 }}
              animate={{ 
                width: `${((currentStep + 1) / steps.length) * 100}%` 
              }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="pt-6 px-4 sm:px-8 pb-6 sm:pb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 mt-2 sm:mt-4">
              <h2 className="text-xl sm:text-2xl font-medium mb-1 sm:mb-0">How to Use SaleIn</h2>
              <div className="text-sm text-gray-400">
                Step {currentStep + 1} of {steps.length}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-5 sm:py-10 px-2 sm:px-6"
              >
                <motion.div 
                  className="text-blue-400 mb-4 sm:mb-6"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 20 
                  }}
                >
                  {steps[currentStep].icon}
                </motion.div>
                <h3 className="text-lg sm:text-xl font-medium mb-2 sm:mb-3 text-center">{steps[currentStep].title}</h3>
                <p className="text-gray-400 text-center max-w-md text-sm sm:text-base">
                  {steps[currentStep].description}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between mt-4 sm:mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevStep}
                disabled={currentStep === 0}
                className={`${
                  currentStep === 0 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'opacity-100'
                } bg-transparent border border-gray-700 text-white hover:bg-gray-800 text-xs sm:text-sm px-2 sm:px-4`}
              >
                <ChevronLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="sm:inline">Previous</span>
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={goToNextStep}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-2 sm:px-4"
                >
                  <span className="sm:inline">Next</span>
                  <ChevronRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onClose}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-2 sm:px-4"
                >
                  Get Started
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default HowToUseModal; 