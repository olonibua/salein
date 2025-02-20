"use client";
import { useEffect } from 'react';
import { checkAndSendReminders } from '@/utils/reminderChecker';

export function ReminderChecker() {
  useEffect(() => {
    // Check reminders immediately
    checkAndSendReminders();

    // Then check every 5 minutes
    const interval = setInterval(checkAndSendReminders, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return null;
} 