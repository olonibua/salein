import { databases } from "@/utils/appwrite";
import { ID, Query } from "appwrite";

type ReminderData = {
  invoiceId: string;
  recipientEmail: string;
  dueDate: string;
  amount: number;
  sendDate: string;
  status: 'pending' | 'sent' | 'failed';
  retryCount: number;
};

type ReminderInput = Omit<ReminderData, 'status' | 'retryCount'>;

const CONFIG = {
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_INVOICESDB_ID!,
  collectionId: process.env.NEXT_PUBLIC_APPWRITE_INVOICESCOLLECTION_ID!,
  maxRetries: 3,
  retryDelay: 30 * 60 * 1000 // 30 minutes
} as const;

// Add this to debug environment variables


const validateConfig = () => {
  if (!CONFIG.databaseId || !CONFIG.collectionId) {
    throw new Error(`Database or Collection ID not configured. 
      Database ID: ${CONFIG.databaseId}, 
      Collection ID: ${CONFIG.collectionId}`
    );
  }
};

export const createReminder = async (reminder: ReminderInput) => {
  validateConfig();
  return databases.createDocument(
    CONFIG.databaseId,
    CONFIG.collectionId,
    ID.unique(),
    {
      ...reminder,
      status: 'pending',
      retryCount: 0
    }
  );
};

export const getDueReminders = async () => {
  validateConfig();
  const now = new Date().toISOString();
  
  const reminders = await databases.listDocuments(
    CONFIG.databaseId,
    CONFIG.collectionId,
    [
      Query.equal('status', 'pending'),
      Query.lessThanEqual('sendDate', now),
      Query.lessThan('retryCount', CONFIG.maxRetries)
    ]
  );

  return reminders;
};

export const updateReminderStatus = async (
  reminderId: string, 
  status: ReminderData['status']
) => {
  validateConfig();
  return databases.updateDocument(
    CONFIG.databaseId,
    CONFIG.collectionId,
    reminderId,
    { status }
  );
};

export const updateRetryCount = async (
  reminderId: string, 
  retryCount: number
) => {
  validateConfig();
  return databases.updateDocument(
    CONFIG.databaseId,
    CONFIG.collectionId,
    reminderId,
    {
      retryCount,
      nextRetry: new Date(Date.now() + CONFIG.retryDelay).toISOString()
    }
  );
};

export const reminderService = {
  createReminder,
  getDueReminders,
  updateReminderStatus,
  updateRetryCount
} as const; 