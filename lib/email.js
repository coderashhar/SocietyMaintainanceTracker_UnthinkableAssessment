import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';

export async function sendStatusChangeEmail({
  toEmail, toName, complaintId, category, fromStatus, toStatus, note,
}) {
  const subject = `Complaint Update: ${category} is now ${toStatus}`;
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;">
      <h2 style="color:#4f46e5;">Society Maintenance Tracker</h2>
      <p>Dear <strong>${toName}</strong>,</p>
      <p>Your complaint regarding <strong>${category}</strong> has been updated.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr>
          <td style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb;">Complaint ID</td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${complaintId}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb;">Status</td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${fromStatus} → <strong>${toStatus}</strong></td>
        </tr>
        ${note ? `<tr>
          <td style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb;">Admin Note</td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${note}</td>
        </tr>` : ''}
      </table>
      <p style="color:#6b7280;font-size:13px;">If you have questions, please contact your society admin.</p>
    </div>
  `;
  try {
    await resend.emails.send({ from: FROM, to: toEmail, subject, html });
  } catch (err) {
    console.error('[Email] Status change email failed:', err.message);
  }
}

export async function sendImportantNoticeEmail({ recipients, noticeTitle, noticeBody }) {
  if (!recipients?.length) return;
  const subject = `Important Notice: ${noticeTitle}`;
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;">
      <h2 style="color:#dc2626;">Important Society Notice</h2>
      <h3 style="color:#111827;">${noticeTitle}</h3>
      <p style="color:#374151;white-space:pre-wrap;">${noticeBody}</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
      <p style="color:#6b7280;font-size:13px;">This is an automated message from your Society Maintenance System.</p>
    </div>
  `;
  await Promise.all(
    recipients.map((to) =>
      resend.emails.send({ from: FROM, to, subject, html }).catch((err) =>
        console.error(`[Email] Failed to send notice to ${to}:`, err.message)
      )
    )
  );
}
