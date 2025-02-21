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
  ArrowRight,
} from "lucide-react";
import { Switch } from "../ui/switch";
import InvoiceModal from "../InvoiceModal";
import { toast } from "sonner";
import { Select, SelectTrigger,  SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

import { invoiceTemplates, } from "@/types/invoice";
import { motion, AnimatePresence } from "framer-motion";
import { allCurrencies } from "@/types/currency";
import { addDays } from "date-fns";

interface InvoiceCreationPanelProps {
  onUpload: () => void;
  onCreateInvoice: () => void;
}

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

interface CompanyDetails {
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
  website?: string;
}

type SavedPersonalDetails = CompanyDetails;

interface ItemUpdate {
  name?: string;
  quantity?: number;
  unitPrice?: string | number;
  total?: number;
  currency?: { label: string; value: string; symbol: string };
}

const InvoiceCreationPanel = ({
  // onUpload,
  onCreateInvoice,
}: InvoiceCreationPanelProps) => {
  const {
    invoiceData,
    updateFromData,
    updateToData,
    updateInvoiceData,
    updateItems,
    setLogo,
  } = useInvoice();

  // State with proper typing
  const [activeTab, setActiveTab] = useState<"information" | "templates" | "new">("information");
  const [accountType, setAccountType] = useState<"personal" | "business">("personal");
  const [showAddress, setShowAddress] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem("customers");
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<string | null>(null);
  const [showRecipientAddress, setShowRecipientAddress] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [companies, setCompanies] = useState<CompanyDetails[]>([]);
  const [savedPersonalDetails, setSavedPersonalDetails] = useState<SavedPersonalDetails[]>(() => {
    const saved = localStorage.getItem('personalDetails');
    return saved ? JSON.parse(saved) : [];
  });
  const [hasStartedFilling, setHasStartedFilling] = useState(false);
  const [isUploadedInvoice, _setIsUploadedInvoice] = useState(false);

  // Type-safe handlers
  const handleFromDataChange = (field: string, value: string) => {
    if (!hasStartedFilling) {
      setHasStartedFilling(true);
      toast.info(
        <div className="flex flex-col gap-1">
          <span className="font-medium">Privacy First! 🔒</span>
          <span className="text-sm text-gray-600">
            All information is stored locally on your device
          </span>
        </div>,
        {
          duration: 4000,
          className: "bg-gradient-to-r from-blue-50 to-indigo-50",
          position: "bottom-right",
        }
      );
    }

    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      updateFromData({
        address: {
          ...invoiceData.from.address,
          [addressField]: value
        }
      });
    } else {
      updateFromData({ [field]: value });
    }
  };

  const handleItemUpdate = (
    index: number,
    field: keyof ItemUpdate,
    value: string | number | { label: string; value: string; symbol: string }
  ) => {
    const updatedItems = [...invoiceData.items];
    
    if (field === "currency") {
      if (index === 0) {
        const selectedCurrency = allCurrencies.find(c => c.value === value);
        if (selectedCurrency) {
          updatedItems.forEach(item => {
            item.currency = selectedCurrency;
          });
          updateInvoiceData({ currency: selectedCurrency });
        }
      } else {
        toast.info("Currency can only be changed on the first item", {
          duration: 3000,
        });
        return;
      }
    } else {
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
    }

    if (field === "quantity" || field === "unitPrice") {
      updatedItems[index].total =
        (updatedItems[index].quantity || 0) *
        (Number(updatedItems[index].unitPrice) || 0);
    }

    const subtotal = updatedItems.reduce(
      (sum, item) => sum + (item.total || 0),
      0
    );
    const taxAmount = subtotal * (invoiceData.taxRate || 0);
    const total = subtotal + taxAmount;

    updateItems(updatedItems);
    updateInvoiceData({
      subtotal,
      taxAmount,
      total,
    });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string); // Directly set logo in context
        console.log("Logo automatically applied");
      };
      reader.readAsDataURL(file);
    }
  };

  // Load customers and companies from localStorage on mount
  useEffect(() => {
    const savedCustomers = localStorage.getItem("customers");
    const savedCompanies = localStorage.getItem("companies");

    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    }
    if (savedCompanies) {
      setCompanies(JSON.parse(savedCompanies));
    }
  }, []);

  // Save customers and companies to localStorage whenever they change
  useEffect(() => {
    if (customers.length > 0) {
      // Only save if there are customers
      localStorage.setItem("customers", JSON.stringify(customers));
    }
    if (companies.length > 0) {
      localStorage.setItem("companies", JSON.stringify(companies));
    }
  }, [customers, companies]);

  // Set default dates when component mounts
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    if (!invoiceData.invoiceDate) {
      updateInvoiceData({
        invoiceDate: today,
        dueDate: addDays(new Date(), 30).toISOString().split("T")[0], // Set due date 30 days ahead by default
      });
    }
  }, [invoiceData.invoiceDate, updateInvoiceData]);

  // Handle new item addition
  const handleAddItem = () => {
    const newItem = {
      name: "",
      quantity: 1,
      unitPrice: "",
      total: 0,
      currency: invoiceData.currency
    };
    updateItems([...invoiceData.items, newItem]);
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

      // Update customers state with new customer
      const updatedCustomers = [...customers, newCustomer];
      setCustomers(updatedCustomers);

      // Explicitly save to localStorage
      localStorage.setItem("customers", JSON.stringify(updatedCustomers));

      setSelectedCustomer(newCustomer.id);
      toast.success("Customer saved successfully");
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

 

  const handleNextToTemplates = () => {
    setActiveTab("templates");
  };

  const handleSavePersonalDetails = () => {
    if (invoiceData.from.name && invoiceData.from.email) {
      const newDetails = {
        id: Date.now().toString(),
        name: invoiceData.from.name,
        email: invoiceData.from.email,
        address: invoiceData.from.address,
        phone: invoiceData.from.phone,
        website: invoiceData.website,
      };

      const updatedDetails = [...savedPersonalDetails, newDetails];
      setSavedPersonalDetails(updatedDetails);
      localStorage.setItem('personalDetails', JSON.stringify(updatedDetails));
      toast.success("Personal details saved successfully");
    }
  };

  const handleSelectSavedDetails = (details: CompanyDetails) => {
    updateFromData({
      name: details.name,
      email: details.email,
      address: details.address,
      phone: details.phone,
    });
    updateInvoiceData({ website: details.website });
  };

  // Add this useEffect for the privacy toast
  useEffect(() => {
    setTimeout(() => {
      toast.info(
        <div className="flex flex-col gap-1">
          <span className="font-medium">Local Storage Only</span>
          <span className="text-sm text-gray-600">
            All your information is stored locally on your device, not on our servers
          </span>
        </div>,
        {
          duration: 5000,
          className: "bg-gradient-to-r from-blue-50 to-indigo-50",
          icon: "🔒",
          position: "bottom-right",
          style: {
            animation: "slideUp 0.5s ease-out"
          }
        }
      );
    }, 1000);
  }, []);

  // Add tab content animations
  const tabContentVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      x: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  // const formatDisplayDate = (dateString: string) => {
  //   if (!dateString || dateString === "Invalid Date") return "";
  //   try {
  //     const date = new Date(dateString);
  //     if (isNaN(date.getTime())) return "";
  //     return date.toLocaleDateString("en-GB", {
  //       day: "2-digit",
  //       month: "2-digit",
  //       year: "numeric",
  //     });
  //   } catch {
  //     return "";
  //   }
  // };

  // Add date handling
  const handleDateChange = (field: 'invoiceDate' | 'dueDate', value: string) => {
    console.log(`Updating ${field} to:`, value); // Debug log
    updateInvoiceData({
      [field]: value
    });
  };

  // When file is uploaded
  // const handleFileUpload = async (file: File) => {
  //   // ... existing upload logic ...
  //   setIsUploadedInvoice(true);
  //   setShowInvoiceModal(true);
  // };

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
          <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-none">
            <button
              className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 whitespace-nowrap ${
                activeTab === "information"
                  ? "border-b-2 border-black"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("information")}
            >
              <FileText size={14} className="md:w-4 md:h-4" />
              <span className="text-xs">Information</span>
            </button>
            <button
              className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 whitespace-nowrap ${
                activeTab === "templates"
                  ? "border-b-2 border-black"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("templates")}
            >
              <Layout size={14} className="md:w-4 md:h-4" />
              <span className="text-xs">Templates</span>
            </button>
            <button
              className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 whitespace-nowrap ${
                activeTab === "new"
                  ? "border-b-2 border-black"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("new")}
            >
              <PlusCircle size={14} className="md:w-4 md:h-4" />
              <span className="text-xs">New</span>
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
          <AnimatePresence mode="wait">
            {activeTab === "information" && (
              <motion.div
                key="information"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="p-4"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
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
                              handleFromDataChange("name", e.target.value)
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
                              handleFromDataChange("email", e.target.value)
                            }
                            placeholder="Enter your email"
                            className="w-full"
                          />
                        </div>

                        <AddressFields
                          showAddress={showAddress}
                          onShowAddressChange={setShowAddress}
                          values={invoiceData.from.address || {}}
                          onChange={handleFromDataChange}
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
                                  handleFromDataChange("phone", e.target.value)
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
                                  <label className="cursor-pointer w-full h-full flex items-center justify-center">
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      onChange={handleLogoUpload} 
                                      className="hidden"
                                    />
                                    <span className="text-sm text-gray-500">
                                      Drop logo here or click to browse
                                    </span>
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {savedPersonalDetails.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm text-gray-500 font-medium mb-4">
                          SAVED DETAILS
                        </h3>
                        <div className="space-y-2">
                          {savedPersonalDetails.map((details) => (
                            <div
                              key={details.id}
                              className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleSelectSavedDetails(details)}
                            >
                              <p className="font-medium">{details.name}</p>
                              <p className="text-sm text-gray-600">{details.email}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSavePersonalDetails}
                          variant="outline"
                          className="w-full"
                        >
                          Save Personal Details
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 border-t pt-6">
                    <h3 className="text-sm text-gray-500 font-medium mb-4">
                      PROCEED TO SELECT TEMPLATE
                    </h3>
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-800"
                      onClick={handleNextToTemplates}
                    >
                      <ArrowRight size={16} />
                      <span>Next</span>
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === "templates" && (
              <motion.div
                key="templates"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="p-4"
              >
                <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {invoiceTemplates.map((template, index) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="border rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors">
                        <div className="bg-gray-50 rounded-lg p-6 mb-2">
                          <div className="w-full h-32 bg-white rounded shadow-sm">
                            {/* Template preview image or placeholder */}
                          </div>
                        </div>
                        <p className="text-sm font-medium">{template.name}</p>
                        <p className="text-xs text-gray-500">{template.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
                
                {/* Next button */}
                <div className="mt-8 border-t pt-6">
                  <Button
                    className="w-full flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-800"
                    onClick={() => setActiveTab("new")}
                  >
                    <span>Continue to Invoice</span>
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </motion.div>
            )}

            {activeTab === "new" && (
              <motion.div
                key="new"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="p-4"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
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

                  {/* Remove Company Details section and replace with simple input fields */}
                 
                  
                  {/* Invoice Details - Adjusted for mobile */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm mb-1 block">Invoice Date</label>
                      <Input
                        type="date"
                        value={invoiceData.invoiceDate}
                        onChange={(e) => handleDateChange('invoiceDate', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm mb-1 block">Due Date</label>
                      <Input
                        type="date"
                        value={invoiceData.dueDate}
                        onChange={(e) => handleDateChange('dueDate', e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Items Table - Adjusted for mobile */}
                  <AnimatePresence>
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                     

                      <div className="grid grid-cols-12 gap-2 md:gap-4 items-center mb-2 text-xs md:text-sm">
                        <div className="col-span-4 md:col-span-5">
                          <span className="font-medium">Item</span>
                        </div>
                        <div className="col-span-2 md:col-span-2 text-right">
                          <span className="font-medium">Qty</span>
                        </div>
                        <div className="col-span-3 md:col-span-2 text-right">
                          <span className="font-medium">Price</span>
                        </div>
                        <div className="col-span-2 md:col-span-2 text-right">
                          <span className="font-medium">Currency</span>
                        </div>
                        <div className="col-span-1 md:col-span-1"></div>
                      </div>

                      {invoiceData.items.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2, delay: index * 0.1 }}
                          className="grid grid-cols-12 gap-2 md:gap-4 items-center bg-gray-50 rounded-lg p-3"
                        >
                          <div className="col-span-4 md:col-span-5">
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Input
                                value={item.name}
                                onChange={(e) =>
                                  handleItemUpdate(index, "name", e.target.value)
                                }
                                placeholder="Item name"
                                className="bg-white text-xs md:text-sm"
                              />
                            </motion.div>
                          </div>
                          <div className="col-span-2 md:col-span-2">
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleItemUpdate(index, "quantity", e.target.value)
                                }
                                placeholder="0"
                                className="bg-white text-right text-xs md:text-sm"
                              />
                            </motion.div>
                          </div>
                          <div className="col-span-3 md:col-span-2">
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Input
                                type="text"
                                value={item.unitPrice}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/[^0-9.]/g, "");
                                  handleItemUpdate(index, "unitPrice", value);
                                }}
                                placeholder="0.00"
                                className="bg-white text-right text-xs md:text-sm"
                              />
                            </motion.div>
                          </div>
                          <div className="col-span-2 md:col-span-2">
                            <Select
                              value={item.currency?.value || invoiceData.currency.value}
                              onValueChange={(value) => handleItemUpdate(index, "currency", value)}
                              disabled={index !== 0}
                            >
                              <SelectTrigger className="bg-white h-9 text-xs md:text-sm">
                                <SelectValue placeholder="Currency" />
                              </SelectTrigger>
                              <SelectContent>
                                {allCurrencies.map((currency) => (
                                  <SelectItem 
                                    key={currency.value} 
                                    value={currency.value}
                                    className="text-xs md:text-sm"
                                  >
                                    {currency.symbol} ({currency.value})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <motion.div 
                            className="col-span-1 md:col-span-1 flex justify-end"
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <button
                              className="p-2 hover:bg-red-100 hover:text-red-500 rounded-full transition-colors"
                              onClick={() => handleRemoveItem(index)}
                            >
                              <X size={14} className="md:w-4 md:h-4" />
                            </button>
                          </motion.div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </AnimatePresence>

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
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
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
        isUploadedInvoice={isUploadedInvoice}
      />
    </>
  );
};

export default InvoiceCreationPanel;
