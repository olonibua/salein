"use client";
import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Minus, Plus } from "lucide-react";
import { useInvoice } from "@/contexts/InvoiceContext";

const Invoice = () => {
  const [zoom, setZoom] = useState(100);
  const { invoiceData } = useInvoice();

  //   const invoiceData = {
  //     invoiceDate: "20/01/2025",
  //     dueDate: "20/01/2025",
  //     from: {
  //       name: "olonts",
  //       email: "olonts@gmail.com",
  //     },
  //     to: {
  //       name: "olonts",
  //       email: "olonts@gmail.com",
  //     },
  //     poNumber: "11",
  //     invoiceNumber: "MON-715",
  //     items: [
  //       { name: "bag", quantity: 2, unitPrice: 1000.0, total: 2000.0 },
  //       { name: "brush", quantity: 3, unitPrice: 4000.0, total: 12000.0 },
  //     ],
  //     subtotal: 14000.0,
  //     taxRate: 0.1,
  //     taxAmount: 1400.0,
  //     total: 15400.0,
  //     paymentMemo: "pay",
  //     website: "www.salein.com",
  //   };

  // useEffect(() => {
  //   // Load html2pdf dynamically on client side
  //   require("html2pdf.js");
  // }, []);

  //   const handleDownload = () => {
  //     const invoice = document.getElementById("invoice-content");
  //     const opt = {
  //       margin: 1,
  //       filename: `invoice-${invoiceData.invoiceNumber}.pdf`,
  //       image: { type: "jpeg", quality: 0.98 },
  //       html2canvas: { scale: 2 },
  //       jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
  //     };

  //     if (invoice) {
  //       const originalTransform = invoice.style.transform;
  //       invoice.style.transform = "scale(1)";

  //       html2pdf()
  //         .set(opt)
  //         .from(invoice)
  //         .save()
  //         .then(() => {
  //           invoice.style.transform = originalTransform;
  //         });
  //     }
  //   };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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

        {/* Invoice Content - A4 Format */}
        <div className="h-full">
          <div
            id="invoice-content"
            className="w-[170mm] h-[207mm] bg-white shadow-sm"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top left",
              transition: "transform 0.2s ease-in-out",
              margin: "0 auto",
              paddingTop: "12mm",
              padding: "12mm", // Standard A4 margins
              boxSizing: "border-box",
            }}
          >
            <div className="h-full">
              {/* Header */}
              <div className="flex justify-between mb-10">
                <div>
                  <h1 className="text-7xl font-bold text-gray-800">Invoice</h1>
                  <div className="text-sm text-gray-600 mt-2">
                    <p>Invoice date: {formatDate(invoiceData.invoiceDate)}</p>
                    <p>Due date: {formatDate(invoiceData.dueDate)}</p>
                  </div>
                </div>
                <div className="text-right mt-2">
                  <p className="text-sm text-gray-600">
                    Invoice no: #{invoiceData.invoiceNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    PO no: {invoiceData.poNumber}
                  </p>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-2 gap-8 mb-8 mt-5 pt-5 border-t border-gray-100">
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

              {/* Items Table */}
              <div className="mb-8 mt-2">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 text-sm font-semibold text-gray-600">
                        Item
                      </th>
                      <th className="text-right py-2 text-sm font-semibold text-gray-600">
                        Quantity
                      </th>
                      <th className="text-right py-2 text-sm font-semibold text-gray-600">
                        Unit Price
                      </th>
                      <th className="text-right py-2 text-sm font-semibold text-gray-600">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-2 text-sm">{item.name}</td>
                        <td className="py-2 text-sm text-right">
                          {item.quantity}
                        </td>
                        <td className="py-2 text-sm text-right">
                          £{Number(item.unitPrice).toFixed(2)}
                        </td>
                        <td className="py-2 text-sm text-right">
                          £{Number(item.total).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="border-t border-gray-100 pt-4 mt-1">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="text-sm">
                    £{invoiceData.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    Tax ({invoiceData.taxRate * 100}%)
                  </span>
                  <span className="text-sm">
                    £{invoiceData.taxAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-bold mt-4 pt-4 border-t border-gray-100">
                  <span>Total Amount Due</span>
                  <span>£{invoiceData.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Footer */}
              <div className=" border-t border-gray-100 pt-16">
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
