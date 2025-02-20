"use client";
import { useRouter } from "next/navigation";
import InvoiceSettingsPanel from "@/components/InvoicePanel/InvoiceSettingsPanel";

export default function InvoiceSettingsPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">
        <InvoiceSettingsPanel 
          onBack={() => router.push('/invoice')}
        />
      </div>
    </div>
  );
} 