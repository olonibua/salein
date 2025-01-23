"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AddressFields } from "./AddressFields";
import { useInvoice } from "@/contexts/InvoiceContext";
import {
  FileText,
  Layout,
  Plus,
  PlusCircle,
  User,
  Briefcase,
  Edit2,
  X,
  ChevronDown,
  Search,
  Calendar,
  Upload,
} from "lucide-react";
import { Switch } from "../ui/switch";
import InvoiceModal from "../InvoiceModal";
import { toast } from "sonner";

interface Customer {
  id: string;
  name: string;
  email: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  phone?: string;
}

interface InvoiceCreationPanelProps {
  onUpload: () => void;
  onCreateInvoice: () => void;
}

const InvoiceCreationPanel = ({
  onUpload,
  onCreateInvoice,
}: InvoiceCreationPanelProps) => {
  const {
    invoiceData,
    updateFromData,
    updateToData,
    updateInvoiceData,
    updateItems,
  } = useInvoice();
  const [activeTab, setActiveTab] = useState("information");
  const [accountType, setAccountType] = useState("personal");
  const [showAddress, setShowAddress] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  // const items = invoiceData.items;
  const [customers, setCustomers] = useState<Customer[]>(() => {
    // Load customers from localStorage on initial render
    const saved = localStorage.getItem("customers");
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<string | null>(null);
  const [showRecipientAddress, setShowRecipientAddress] = useState(false);
  // const router = useRouter();
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Save customers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("customers", JSON.stringify(customers));
  }, [customers]);

  // Set default dates when component mounts
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    // Only set dates if they haven't been set yet
    if (!invoiceData.invoiceDate) {
      updateInvoiceData({
        invoiceDate: today,
        dueDate: today, // You might want to set this to today + 30 days or similar
      });
    }
  }, [invoiceData.invoiceDate, updateInvoiceData]);

  // Format date for display
  // const formatDate = (dateString: string) => {
  //   if (!dateString) return "";
  //   const date = new Date(dateString);
  //   return date.toLocaleDateString("en-GB", {
  //     day: "2-digit",
  //     month: "2-digit",
  //     year: "numeric",
  //   });
  // };

  const handleFromAddressChange = (field: string, value: string) => {
    if (!invoiceData.from.address) {
      updateFromData({
        address: {
          street: "",
          city: "",
          state: "",
          postalCode: "",
          [field]: value,
        },
      });
    } else {
      updateFromData({
        address: {
          ...invoiceData.from.address,
          [field]: value,
        },
      });
    }
  };

  // Handle new item addition
  const handleAddItem = () => {
    const newItem = {
      name: "",
      quantity: 1,
      unitPrice: "",
      total: 0,
    };
    updateItems([...invoiceData.items, newItem]);
  };

  // Handle item updates
  const handleItemUpdate = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updatedItems = [...invoiceData.items];
    const numValue =
      field === "quantity" || field === "unitPrice"
        ? value === ""
          ? ""
          : Number(value)
        : value;

    updatedItems[index] = {
      ...updatedItems[index],
      [field]: numValue,
    };

    // Calculate total for this item
    if (field === "quantity" || field === "unitPrice") {
      updatedItems[index].total =
        (updatedItems[index].quantity || 0) *
        (Number(updatedItems[index].unitPrice) || 0);
    }

    // Calculate subtotal, tax, and total
    const subtotal = updatedItems.reduce(
      (sum, item) => sum + (item.total || 0),
      0
    );
    const taxAmount = subtotal * (invoiceData.taxRate || 0);
    const total = subtotal + taxAmount;

    // Update items and invoice totals
    updateItems(updatedItems);
    updateInvoiceData({
      subtotal,
      taxAmount,
      total,
    });
  };

  // Handle item removal
  const handleRemoveItem = (index: number) => {
    const updatedItems = invoiceData.items.filter((_, i) => i !== index);
    updateItems(updatedItems);
  };

  const handleAddNewCustomer = () => {
    if (invoiceData.to.name && invoiceData.to.email) {
      const newCustomer: Customer = {
        id: Date.now().toString(),
        name: invoiceData.to.name,
        email: invoiceData.to.email,
        address: invoiceData.to.address,
        phone: invoiceData.to.phone,
      };
      setCustomers([...customers, newCustomer]);
      setSelectedCustomer(newCustomer.id);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle tax rate change
  const handleTaxRateChange = (value: string) => {
    const taxRate = value === "" ? 0 : Number(value) / 100;
    const subtotal = invoiceData.items.reduce(
      (sum, item) => sum + (item.total || 0),
      0
    );
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    updateInvoiceData({
      taxRate,
      taxAmount,
      total,
      subtotal, // Make sure subtotal is included
    });
  };

  // Add edit customer handler
  const handleEditCustomer = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      setEditingCustomer(customerId);
      updateToData({
        name: customer.name,
        email: customer.email,
        address: customer.address,
        phone: customer.phone,
      });
    }
  };

  // Add save edited customer handler
  const handleSaveEditedCustomer = () => {
    if (editingCustomer) {
      const updatedCustomers = customers.map((customer) =>
        customer.id === editingCustomer
          ? {
              ...customer,
              name: invoiceData.to.name,
              email: invoiceData.to.email,
              address: invoiceData.to.address,
              phone: invoiceData.to.phone,
            }
          : customer
      );
      setCustomers(updatedCustomers);
      setEditingCustomer(null);
    }
  };

  const handleCreateInvoice = () => {
    // You might want to do some validation here
    setShowInvoiceModal(true);
  };

  // Add resize listener to detect mobile view
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);

      // Show toast notification on mobile
      if (mobile) {
        toast.info("You're viewing the invoice creator in mobile mode", {
          duration: 3000,
        });
      }
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div
        className={`
          ${showInvoiceModal ? "hidden" : ""}
          ${
            isMobileView
              ? "w-full h-screen fixed inset-0 bg-white z-50 flex flex-col"
              : "w-[30%] min-w-[300px] h-[80vh] border-r rounded-xl border-gray-200"
          }
          flex flex-col bg-white
          md:w-[30%] md:min-w-[300px] md:h-[80vh] md:sticky md:top-0
        `}
      >
        {/* Fixed Header - Make it truly fixed for mobile */}
        <div className="flex-none px-4 pt-4 border-b border-gray-100 bg-white md:px-6 md:pt-6">
          <h1 className="text-lg font-semibold mb-4 md:text-2xl md:mb-6">
            Create invoice
          </h1>

          {/* Tabs - Mobile optimized */}
          <div className="flex border-b border-gray-200 overflow-x-auto hide-scrollbar">
            <button
              className={`flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 whitespace-nowrap ${
                activeTab === "information"
                  ? "border-b-2 border-black"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("information")}
            >
              <FileText size={16} className="md:size-18" />
              <span className="text-xs">Your information</span>
            </button>
            <button
              className={`flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 whitespace-nowrap ${
                activeTab === "templates"
                  ? "border-b-2 border-black"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("templates")}
            >
              <Layout size={16} className="md:size-18" />
              <span className="text-xs">Templates</span>
            </button>
            <button
              className={`flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 whitespace-nowrap ${
                activeTab === "new"
                  ? "border-b-2 border-black"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("new")}
            >
              <PlusCircle size={16} className="md:size-18" />
              <span className="text-xs">New invoice</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content - Adjust for mobile */}
        <div
          className={`
          flex-1 overflow-y-auto
          ${isMobileView ? "pb-[80px]" : ""}
          scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent 
          hover:scrollbar-thumb-gray-400
        `}
        >
          {activeTab === "information" && (
            <div className="p-4 md:p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Information</h2>
                <p className="text-gray-500 text-sm">
                  Set your invoice details to be automatically applied every
                  time you create a new invoice.
                </p>
              </div>

              <div className="flex gap-4 mb-8">
                <button
                  className={`flex-1 p-4 rounded-lg border flex flex-col items-center gap-2 ${
                    accountType === "personal"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => setAccountType("personal")}
                >
                  <User
                    size={24}
                    className={
                      accountType === "personal"
                        ? "text-blue-500"
                        : "text-gray-500"
                    }
                  />
                  <span>Personal</span>
                </button>
                <button
                  className={`flex-1 p-4 rounded-lg border flex flex-col items-center gap-2 ${
                    accountType === "business"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => setAccountType("business")}
                >
                  <Briefcase
                    size={24}
                    className={
                      accountType === "business"
                        ? "text-blue-500"
                        : "text-gray-500"
                    }
                  />
                  <span>Business</span>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm text-gray-500 font-medium mb-4">
                    CORE INFORMATION
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm mb-1 block">
                        Personal name
                      </label>
                      <Input
                        value={invoiceData.from.name}
                        onChange={(e) =>
                          updateFromData({ name: e.target.value })
                        }
                        placeholder="Enter your name"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm mb-1 block">
                        Personal email
                      </label>
                      <Input
                        value={invoiceData.from.email}
                        onChange={(e) =>
                          updateFromData({ email: e.target.value })
                        }
                        placeholder="Enter your email"
                        className="w-full"
                      />
                    </div>

                    <AddressFields
                      showAddress={showAddress}
                      onShowAddressChange={setShowAddress}
                      values={invoiceData.from.address || {}}
                      onChange={handleFromAddressChange}
                    />

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm mb-1 block">
                          Phone number
                        </label>
                        <div className="flex gap-2">
                          <select className="w-24 rounded-md border p-2">
                            <option>+234</option>
                          </select>
                          <Input
                            value={invoiceData.from.phone || ""}
                            onChange={(e) =>
                              updateFromData({ phone: e.target.value })
                            }
                            placeholder="Enter phone number"
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-gray-600">
                            Show logo
                          </label>
                          <Switch
                            checked={showLogo}
                            onCheckedChange={setShowLogo}
                          />
                        </div>

                        {showLogo && (
                          <div className="border-2 border-dashed rounded-lg p-4 text-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                              <span className="text-gray-400">Logo</span>
                            </div>
                            <p className="text-sm text-gray-500">
                              Drop your logo here or browse
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t pt-6">
                <h3 className="text-sm text-gray-500 font-medium mb-4">
                  UPLOAD EXISTING INVOICE
                </h3>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={onUpload}
                >
                  <Upload size={16} />
                  <span>Upload Invoice</span>
                </Button>
              </div>
            </div>
          )}

          {activeTab === "templates" && (
            <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 cursor-pointer hover:border-blue-500">
                <div className="bg-gray-50 rounded-lg p-6 mb-2">
                  <div className="w-full h-32 bg-white rounded shadow-sm"></div>
                </div>
                <p className="text-sm font-medium">Template 001</p>
                <p className="text-xs text-gray-500">Logo at the top right</p>
              </div>
              <div className="border rounded-lg p-4 cursor-pointer">
                <div className="bg-gray-50 rounded-lg p-6 mb-2">
                  <div className="w-full h-32 bg-white rounded shadow-sm"></div>
                </div>
                <p className="text-sm font-medium">Template 002</p>
                <p className="text-xs text-gray-500">
                  Logo at the bottom right
                </p>
              </div>
            </div>
          )}

          {activeTab === "new" && (
            <div className="p-4 md:p-6">
              {/* Customer Selection - Adjusted for mobile */}
              <div className="mb-4 md:mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium">Customer</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCustomer(null)}
                  >
                    <Plus size={16} className="mr-2" />
                    New Customer
                  </Button>
                </div>

                {/* Search Input */}
                <div className="relative mb-4">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <Input
                    className="pl-10"
                    placeholder="Search customer"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Customer List */}
                {searchQuery &&
                  filteredCustomers.length > 0 &&
                  !selectedCustomer && (
                    <div className="mb-4 border rounded-lg divide-y">
                      {filteredCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          className="p-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                          onClick={() => {
                            setSelectedCustomer(customer.id);
                            updateToData({
                              name: customer.name,
                              email: customer.email,
                              address: customer.address,
                              phone: customer.phone,
                            });
                          }}
                        >
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-gray-500">
                              {customer.email}
                            </p>
                          </div>
                          <ChevronDown size={16} className="text-gray-400" />
                        </div>
                      ))}
                    </div>
                  )}

                {selectedCustomer && !editingCustomer ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {
                            customers.find((c) => c.id === selectedCustomer)
                              ?.name
                          }
                        </p>
                        <p className="text-sm text-gray-500">
                          {
                            customers.find((c) => c.id === selectedCustomer)
                              ?.email
                          }
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="text-sm text-blue-500"
                          onClick={() => handleEditCustomer(selectedCustomer)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="text-sm text-gray-500"
                          onClick={() => setSelectedCustomer(null)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : editingCustomer ? (
                  <div className="space-y-4">
                    <Input
                      placeholder="Customer name"
                      value={invoiceData.to.name}
                      onChange={(e) => updateToData({ name: e.target.value })}
                    />
                    <Input
                      placeholder="Customer email"
                      value={invoiceData.to.email}
                      onChange={(e) => updateToData({ email: e.target.value })}
                    />
                    <AddressFields
                      showAddress={true}
                      onShowAddressChange={() => {}}
                      values={invoiceData.to.address || {}}
                      onChange={(field, value) =>
                        updateToData({
                          address: {
                            ...invoiceData.to.address,
                            [field]: value,
                          },
                        })
                      }
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveEditedCustomer}
                        variant="default"
                        className="flex-1"
                      >
                        Save changes
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingCustomer(null);
                          setSelectedCustomer(null);
                        }}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Input
                      placeholder="Customer name"
                      value={invoiceData.to.name}
                      onChange={(e) => updateToData({ name: e.target.value })}
                    />
                    <Input
                      placeholder="Customer email"
                      value={invoiceData.to.email}
                      onChange={(e) => updateToData({ email: e.target.value })}
                    />

                    {/* Recipient Address Fields */}
                    <AddressFields
                      showAddress={showRecipientAddress}
                      onShowAddressChange={setShowRecipientAddress}
                      values={invoiceData.to.address || {}}
                      onChange={(field, value) =>
                        updateToData({
                          address: {
                            ...invoiceData.to.address,
                            [field]: value,
                          },
                        })
                      }
                    />

                    {invoiceData.to.name && invoiceData.to.email && (
                      <Button
                        onClick={handleAddNewCustomer}
                        variant="outline"
                        className="w-full"
                      >
                        Save as new customer
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Invoice Details - Adjusted for mobile */}
              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
                <div>
                  <label className="text-sm mb-1 block text-gray-500">
                    Issue Date
                  </label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={invoiceData.invoiceDate}
                      onChange={(e) =>
                        updateInvoiceData({ invoiceDate: e.target.value })
                      }
                      className="pl-3 pr-8 w-full"
                    />
                    <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-sm mb-1 block text-gray-500">
                    Due Date
                  </label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={invoiceData.dueDate}
                      onChange={(e) =>
                        updateInvoiceData({ dueDate: e.target.value })
                      }
                      className="pl-3 pr-8 w-full"
                    />
                    <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Items Table - Adjusted for mobile */}
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 md:gap-4 items-center mb-2 text-xs md:text-sm">
                  <div className="col-span-5">
                    <label className="text-sm text-gray-600">Item</label>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm text-gray-600">Quantity</label>
                  </div>
                  <div className="col-span-3">
                    <label className="text-sm text-gray-600">
                      Unit Price (£)
                    </label>
                  </div>
                </div>

                {invoiceData.items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 md:gap-4 items-center bg-gray-50 rounded-lg p-3"
                  >
                    <div className="col-span-5">
                      <Input
                        value={item.name}
                        onChange={(e) =>
                          handleItemUpdate(index, "name", e.target.value)
                        }
                        placeholder="Item name"
                        className="bg-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemUpdate(index, "quantity", e.target.value)
                        }
                        className="bg-white"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="text"
                        value={item.unitPrice}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, "");
                          handleItemUpdate(index, "unitPrice", value);
                        }}
                        placeholder="0.00"
                        className="bg-white"
                      />
                    </div>
                    <div className="col-span-1">
                      <button
                        className="p-2 hover:bg-gray-200 rounded-full"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleAddItem}
                className="w-full mt-4 p-3 bg-gray-50 rounded-lg text-sm font-medium hover:bg-gray-100 flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add Item
              </button>

              {/* After items table, before payment memo */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Sales tax</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      className="w-20"
                      placeholder="0"
                      value={
                        invoiceData.taxRate
                          ? (invoiceData.taxRate * 100).toString()
                          : ""
                      }
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, "");
                        handleTaxRateChange(value);
                      }}
                    />
                    <span className="text-sm text-gray-600">%</span>
                  </div>
                </div>

                {/* Payment Memo */}
                <div>
                  <label className="text-sm mb-1 block">Payment Memo</label>
                  <Input
                    value={invoiceData.paymentMemo}
                    onChange={(e) =>
                      updateInvoiceData({ paymentMemo: e.target.value })
                    }
                    placeholder="Add payment details"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Create Invoice Button - Make it fixed for mobile */}
        {activeTab === "new" && (
          <div
            className={`
            ${
              isMobileView
                ? "fixed bottom-0 left-0 right-0 bg-white shadow-lg"
                : "sticky bottom-0 bg-white"
            }
            py-3 md:py-4 border-t px-4
          `}
          >
            <button
              onClick={() => {
                handleCreateInvoice();
                onCreateInvoice();
              }}
              className="w-full bg-black text-white rounded-lg py-2.5 md:py-3 px-4 hover:bg-gray-800 transition-colors text-sm md:text-base"
            >
              Create Invoice
            </button>
          </div>
        )}
      </div>

      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        recipientEmail={invoiceData.to.email}
        reminderEnabled={false}
      />
    </>
  );
};

export default InvoiceCreationPanel;
