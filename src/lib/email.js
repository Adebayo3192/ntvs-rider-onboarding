import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = 'NTVS Delivery <onboarding@nouradinetopcash.com>';
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nouradinetopcash.com';
const LOGO_URL = `${SITE_URL}/logo.png`;

function emailShell(bodyHtml) {
  return `
  <div style="margin:0;padding:0;background:#F2F6F3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F2F6F3;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 6px 20px rgba(14,42,29,.08);">
            <tr>
              <td style="background:linear-gradient(135deg,#0E2A1D,#173D28);padding:28px 24px;text-align:center;">
                <img src="${LOGO_URL}" alt="NTVS" width="64" height="64" style="display:block;margin:0 auto 10px;" />
                <span style="color:#ffffff;font-size:17px;font-weight:800;letter-spacing:-.3px;">NTVS Delivery</span>
                <br/>
                <span style="color:rgba(255,255,255,.65);font-size:12px;font-weight:600;">Fast and Reliable</span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 26px;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:18px 26px;background:#F7FBF8;border-top:1px solid #E7ECE8;text-align:center;">
                <span style="font-size:11.5px;color:#9AA8A0;">© 2026 Nouradine Top Cash Ventures. All rights reserved.</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>`;
}

function statusBadge(status) {
  const map = {
    approved: { bg: '#DCF4E6', color: '#04763F', label: 'Approved' },
    rejected: { bg: '#FDE4E6', color: '#C13239', label: 'Rejected' },
  };
  const s = map[status];
  return `<span style="display:inline-block;padding:6px 14px;border-radius:999px;background:${s.bg};color:${s.color};font-size:12.5px;font-weight:800;">${s.label}</span>`;
}

export async function notifyAdminOfSubmission(riderName) {
  const body = `
    <div style="text-align:center;margin-bottom:6px;">
      <span style="display:inline-block;width:44px;height:44px;border-radius:13px;background:#DCF4E6;line-height:44px;font-size:20px;">📋</span>
    </div>
    <h2 style="margin:14px 0 6px;text-align:center;font-size:19px;font-weight:800;color:#10281C;">New Rider Submission</h2>
    <p style="margin:0 0 18px;text-align:center;font-size:14px;color:#6E7D76;">A new rider application is waiting for your review.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7FBF8;border-radius:14px;border:1px solid #E7ECE8;">
      <tr>
        <td style="padding:16px 18px;">
          <span style="font-size:12.5px;font-weight:700;color:#7C8A83;">Rider Name</span><br/>
          <span style="font-size:16px;font-weight:800;color:#10281C;">${riderName}</span>
        </td>
      </tr>
    </table>
    <div style="text-align:center;margin-top:22px;">
      <a href="${SITE_URL}/admin/dashboard/riders" style="display:inline-block;padding:14px 28px;border-radius:14px;background:linear-gradient(100deg,#0BAE5E,#0FA45C);color:#ffffff;font-size:14.5px;font-weight:800;text-decoration:none;">
        Review Application →
      </a>
    </div>
  `;

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: ADMIN_EMAIL,
      subject: `New rider submission: ${riderName}`,
      html: emailShell(body),
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

  const body = isApproved
    ? `
      <div style="text-align:center;margin-bottom:10px;">${statusBadge('approved')}</div>
      <h2 style="margin:14px 0 6px;text-align:center;font-size:19px;font-weight:800;color:#10281C;">You're approved, ${riderName}! 🎉</h2>
      <p style="margin:0 0 4px;text-align:center;font-size:14.5px;line-height:1.6;color:#4E5D56;">
        Good news — your application to become an NTVS rider has been approved. You'll be contacted with next steps soon.
      </p>
      <p style="margin:18px 0 0;text-align:center;font-size:13.5px;color:#9AA8A0;">Thank you for applying to NTVS Delivery.</p>
    `
    : `
      <div style="text-align:center;margin-bottom:10px;">${statusBadge('rejected')}</div>
      <h2 style="margin:14px 0 6px;text-align:center;font-size:19px;font-weight:800;color:#10281C;">Application Update</h2>
      <p style="margin:0 0 16px;text-align:center;font-size:14.5px;line-height:1.6;color:#4E5D56;">
        Hi ${riderName}, thank you for applying to become an NTVS rider. After review, we're unable to approve your application at this time.
      </p>
      ${rejectionReason ? `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FDF2F3;border-radius:14px;border-left:4px solid #E5484D;margin-bottom:16px;">
        <tr>
          <td style="padding:14px 16px;">
            <span style="font-size:12px;font-weight:800;color:#C13239;">REASON</span><br/>
            <span style="font-size:14px;font-weight:600;color:#8A4145;">${rejectionReason}</span>
          </td>
        </tr>
      </table>` : ''}
      <p style="margin:0;text-align:center;font-size:13.5px;color:#9AA8A0;">If you believe this is a mistake, please contact the shop directly.</p>
    `;

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: riderEmail,
      subject,
      html: emailShell(body),
    });
  } catch (err) {
    console.error('Failed to send rider notification email:', err);
  }
}