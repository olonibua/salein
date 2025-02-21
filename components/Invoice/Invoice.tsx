"use client";
import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Minus, Plus } from "lucide-react";
import { useInvoice } from "@/contexts/InvoiceContext";
import { invoiceTemplates } from "./templates";
import { cn } from "@/lib/utils"
import Image from "next/image";

interface InvoiceProps {
  selectedTemplate?: string;
}

interface TemplateStyles {
  headerClass: string;
  titleClass: string;
  tableClass: string;
}

const Invoice = ({ selectedTemplate = "modern-minimal" }: InvoiceProps) => {
  const [zoom, setZoom] = useState<number>(100);
  const { invoiceData, logo } = useInvoice();

  console.log("Invoice data:", invoiceData);

  // Add console log to verify prop received
  console.log("Logo received in Invoice:", logo);

  // Get selected template configuration
  const template = invoiceTemplates.find(t => t.id === selectedTemplate) || invoiceTemplates[0];

  // Template-specific styles
  const getTemplateStyles = (): TemplateStyles => {
    switch (template.id) {
      case "corporate-pro":
        return {
          headerClass: "bg-blue-50 p-8 rounded-lg",
          titleClass: "text-blue-800 text-6xl font-serif",
          tableClass: "border-collapse border border-blue-100",
        };
      case "creative-bold":
        return {
          headerClass: "bg-gradient-to-r from-indigo-500 to-purple-500 p-8 text-white rounded-t-lg",
          titleClass: "text-white text-7xl font-bold",
          tableClass: "divide-y divide-indigo-100",
        };
      default: // modern-minimal
        return {
          headerClass: "",
          titleClass: "text-7xl font-bold text-gray-800",
          tableClass: "divide-y divide-gray-100",
        };
    }
  };

  const styles = getTemplateStyles();

  // Format date for display
  const formatDate = (dateString: string): string => {
    if (!dateString || dateString === "Invalid Date") return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="flex h-full">
      {/* Container for zoom panel and invoice */}
      <div className="flex gap-2">
        {/* Zoom Panel */}
        <div className="w-12 bg-[#1a1b1aef] rounded-l-xl shadow-sm px-2 py-6 h-[280px] flex flex-col items-center justify-center sticky">
          <div className="h-full flex flex-col items-center justify-between">
            <button
              onClick={() => setZoom(Math.min(zoom + 10, 120))}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Zoom in"
            >
              <Plus size={18} className="text-white" />
            </button>

            <div className="flex-1 flex items-center">
              <div className="bg-white rounded-lg p-2 m-2">
                <Slider
                  value={[zoom]}
                  onValueChange={(value) => setZoom(value[0])}
                  orientation="vertical"
                  min={50}
                  max={120}
                  step={10}
                  className="h-24"
                />
              </div>
            </div>

            <div className="text-[10px] font-medium text-white my-2">
              {zoom}%
            </div>

            <button
              onClick={() => setZoom(Math.max(zoom - 10, 50))}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Zoom out"
            >
              <Minus size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* Invoice Content with Template Styles */}
        <div className="h-full">
          <div
            id="invoice-content"
            className={cn(
              "w-[170mm] h-[207mm] bg-white shadow-sm",
              template.layout.fontFamily
            )}
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top left",
              transition: "transform 0.2s ease-in-out",
              margin: "0 auto",
              padding: "12mm",
              boxSizing: "border-box",
            }}
          >
            <div className="h-full">
              {/* Header with Template Styles */}
              <div className={cn(template.layout.headerStyle, styles.headerClass)}>
                <div className="flex justify-between items-start w-full">
                  <div className="flex-1">
                    {logo ? (
                      <div className="h-20 relative">
                        <Image
                          src={logo} 
                          alt="Company Logo" 
                          className="h-full w-auto object-contain"
                          style={{ maxWidth: '200px' }}
                        />
                      </div>
                    ) : (
                      <h1 className={styles.titleClass}>INVOICE</h1>
                    )}
                  </div>
                  
                  <div className="flex-1 text-right">
                    <div className="text-sm text-gray-600">
                      <p>Invoice date: {formatDate(invoiceData.invoiceDate) || "Not set"}</p>
                      <p>Due date: {formatDate(invoiceData.dueDate) || "Not set"}</p>
                      <p>Invoice no: #{invoiceData.invoiceNumber}</p>
                      <p>PO no: {invoiceData.poNumber}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Addresses with Template Styles */}
              <div className={cn(
                "grid grid-cols-2 gap-8 mb-8",
                template.id === "creative-bold" && "bg-gray-50 p-6 rounded-lg"
              )}>
                <div>
                  <h2 className="text-sm font-semibold text-gray-600 mb-2">
                    From:
                  </h2>
                  <p className="text-sm">{invoiceData.from.name}</p>
                  <p className="text-sm text-gray-600">
                    {invoiceData.from.email}
                  </p>
                  {invoiceData.from.address && (
                    <p className="text-sm text-gray-600">
                      {invoiceData.from.address.street}
                      <br />
                      {invoiceData.from.address.city},{" "}
                      {invoiceData.from.address.state}{" "}
                      {invoiceData.from.address.postalCode}
                    </p>
                  )}
                  {invoiceData.from.phone && (
                    <p className="text-sm text-gray-600">
                      {invoiceData.from.phone}
                    </p>
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-600 mb-2">
                    To:
                  </h2>
                  <p className="text-sm">{invoiceData.to.name}</p>
                  <p className="text-sm text-gray-600">
                    {invoiceData.to.email}
                  </p>
                  {invoiceData.to.address && (
                    <p className="text-sm text-gray-600">
                      {invoiceData.to.address.street}
                      <br />
                      {invoiceData.to.address.city},{" "}
                      {invoiceData.to.address.state}{" "}
                      {invoiceData.to.address.postalCode}
                    </p>
                  )}
                  {invoiceData.to.phone && (
                    <p className="text-sm text-gray-600">
                      {invoiceData.to.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Items Table with Template Styles */}
              <div className="mb-8">
                <table className={cn(
                  "w-full table-fixed",
                  template.layout.tableStyle
                )}>
                  <thead>
                    <tr className="text-left">
                      <th className="w-[40%] py-2 text-sm font-semibold text-gray-600">
                        Item
                      </th>
                      <th className="w-[15%] py-2 text-sm font-semibold text-gray-600 text-right">
                        Quantity
                      </th>
                      <th className="w-[20%] py-2 text-sm font-semibold text-gray-600 text-right">
                        Unit Price
                      </th>
                      <th className="w-[25%] py-2 text-sm font-semibold text-gray-600 text-right">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-2 text-sm truncate pr-4">
                          {item.name}
                        </td>
                        <td className="py-2 text-sm text-right">
                          {item.quantity}
                        </td>
                        <td className="py-2 text-sm text-right">
                          {item.currency?.symbol || invoiceData.currency.symbol}{Number(item.unitPrice).toFixed(2)}
                        </td>
                        <td className="py-2 text-sm text-right">
                          {item.currency?.symbol || invoiceData.currency.symbol}{Number(item.total).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary with Template Styles */}
              <div className={cn(
                "pt-4",
                template.id === "corporate-pro" && "bg-blue-50 p-4 rounded-lg"
              )}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="text-sm">
                    {invoiceData.currency.symbol}{invoiceData.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    Tax ({invoiceData.taxRate * 100}%)
                  </span>
                  <span className="text-sm">
                    {invoiceData.currency.symbol}{invoiceData.taxAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-bold mt-4 pt-4 border-t border-gray-100">
                  <span>Total Amount Due</span>
                  <span>{invoiceData.currency.symbol}{invoiceData.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Footer with Template Styles */}
              <div className={template.layout.footerStyle}>
                <p className="text-sm text-gray-600 mb-1">
                  Payment Memo: {invoiceData.paymentMemo}
                </p>
                <p className="text-sm text-gray-600">{invoiceData.website}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
