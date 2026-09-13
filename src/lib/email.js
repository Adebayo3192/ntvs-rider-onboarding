import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = 'NTVS Delivery <onboarding@nouradinetopcash.com>';
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL;

export async function notifyAdminOfSubmission(riderName) {
  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: ADMIN_EMAIL,
      subject: `New rider submission: ${riderName}`,
      html: `
        <p>A new rider application has been submitted.</p>
        <p><strong>Name:</strong> ${riderName}</p>
        <p>Log in to the admin dashboard to review it.</p>
      `,
    });
  } catch (err) {
    console.error('Failed to send admin notification email:', err);
  }
}

export async function notifyRiderOfDecision(riderEmail, riderName, status, rejectionReason) {
  const isApproved = status === 'approved';

  const subject = isApproved
    ? 'Your NTVS rider application has been approved'
    : 'Update on your NTVS rider application';

  const html = isApproved
    ? `
        <p>Hi ${riderName},</p>
        <p>Good news — your application to become an NTVS rider has been <strong>approved</strong>.</p>
        <p>You'll be contacted with next steps soon.</p>
        <p>Thank you for applying.</p>
      `
    : `
        <p>Hi ${riderName},</p>
        <p>Thank you for applying to become an NTVS rider. After review, we're unable to approve your application at this time.</p>
        ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
        <p>If you believe this is a mistake, please contact the shop directly.</p>
      `;

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: riderEmail,
      subject,
      html,
    });
  } catch (err) {
    console.error('Failed to send rider notification email:', err);
  }
}