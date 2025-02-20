export interface InvoiceData {
  recipientEmail: string;
  teamEmails: string[];
  amount: number;
  status: "pending" | "paid" | "overdue";
  reminderEnabled: boolean;
  reminderInterval: "daily" | "weekly" | "biweekly" | "monthly";
  reminderCount: number;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  layout: {
    fontFamily: string;
    headerStyle: string;
    tableStyle: string;
    footerStyle: string;
  };
}

export const invoiceTemplates: InvoiceTemplate[] = [
  {
    id: "1",
    name: "Classic Template",
    description: "Professional and clean design",
    layout: { fontFamily: "Inter", headerStyle: "classic", tableStyle: "simple", footerStyle: "basic" }
  }
];
