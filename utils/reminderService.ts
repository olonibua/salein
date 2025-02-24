import { databases } from "@/utils/appwrite";
import { ID, Query } from "appwrite";

type ReminderStatus = 'pending' | 'sent' | 'failed';

interface ReminderData {
  invoiceId: string;
  recipientEmail: string;
  dueDate: string;
  amount: number;
  sendDate: string;
}

export class ReminderService {
  private static COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_INVOICESCOLLECTION_ID;
  private static INVOICESDB_ID = process.env.NEXT_PUBLIC_APPWRITE_INVOICESDB_ID;

  async scheduleReminder(reminder: ReminderData) {
    try {
      const response = await databases.createDocument(
        ReminderService.INVOICESDB_ID!,
        ReminderService.COLLECTION_ID!,
        ID.unique(),
        {
          invoiceId: reminder.invoiceId,
          recipientEmail: reminder.recipientEmail,
          dueDate: reminder.dueDate,
          amount: reminder.amount,
          sendDate: reminder.sendDate,
          status: 'pending',
          retryCount: 0
        }
      );

      this.updateLocalReminders(response);
      return response;
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      throw error;
    }
  }

  async checkDueReminders() {
    try {
      const now = new Date().toISOString();
      const reminders = await databases.listDocuments(
        ReminderService.INVOICESDB_ID!,
        ReminderService.COLLECTION_ID!,
        [
          Query.equal('status', 'pending'),
          Query.lessThanEqual('sendDate', now),
          Query.lessThan('retryCount', 3)
        ]
      );

      return reminders.documents;
    } catch (error) {
      console.error('Error checking reminders:', error);
      throw error;
    }
  }

  async updateReminderStatus(reminderId: string, status: ReminderStatus) {
    try {
      const response = await databases.updateDocument(
        ReminderService.INVOICESDB_ID!,
        ReminderService.COLLECTION_ID!,
        reminderId,
        {
          status,
          lastUpdated: new Date().toISOString()
        }
      );

      this.updateLocalReminders(response);
      return response;
    } catch (error) {
      console.error('Error updating reminder status:', error);
      throw error;
    }
  }

  async updateRetryCount(reminderId: string, retryCount: number) {
    return databases.updateDocument(
      ReminderService.INVOICESDB_ID!,
      ReminderService.COLLECTION_ID!,
      reminderId,
      {
        retryCount,
        nextRetry: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      }
    );
  }

  private updateLocalReminders(reminder: any) {
    try {
      const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
      const index = reminders.findIndex((r: any) => r.$id === reminder.$id);
      
      if (index >= 0) {
        reminders[index] = reminder;
      } else {
        reminders.push(reminder);
      }

      localStorage.setItem('reminders', JSON.stringify(reminders));
    } catch (error) {
      console.error('Error updating local reminders:', error);
    }
  }
} 