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
      invoiceId,
      dueDate,
      amount,
    } = await req.json();

    const emailData = {
      from: "Salein <invoices@olonts.site>",
      to: [to],
      subject: `Payment Reminder: Invoice ${invoiceId} Due Soon`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Payment Reminder</h2>
          <p>This is a friendly reminder about your upcoming payment.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Invoice ID:</strong> ${invoiceId}</p>
            <p><strong>Amount Due:</strong> ${amount}</p>
            <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
          </div>
          
          <p>Please ensure your payment is made before the due date to avoid any late fees.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">
              If you've already made the payment, please disregard this reminder.
            </p>
          </div>
        </div>
      `,
    };

    const data = await resend.emails.send(emailData);
    return NextResponse.json({ success: true, id: data.data?.id });
  } catch (error: any) {
    console.error("Reminder email error:", error);
    return NextResponse.json(
      { error: "Failed to send reminder", details: error.message },
      { status: 500 }
    );
  }
} 