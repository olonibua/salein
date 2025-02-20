import { NextResponse } from "next/server";
import { Resend } from "resend";

interface EmailData {
  from: string;
  to: string[];
  cc?: string[];
  subject: string;
  html: string;
  attachments: Array<{
    filename: string;
    content: Buffer;
  }>;
}

interface RequestBody {
  to: string;
  subject: string;
  htmlContent: string;
  pdfBuffer: number[];
  teamEmails?: string[];
  fileName?: string;
}

interface ResendResponse {
  data?: {
    id: string;
  };
  error?: {
    message: string;
  };
}

export async function POST(req: Request) {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    return NextResponse.json(
      { error: "RESEND_API_KEY is not configured" },
      { status: 500 }
    );
  }

  const resend = new Resend(resendApiKey);

  try {
    const {
      to,
      subject,
      htmlContent,
      pdfBuffer,
      teamEmails = [],
      fileName = `invoice-${Date.now()}.pdf`,
    }: RequestBody = await req.json();

    // Validate email
    if (!to || !to.trim()) {
      return NextResponse.json(
        { error: "Recipient email is required" },
        { status: 400 }
      );
    }

    console.log("Sending email to:", to);
    console.log("Attachment size:", pdfBuffer.length);

    const emailData: EmailData = {
      from: "Salein <onboarding@resend.dev>",
      to: [to],
      cc: teamEmails,
      subject,
      html: htmlContent,
      attachments: [
        {
          filename: fileName,
          content: Buffer.from(pdfBuffer),
        },
      ],
    };

    console.log("Email data:", { ...emailData, attachments: 'PDF Buffer' });

    try {
      const data: ResendResponse = await resend.emails.send(emailData);
      console.log("Resend API Response:", data);

      if (data?.error) {
        throw new Error(`Resend API Error: ${data.error.message}`);
      }

      return NextResponse.json({ 
        success: true, 
        id: data?.data?.id || 'sent' 
      });
    } catch (resendError: unknown) {
      const error = resendError as Error;
      console.error("Resend API Error:", error);
      throw new Error(error?.message || "Failed to send via Resend API");
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Detailed error:", err);
    return NextResponse.json(
      { 
        error: "Failed to send email", 
        details: err?.message || "Unknown error occurred"
      },
      { status: 500 }
    );
  }
}
