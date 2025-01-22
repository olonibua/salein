import Invoice from "@/components/Invoice/Invoice";
import InvoiceCreationPanel from "@/components/InvoicePanel/InvoiceCreationPanel";
import { InvoiceProvider } from "@/contexts/InvoiceContext";

export default function Home() {
  return (
    <InvoiceProvider>
      <div className="flex flex-col h-[110vh] ">
        <nav className="hidden md:block sticky top-0 z-50 bg-white shadow-sm px-4 py-3">
          <h2 className="font-medium text-xl">SaleIn</h2>
        </nav>
        <div className="flex flex-1 md:space-x-3 p-10 bg-gray-100 mx-auto w-full ">
          <div className="hidden md:block flex-1">
            <Invoice />
          </div>
          <InvoiceCreationPanel />
        </div>
      </div>
    </InvoiceProvider>
  );
}
