"use client";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { reminderService } from "@/services/appwrite/reminderService";

export function ReminderChecker() {
  const reminderToastShown = useRef<Set<string>>(new Set());

  const checkAndSendReminders = async () => {
    try {
      const dueReminders = await reminderService.getDueReminders();

      if (dueReminders.documents.length === 0) {
        return;
      }

      await Promise.all(
        dueReminders.documents.map(async (reminder) => {
          try {
            const response = await fetch("/api/notifications/reminder", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                to: reminder.recipientEmail,
                invoiceId: reminder.invoiceId,
                dueDate: reminder.dueDate,
                amount: reminder.amount,
              }),
            });

            if (!response.ok) {
              console.error("Failed to send reminder:", await response.text());
              throw new Error("Failed to send reminder");
            }

            await reminderService.updateReminderStatus(reminder.$id, "sent");

            if (!reminderToastShown.current.has(reminder.$id)) {
              toast.success("Payment reminder sent");
              reminderToastShown.current.add(reminder.$id);
            }
          } catch (error) {
            console.error("Error processing reminder:", error);
            const newRetryCount = (reminder.retryCount || 0) + 1;

            if (newRetryCount >= 3) {
              await reminderService.updateReminderStatus(
                reminder.$id,
                "failed"
              );
            } else {
              await reminderService.updateRetryCount(
                reminder.$id,
                newRetryCount
              );
            }

            if (!reminderToastShown.current.has(reminder.$id)) {
              toast.error("Failed to send payment reminder");
              reminderToastShown.current.add(reminder.$id);
            }
          }
        })
      );
    } catch (error) {
      console.error("Error checking reminders:", error);
    }
  };

  useEffect(() => {
    // Copy the ref value inside the effect
    const toastSet = reminderToastShown.current;

    // Initial check
    checkAndSendReminders();

    // Check every minute
    const interval = setInterval(checkAndSendReminders, 60 * 1000);

    // Cleanup
    return () => {
      clearInterval(interval);
      toastSet.clear(); // Use the stored reference instead of accessing `current`
    };
  }, []);

  return null;
}
