import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';

/**
 * Send an email notification when a complaint's status changes.
 *
 * @param {Object} params
 * @param {string} params.toEmail      - Resident's email address
 * @param {string} params.toName       - Resident's name
 * @param {string} params.complaintId  - Complaint ID (for reference)
 * @param {string} params.category     - Complaint category
 * @param {string} params.fromStatus   - Previous status
 * @param {string} params.toStatus     - New status
 * @param {string} [params.note]       - Optional admin note
 */
export async function sendStatusChangeEmail({
  toEmail,
  toName,
  complaintId,
  category,
  fromStatus,
  toStatus,
  note,
}) {
  const subject = `Complaint Update: ${category} is now ${toStatus}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #4f46e5;">Society Maintenance Tracker</h2>
      <p>Dear <strong>${toName}</strong>,</p>
      <p>Your complaint regarding <strong>${category}</strong> has been updated.</p>
      <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
        <tr>
          <td style="padding:8px; border:1px solid #e5e7eb; background:#f9fafb;">Complaint ID</td>
          <td style="padding:8px; border:1px solid #e5e7eb;">${complaintId}</td>
        </tr>
        <tr>
          <td style="padding:8px; border:1px solid #e5e7eb; background:#f9fafb;">Status</td>
          <td style="padding:8px; border:1px solid #e5e7eb;">${fromStatus} → <strong>${toStatus}</strong></td>
        </tr>
        ${note ? `
        <tr>
          <td style="padding:8px; border:1px solid #e5e7eb; background:#f9fafb;">Admin Note</td>
          <td style="padding:8px; border:1px solid #e5e7eb;">${note}</td>
        </tr>` : ''}
      </table>
      <p style="color:#6b7280; font-size:13px;">
        If you have questions, please contact your society admin directly.
      </p>
    </div>
  `;

  try {
    await resend.emails.send({ from: FROM, to: toEmail, subject, html });
    console.log(`[Email] Status change sent to ${toEmail}`);
  } catch (err) {
    // Log but don't throw — email failure should not break the API response
    console.error('[Email] Failed to send status change email:', err.message);
  }
}

/**
 * Send an important-notice email to a list of recipients.
 *
 * @param {Object} params
 * @param {string[]} params.recipients   - Array of email addresses
 * @param {string}   params.noticeTitle  - Notice title
 * @param {string}   params.noticeBody   - Notice body text
 */
export async function sendImportantNoticeEmail({ recipients, noticeTitle, noticeBody }) {
  if (!recipients || recipients.length === 0) return;

  const subject = `📢 Important Notice: ${noticeTitle}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #dc2626;">📢 Important Society Notice</h2>
      <h3 style="color: #111827;">${noticeTitle}</h3>
      <p style="color:#374151; white-space: pre-wrap;">${noticeBody}</p>
      <hr style="border:none; border-top:1px solid #e5e7eb; margin: 24px 0;"/>
      <p style="color:#6b7280; font-size:13px;">
        This is an automated message from your Society Maintenance System.
      </p>
    </div>
  `;

  // Resend free tier sends to one recipient per call in most plans;
  // batch by iterating. For production, use Resend's batch endpoint.
  const promises = recipients.map((to) =>
    resend.emails.send({ from: FROM, to, subject, html }).catch((err) => {
      console.error(`[Email] Failed to send notice to ${to}:`, err.message);
    })
  );

  try {
    await Promise.all(promises);
    console.log(`[Email] Important notice sent to ${recipients.length} recipient(s)`);
  } catch (err) {
    console.error('[Email] Batch notice send failed:', err.message);
  }
}
