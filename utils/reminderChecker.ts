import { toast } from "sonner";

interface Reminder {
  invoiceId: string;
  recipientEmail: string;
  dueDate: string;
  amount: number;
  sendDate: string;
  status: 'pending' | 'sent' | 'failed';
  retryCount?: number;
  lastTry?: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 5 * 60 * 1000; // 5 minutes

export const checkAndSendReminders = async () => {
  try {
    const reminders: Reminder[] = JSON.parse(localStorage.getItem('reminders') || '[]');
    const now = new Date();
    let updated = false;

    for (const reminder of reminders) {
      const sendDate = new Date(reminder.sendDate);
      
      // Check if reminder should be sent
      if (sendDate <= now && reminder.status === 'pending') {
        // Check retry limits
        if (reminder.retryCount && reminder.retryCount >= MAX_RETRIES) {
          reminder.status = 'failed';
          updated = true;
          continue;
        }

        // Check if enough time has passed since last retry
        if (reminder.lastTry) {
          const timeSinceLastTry = now.getTime() - new Date(reminder.lastTry).getTime();
          if (timeSinceLastTry < RETRY_DELAY) continue;
        }

        try {
          const response = await fetch('/api/notifications/reminder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: reminder.recipientEmail,
              subject: `Reminder: Invoice Payment Due`,
              invoiceId: reminder.invoiceId,
              dueDate: reminder.dueDate,
              amount: reminder.amount
            })
          });

          if (response.ok) {
            reminder.status = 'sent';
            delete reminder.retryCount;
            delete reminder.lastTry;
          } else {
            reminder.status = 'failed';
            reminder.retryCount = (reminder.retryCount || 0) + 1;
            reminder.lastTry = new Date().toISOString();
          }
          updated = true;
        } catch (error) {
          console.error('Error sending reminder:', error);
          reminder.status = 'failed';
          reminder.retryCount = (reminder.retryCount || 0) + 1;
          reminder.lastTry = new Date().toISOString();
          updated = true;
        }
      }
    }

    if (updated) {
      localStorage.setItem('reminders', JSON.stringify(reminders));
    }
  } catch (error) {
    console.error('Error checking reminders:', error);
    toast.error("Failed to process reminders");
  }
}; 