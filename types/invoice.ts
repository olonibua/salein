export interface InvoiceDetails {
  invoiceDate: string;
  dueDate: string;
  amount: number;
  invoiceName: string;
  paymentDetails: string;
}

export interface InvoiceData {
  recipientEmail: string;
  teamEmails: string[];
  amount: number;
  status: "pending" | "paid" | "overdue";
  reminderEnabled: boolean;
  reminderInterval: "daily" | "weekly" | "biweekly" | "monthly";
  reminderCount: number;
  paymentDetails: string;
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

export const defaultInvoiceData: InvoiceData = {
  recipientEmail: '',
  teamEmails: [],
  amount: 0,
  status: 'pending',
  reminderEnabled: false,
  reminderInterval: 'daily',
  reminderCount: 0,
  paymentDetails: '',
};
