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
      from: "Salein <Salein@olonts.site>",
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


    try {
      const response = await resend.emails.send(emailData);


      if (!response || !response.data || !response.data.id) {
        throw new Error("Resend API did not return a valid ID.");
      }

      return NextResponse.json({ success: true, id: response.data.id });
    } catch (resendError: unknown) {
      const error = resendError as Error;
      console.error("Resend API Error:", error);
      return NextResponse.json(
        { error: "Failed to send via Resend API", details: error.message },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Detailed error:", err);
    return NextResponse.json(
      {
        error: "Failed to send email",
        details: err?.message || "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
