"use client";
import { useEffect } from 'react';
import { toast } from 'sonner';
import { reminderService } from '@/services/appwrite/reminderService';

export function ReminderChecker() {
  const checkAndSendReminders = async () => {
    try {
      console.log('Checking reminders...');
      const dueReminders = await reminderService.getDueReminders();
      console.log('Due reminders:', dueReminders.documents);

      if (dueReminders.documents.length === 0) {
        console.log('No due reminders found');
        return;
      }

      await Promise.all(dueReminders.documents.map(async (reminder) => {
        console.log('Processing reminder:', reminder);
        try {
          const response = await fetch('/api/notifications/reminder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: reminder.recipientEmail,
              invoiceId: reminder.invoiceId,
              dueDate: reminder.dueDate,
              amount: reminder.amount,
            }),
          });

          if (!response.ok) {
            console.error('Failed to send reminder:', await response.text());
            throw new Error('Failed to send reminder');
          }

          console.log('Reminder sent successfully, updating status');
          await reminderService.updateReminderStatus(reminder.$id, 'sent');
          toast.success('Payment reminder sent');
        } catch (error) {
          console.error('Error processing reminder:', error);
          const newRetryCount = (reminder.retryCount || 0) + 1;
          
          if (newRetryCount >= 3) {
            await reminderService.updateReminderStatus(reminder.$id, 'failed');
          } else {
            await reminderService.updateRetryCount(reminder.$id, newRetryCount);
          }
          
          toast.error('Failed to send payment reminder');
        }
      }));
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  };

  useEffect(() => {
    // Initial check
    checkAndSendReminders();

    // Check every minute
    const interval = setInterval(checkAndSendReminders, 60 * 1000);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  return null;
}