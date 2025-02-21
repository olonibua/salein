"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import the component with SSR disabled
const InvoiceSettingsPanel = dynamic(
  () => import("@/components/InvoicePanel/InvoiceSettingsPanel"),
  { ssr: false }
);

export default function InvoiceSettingsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">
        <InvoiceSettingsPanel onBack={() => router.push("/invoice")} />
      </div>
    </div>
  );
}
