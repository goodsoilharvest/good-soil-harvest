import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL ?? "Good Soil Harvest <noreply@goodsoilharvest.com>";
const SITE = process.env.NEXTAUTH_URL ?? "https://goodsoilharvest.com";

// ─── Verification email ───────────────────────────────────────────────────────

export async function sendVerificationEmail(email: string, code: string) {
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `${code} is your Good Soil Harvest verification code`,
    html: `
      <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:40px 24px;color:#2e1a0a;">
        <div style="text-align:center;margin-bottom:32px;">
          <span style="font-size:48px;">🌱</span>
          <h1 style="font-size:26px;font-weight:bold;margin:12px 0 4px;">Good Soil Harvest</h1>
          <p style="color:#6b4423;font-size:14px;margin:0;">Email verification</p>
        </div>

        <p style="font-size:15px;line-height:1.6;margin-bottom:24px;">
          Enter this code to verify your email and activate your account:
        </p>

        <div style="text-align:center;margin-bottom:32px;">
          <div style="display:inline-block;background:#f2ede2;border:2px solid #c4d9b4;border-radius:12px;padding:20px 40px;">
            <span style="font-size:40px;font-weight:bold;letter-spacing:10px;color:#2e1a0a;font-family:monospace;">
              ${code}
            </span>
          </div>
          <p style="font-size:13px;color:#6b4423;margin-top:12px;">Expires in 30 minutes</p>
        </div>

        <p style="font-size:12px;color:#9a7a5a;text-align:center;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

// ─── Contact form email ───────────────────────────────────────────────────────

export async function sendContactEmail({
  name,
  email,
  message,
}: {
  name: string;
  email: string;
  message: string;
}) {
  const to = process.env.CONTACT_TO_EMAIL ?? "goodsoilharvest@proton.me";

  return resend.emails.send({
    from: FROM,
    to,
    replyTo: email,
    subject: `Contact form: message from ${name}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:40px 24px;color:#2e1a0a;">
        <h2 style="font-size:20px;margin-bottom:4px;">New message from your contact form</h2>
        <p style="font-size:13px;color:#6b4423;margin-bottom:28px;border-bottom:1px solid #e2edd8;padding-bottom:16px;">Sent via goodsoilharvest.com</p>

        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#6b4423;width:80px;vertical-align:top;">Name</td>
            <td style="padding:8px 0;font-weight:600;">${name}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b4423;vertical-align:top;">Email</td>
            <td style="padding:8px 0;">
              <a href="mailto:${email}" style="color:#637f52;">${email}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b4423;vertical-align:top;">Message</td>
            <td style="padding:8px 0;line-height:1.6;white-space:pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>
          </tr>
        </table>

        <p style="font-size:12px;color:#9a7a5a;margin-top:32px;">Hit Reply to respond directly to ${name}.</p>
      </div>
    `,
  });
}

// ─── Welcome email (post-verification) ───────────────────────────────────────

export async function sendWelcomeEmail(email: string) {
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Welcome to Good Soil Harvest",
    html: `
      <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:40px 24px;color:#2e1a0a;">
        <div style="text-align:center;margin-bottom:32px;">
          <span style="font-size:48px;">🌱</span>
          <h1 style="font-size:26px;font-weight:bold;margin:12px 0 4px;">Welcome to Good Soil</h1>
          <p style="color:#6b4423;font-size:14px;margin:0;">Your account is verified and ready</p>
        </div>

        <p style="font-size:15px;line-height:1.6;margin-bottom:24px;">
          Thanks for joining Good Soil Harvest — a place to grow in faith, wisdom, and practical knowledge.
          Free articles are always available, and you can upgrade to a membership anytime to unlock everything.
        </p>

        <div style="text-align:center;margin-bottom:32px;">
          <a href="${SITE}/blog" style="display:inline-block;background:#637f52;color:#fff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:10px;text-decoration:none;">
            Start reading
          </a>
        </div>

        <p style="font-size:12px;color:#9a7a5a;text-align:center;">
          <a href="${SITE}/pricing" style="color:#637f52;">See membership plans</a> &nbsp;·&nbsp;
          <a href="${SITE}/contact" style="color:#637f52;">Contact us</a>
        </p>
      </div>
    `,
  });
}
