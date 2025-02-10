export type InvoiceTemplate = {
  id: string;
  name: string;
  description: string;
  preview: string;
  layout: {
    headerStyle: string;
    colorScheme: string;
    fontFamily: string;
    logoPosition: 'top-right' | 'top-left' | 'top-center' | 'bottom';
    itemsStyle: string;
    footerStyle: string;
    addressesStyle: string;
    summaryStyle: string;
  };
};

export const invoiceTemplates: InvoiceTemplate[] = [
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    description: "Clean, professional design with minimal elements",
    preview: "/templates/modern-minimal.png",
    layout: {
      headerStyle: "flex justify-between items-start mb-10",
      colorScheme: "gray-800",
      fontFamily: "font-sans",
      logoPosition: "top-right",
      itemsStyle: "divide-y divide-gray-100",
      footerStyle: "border-t border-gray-100 pt-8",
      addressesStyle: "grid grid-cols-2 gap-8 mb-8",
      summaryStyle: "w-1/2 ml-auto pt-4",
    },
  },
  {
    id: "corporate-pro",
    name: "Corporate Professional",
    description: "Traditional corporate layout with bold header",
    preview: "/templates/corporate-pro.png",
    layout: {
      headerStyle: "bg-blue-50 p-8 rounded-lg mb-8 grid grid-cols-3 gap-4",
      colorScheme: "blue-800",
      fontFamily: "font-serif",
      logoPosition: "top-left",
      itemsStyle: "border-2 border-blue-100 rounded-lg overflow-hidden",
      footerStyle: "bg-blue-50 mt-8 p-6 rounded-lg text-blue-800",
      addressesStyle: "flex justify-between bg-gray-50 p-6 rounded-lg mb-8",
      summaryStyle: "bg-blue-50 p-4 rounded-lg w-1/3 ml-auto",
    },
  },
  {
    id: "creative-bold",
    name: "Creative Bold",
    description: "Modern design with bold typography and colors",
    preview: "/templates/creative-bold.png",
    layout: {
      headerStyle: "bg-gradient-to-r from-indigo-500 to-purple-500 p-8 text-white rounded-t-lg",
      colorScheme: "indigo-600",
      fontFamily: "font-sans",
      logoPosition: "top-right",
      itemsStyle: "bg-gray-50 rounded-lg p-4 divide-y divide-indigo-100",
      footerStyle: "border-t-4 border-indigo-600 pt-8 mt-12",
      addressesStyle: "flex flex-col md:flex-row justify-between space-y-6 md:space-y-0 md:space-x-8 mb-12",
      summaryStyle: "bg-indigo-50 p-6 rounded-lg w-2/5 ml-auto",
    },
  },
  {
    id: "boutique-elegant",
    name: "Boutique Elegant",
    description: "Sophisticated design for luxury businesses",
    preview: "/templates/boutique-elegant.png",
    layout: {
      headerStyle: "text-center mb-12 pt-8 border-t-4 border-double border-gray-800",
      colorScheme: "gray-900",
      fontFamily: "font-serif",
      logoPosition: "top-center",
      itemsStyle: "divide-y-2 divide-gray-200 [&_td]:py-4",
      footerStyle: "text-center border-b-4 border-double border-gray-800 pb-8 mt-12",
      addressesStyle: "grid grid-cols-2 gap-16 mb-12 [&_h2]:text-center [&_p]:text-center",
      summaryStyle: "w-1/3 mx-auto border-2 border-gray-200 p-6 rounded",
    },
  },
  {
    id: "tech-modern",
    name: "Tech Modern",
    description: "Contemporary design for tech companies",
    preview: "/templates/tech-modern.png",
    layout: {
      headerStyle: "grid grid-cols-2 gap-8 mb-12 bg-black text-white p-8 rounded-lg",
      colorScheme: "slate-900",
      fontFamily: "font-mono",
      logoPosition: "top-left",
      itemsStyle: "bg-slate-900 text-white rounded-lg overflow-hidden [&_th]:bg-slate-800 [&_td]:p-4",
      footerStyle: "bg-slate-900 text-white p-6 rounded-lg mt-8",
      addressesStyle: "grid grid-cols-2 gap-8 mb-8 [&_div]:bg-slate-100 [&_div]:p-6 [&_div]:rounded-lg",
      summaryStyle: "bg-slate-900 text-white p-6 rounded-lg w-1/3 ml-auto",
    },
  }
]; 