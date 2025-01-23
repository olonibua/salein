import { NextResponse } from "next/server";
import { Resend } from "resend";

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
    } = await req.json();

    const data = await resend.emails.send({
      from: "Salein <onboarding@resend.dev>",
      to: [to],
      cc: teamEmails,
      subject: subject,
      html: htmlContent,
      attachments: [
        {
          filename: `invoice-${Date.now()}.pdf`,
          content: Buffer.from(new Uint8Array(pdfBuffer)),
        },
      ],
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to send email", details: String(error) },
      { status: 500 }
    );
  }
}
