import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";

interface ReminderStatusProps {
  invoiceId: string;
}

export const ReminderStatus = ({ invoiceId }: ReminderStatusProps) => {
  const [reminders, setReminders] = useState<any[]>([]);

  useEffect(() => {
    const loadReminders = () => {
      const allReminders = JSON.parse(localStorage.getItem('reminders') || '[]');
      const invoiceReminders = allReminders.filter(
        (reminder: any) => reminder.invoiceId === invoiceId
      );
      setReminders(invoiceReminders);
    };

    loadReminders();
    // Refresh every minute
    const interval = setInterval(loadReminders, 60000);
    return () => clearInterval(interval);
  }, [invoiceId]);

  return (
    <div className="flex flex-col gap-2">
      {reminders.map((reminder, index) => (
        <div key={index} className="flex items-center gap-2">
          <Badge
            variant={
              reminder.status === 'sent'
                ? 'default'
                : reminder.status === 'failed'
                ? 'destructive'
                : 'secondary'
            }
          >
            {reminder.status}
          </Badge>
          <span className="text-sm text-gray-500">
            {new Date(reminder.sendDate).toLocaleDateString()} at{' '}
            {new Date(reminder.sendDate).toLocaleTimeString()}
          </span>
        </div>
      ))}
    </div>
  );
}; 