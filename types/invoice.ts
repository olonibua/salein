export interface InvoiceData {
  recipientEmail: string;
  teamEmails: string[];
  amount: number;
  status: "pending" | "paid" | "overdue";
  reminderEnabled: boolean;
  reminderInterval: "daily" | "weekly" | "biweekly" | "monthly";
  reminderCount: number;
}
