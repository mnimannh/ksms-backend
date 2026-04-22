import nodemailer from 'nodemailer';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const sendResetPasswordEmail = async ({ to, fullName, token }) => {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: 'Reset Your KSMS Password',
    html: `
      <div style="font-family:'DM Sans',Arial,sans-serif;max-width:520px;margin:0 auto;background:#f8fafc;border-radius:12px;overflow:hidden;">
        <div style="background:#0f172a;padding:28px 32px;">
          <p style="margin:0;font-size:22px;font-weight:700;color:#f1f5f9;letter-spacing:.08em;">K S M S</p>
          <p style="margin:4px 0 0;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.1em;">Koperasi KVSA</p>
        </div>
        <div style="padding:32px;">
          <p style="font-size:15px;color:#0f172a;margin:0 0 8px;">Hi <strong>${fullName}</strong>,</p>
          <p style="font-size:14px;color:#475569;margin:0 0 24px;line-height:1.6;">
            We received a request to reset your KSMS password. Click the button below to set a new one.
          </p>
          <div style="text-align:center;margin-bottom:24px;">
            <a href="${resetUrl}" style="display:inline-block;background:#111827;color:#fff;font-family:'DM Sans',Arial,sans-serif;font-size:14px;font-weight:600;text-decoration:none;padding:13px 28px;border-radius:10px;letter-spacing:.01em;">Reset Password</a>
          </div>
          <p style="font-size:13px;color:#94a3b8;margin:0 0 8px;line-height:1.6;">
            This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.
          </p>
          <p style="font-size:12px;color:#cbd5e1;margin:0;word-break:break-all;">
            Or copy this link: <a href="${resetUrl}" style="color:#3b82f6;">${resetUrl}</a>
          </p>
        </div>
        <div style="padding:16px 32px;border-top:1px solid #f1f5f9;">
          <p style="margin:0;font-size:11px;color:#cbd5e1;">This email was sent automatically by KSMS. Do not reply.</p>
        </div>
      </div>
    `,
  });
};

export const sendTempPasswordEmail = async ({ to, fullName, tempPassword }) => {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: 'Your KSMS Account Has Been Created',
    html: `
      <div style="font-family:'DM Sans',Arial,sans-serif;max-width:520px;margin:0 auto;background:#f8fafc;border-radius:12px;overflow:hidden;">
        <div style="background:#0f172a;padding:28px 32px;">
          <p style="margin:0;font-size:22px;font-weight:700;color:#f1f5f9;letter-spacing:.08em;">K S M S</p>
          <p style="margin:4px 0 0;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.1em;">Koperasi KVSA</p>
        </div>
        <div style="padding:32px;">
          <p style="font-size:15px;color:#0f172a;margin:0 0 8px;">Hi <strong>${fullName}</strong>,</p>
          <p style="font-size:14px;color:#475569;margin:0 0 24px;line-height:1.6;">
            Your KSMS staff account has been created by an administrator. Use the temporary password below to log in for the first time.
          </p>
          <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:20px 24px;text-align:center;margin-bottom:24px;">
            <p style="margin:0 0 6px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.1em;">Temporary Password</p>
            <p style="margin:0;font-family:'Courier New',monospace;font-size:26px;font-weight:700;color:#6366f1;letter-spacing:.12em;">${tempPassword}</p>
          </div>
          <p style="font-size:13px;color:#94a3b8;margin:0;line-height:1.6;">
            Please keep this password safe. You may be asked to update it after your first login.
          </p>
        </div>
        <div style="padding:16px 32px;border-top:1px solid #f1f5f9;">
          <p style="margin:0;font-size:11px;color:#cbd5e1;">This email was sent automatically by KSMS. Do not reply.</p>
        </div>
      </div>
    `,
  });
};
