"use client";
import React, { createContext, useContext, useState } from "react";
import { addDays } from 'date-fns';

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
    currency?: {
      label: string;
      value: string;
      symbol: string;
    };
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  paymentMemo: string;
  website: string;
  currency: {
    label: string;
    value: string;
    symbol: string;
  };
}

interface InvoiceContextType {
  invoiceData: InvoiceData;
  logo: string | null;
  setLogo: (logo: string | null) => void;
  updateInvoiceData: (data: Partial<InvoiceData>) => void;
  updateFromData: (data: Partial<InvoiceData["from"]>) => void;
  updateToData: (data: Partial<InvoiceData["to"]>) => void;
  updateItems: (items: InvoiceData["items"]) => void;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

const initialInvoiceData: InvoiceData = {
  invoiceDate: "",
  dueDate: "",
  from: {
    name: "",
    email: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: ""
    },
    phone: ""
  },
  to: {
    name: "",
    email: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: ""
    },
    phone: ""
  },
  poNumber: "",
  invoiceNumber: "Salein-934",
  items: [],
  subtotal: 0,
  taxRate: 0.1,
  taxAmount: 0,
  total: 0,
  paymentMemo: "",
  website: "www.salein.com",
  currency: {
    label: "US Dollar (USD)",
    value: "USD",
    symbol: "$"
  }
};

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(initialInvoiceData);
  const [logo, setLogo] = useState<string | null>(null);

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
        logo,
        setLogo,
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
