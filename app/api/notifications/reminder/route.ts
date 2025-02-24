import { NextResponse } from "next/server";
import { Resend } from "resend";

interface ReminderRequestBody {
  to: string;
  invoiceId: string;
  dueDate: string;
  amount: number;
}

interface EmailData {
  from: string;
  to: string[];
  subject: string;
  html: string;
}

export async function POST(req: Request) {
  console.log('Received reminder request');
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.error('RESEND_API_KEY not configured');
    return NextResponse.json(
      { error: "RESEND_API_KEY is not configured" },
      { status: 500 }
    );
  }

  const resend = new Resend(resendApiKey);

  try {
    const body = await req.json();
    console.log('Reminder request body:', body);

    const { to, invoiceId, dueDate, amount }: ReminderRequestBody = body;

    if (!to || !invoiceId || !dueDate) {
      console.error('Missing required fields:', { to, invoiceId, dueDate });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const formattedAmount = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount || 0);

    const formattedDate = new Date(dueDate).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const emailData: EmailData = {
      from: "Salein <invoices@olonts.site>",
      to: [to],
      subject: `Payment Reminder: Invoice ${invoiceId} Due Soon`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Payment Reminder</h2>
          <p>This is a friendly reminder about your upcoming payment.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Invoice ID:</strong> ${invoiceId}</p>
            <p><strong>Amount Due:</strong> ${formattedAmount}</p>
            <p><strong>Due Date:</strong> ${formattedDate}</p>
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

    console.log('Sending email with data:', emailData);

    const data = await resend.emails.send(emailData);
    console.log('Email sent successfully:', data);

    if (!data.data) {
      return NextResponse.json(
        { error: "Failed to send email: No response data" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data.data.id });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Failed to send reminder email:", err);
    return NextResponse.json(
      { error: "Failed to send reminder", details: err.message },
      { status: 500 }
    );
  }
}
