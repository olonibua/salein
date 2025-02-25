"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

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
    
    try {
      if (isLogin) {
        await login(email, password);
        onClose();
      } else {
        await signup(email, password, name);
        onClose();
      }
    } catch (error) {
      console.error('Auth error:', error);
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
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isLogin ? 'Sign In' : 'Create Account'}
          </DialogTitle>
        </DialogHeader>
        
        <AnimatePresence mode="wait">
          <motion.form 
            key={isLogin ? 'login' : 'signup'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit} 
            className="space-y-4 mt-4"
          >
            {!isLogin && (
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="John Doe"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
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
                className="text-sm text-blue-600 hover:underline"
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