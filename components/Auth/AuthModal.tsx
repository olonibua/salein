"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, User, Mail, KeyRound } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
}

const AuthModal = ({ isOpen, onClose, initialMode = "login" }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, signup, isLoading } = useAuth();
  
  // This effect will run when initialMode changes or when the modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLogin(initialMode === "login");
      // Reset form when modal opens
      setEmail('');
      setPassword('');
      setName('');
    }
  }, [initialMode, isOpen]);
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (isLogin) {
        await login(email, password);
        onClose();
      } else {
        await signup(email, password, name);
        onClose();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Auth error:", error);
        setError(error.message || "Authentication failed. Please try again.");
      } else {
        setError("An unknown error occurred. Please try again.");
      }
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    // Reset form values when switching modes
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-0 rounded-xl max-h-[90vh] max-w-[95vw]">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 py-6 px-6 text-white">
          <DialogTitle className="text-xl sm:text-2xl font-bold">
            {isLogin ? 'Welcome Back' : 'Create Your Account'}
          </DialogTitle>
          <p className="text-blue-100 mt-1 text-sm sm:text-base">
            {isLogin ? 'Sign in to access your invoices' : 'Join SaleIn to start managing invoices'}
          </p>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.form 
            key={isLogin ? 'login' : 'signup'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit} 
            className="space-y-4 px-6 py-5 sm:py-6"
          >
            {!isLogin && (
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium flex items-center gap-2 text-gray-700">
                  <User size={16} className="text-gray-400" />
                  <span>Full Name</span>
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="John Doe"
                  className="h-10 sm:h-11"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium flex items-center gap-2 text-gray-700">
                <Mail size={16} className="text-gray-400" />
                <span>Email Address</span>
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@example.com"
                className="h-10 sm:h-11"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium flex items-center gap-2 text-gray-700">
                <KeyRound size={16} className="text-gray-400" />
                <span>Password</span>
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="h-10 sm:h-11"
              />
            </div>
            
            {error && (
              <div className="text-red-500 text-sm mt-2 p-2 bg-red-50 rounded border border-red-200">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full h-10 sm:h-11 mt-2 bg-blue-600 hover:bg-blue-700 transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </Button>
            
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={toggleAuthMode}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
              >
                {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
              </button>
            </div>
          </motion.form>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal; 