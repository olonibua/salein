export const generateInvoiceNumber = () => {
  const prefix = "INV";
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}; 