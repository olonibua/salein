import { Client, Databases, Query } from 'node-appwrite';
import { Resend } from 'resend';

export default async function checkReminders() {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

  const databases = new Databases(client);
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const now = new Date().toISOString();
    const reminders = await databases.listDocuments(
      process.env.APPWRITE_INVOICESDB_ID!,
      process.env.APPWRITE_INVOICESCOLLECTION_ID!,
      [
        Query.equal('status', 'pending'),
        Query.lessThanEqual('sendDate', now),
        Query.lessThan('retryCount', 3)
      ]
    );

    for (const reminder of reminders.documents) {
      try {
        await resend.emails.send({
          from: "Salein <Salein@olonts.site>",
          to: [reminder.recipientEmail],
          subject: `Payment Reminder for Invoice #${reminder.invoiceId}`,
          html: `<p>This is a reminder that payment for Invoice #${reminder.invoiceId} 
                 for ${reminder.amount} is due on ${reminder.dueDate}.</p>`
        });

        await databases.updateDocument(
          process.env.APPWRITE_INVOICESDB_ID!,
          process.env.APPWRITE_INVOICESCOLLECTION_ID!,
          reminder.$id,
          { status: 'sent' }
        );
      } catch (error) {
        const newRetryCount = (reminder.retryCount || 0) + 1;
        await databases.updateDocument(
          process.env.APPWRITE_INVOICESDB_ID!,
          process.env.APPWRITE_INVOICESCOLLECTION_ID!,
          reminder.$id,
          {
            retryCount: newRetryCount,
            status: newRetryCount >= 3 ? 'failed' : 'pending'
          }
        );
      }
    }
  } catch (error) {
    console.error('Error processing reminders:', error);
    throw error;
  }
} 