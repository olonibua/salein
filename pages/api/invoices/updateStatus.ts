// utils/updatestatus.ts
import { databases } from "@/utils/appwrite"; // Adjust import based on your project
import { Models } from "appwrite";

export interface UpdateStatusData {
  invoiceId: string;
  status: "pending" | "paid" | "overdue";
}

export const updateInvoiceStatus = async ({
  invoiceId,
  status,
}: UpdateStatusData): Promise<Models.Document> => {
  try {
    const response = await databases.updateDocument(
      "database_id", // Replace with your database ID
      "collection_id", // Replace with your collection ID
      invoiceId,
      { status }
    );
    return response;
  } catch (error) {
    console.error("Error updating invoice status:", (error as Error).message);
    throw new Error("Failed to update invoice status");
  }
};
