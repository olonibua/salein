import { NextResponse } from "next/server";
import { databases } from "@/utils/appwrite";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Log the incoming data and environment variables
    console.log("Received data:", data);
    console.log("DB ID:", process.env.NEXT_PUBLIC_APPWRITE_INVOICESDB_ID);
    console.log(
      "Collection ID:",
      process.env.NEXT_PUBLIC_APPWRITE_INVOICESCOLLECTION_ID
    );

    if (
      !process.env.NEXT_PUBLIC_APPWRITE_INVOICESDB_ID ||
      !process.env.NEXT_PUBLIC_APPWRITE_INVOICESCOLLECTION_ID
    ) {
      throw new Error("Missing database configuration");
    }

    // Only include fields that are defined in your Appwrite collection
    const documentData = {
      recipientEmail: data.recipientEmail,
      teamEmails: data.teamEmails || [],
      amount: data.amount || 0,
      reminderEnabled: data.reminderEnabled || false,
      reminderInterval: data.reminderInterval || "weekly",
      reminderCount: data.reminderCount || 1,
      status: "pending",
    };

    const response = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_INVOICESDB_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_INVOICESCOLLECTION_ID!,
      "unique()",
      documentData
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      { error: "Failed to create invoice", details: (error as Error).message },
      { status: 500 }
    );
  }
}
