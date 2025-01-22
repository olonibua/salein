"use client";
import React, { createContext, useContext, useState } from "react";

export interface InvoiceData {
  invoiceDate: string;
  dueDate: string;
  from: {
    name: string;
    email: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
    };
    phone?: string;
    logo?: string;
  };
  to: {
    name: string;
    email: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
    };
    phone?: string;
  };
  poNumber: string;
  invoiceNumber: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: string | number;
    total: number;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  paymentMemo: string;
  website: string;
}

interface InvoiceContextType {
  invoiceData: InvoiceData;
  updateInvoiceData: (data: Partial<InvoiceData>) => void;
  updateFromData: (data: Partial<InvoiceData["from"]>) => void;
  updateToData: (data: Partial<InvoiceData["to"]>) => void;
  updateItems: (items: InvoiceData["items"]) => void;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceDate: "22/01/2025",
    dueDate: "22/01/2025",
    from: {
      name: "",
      email: "",
      address: {
        street: "",
        city: "",
        state: "",
        postalCode: "",
      },
      phone: "",
      logo: "",
    },
    to: {
      name: "",
      email: "",
      address: {
        street: "",
        city: "",
        state: "",
        postalCode: "",
      },
      phone: "",
    },
    poNumber: "",
    invoiceNumber: "MONI-934",
    items: [],
    subtotal: 0,
    taxRate: 0.1,
    taxAmount: 0,
    total: 0,
    paymentMemo: "",
    website: "www.monivoice.com",
  });

  const updateInvoiceData = (data: Partial<InvoiceData>) => {
    setInvoiceData((prev) => ({ ...prev, ...data }));
  };

  const updateFromData = (data: Partial<InvoiceData["from"]>) => {
    setInvoiceData((prev) => ({
      ...prev,
      from: { ...prev.from, ...data },
    }));
  };

  const updateToData = (data: Partial<InvoiceData["to"]>) => {
    setInvoiceData((prev) => ({
      ...prev,
      to: { ...prev.to, ...data },
    }));
  };

  const updateItems = (items: InvoiceData["items"]) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = subtotal * invoiceData.taxRate;
    const total = subtotal + taxAmount;

    setInvoiceData((prev) => ({
      ...prev,
      items,
      subtotal,
      taxAmount,
      total,
    }));
  };

  return (
    <InvoiceContext.Provider
      value={{
        invoiceData,
        updateInvoiceData,
        updateFromData,
        updateToData,
        updateItems,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoice() {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error("useInvoice must be used within an InvoiceProvider");
  }
  return context;
}
