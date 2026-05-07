const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendEmail = async ({ to, subject, html }) => {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
};

exports.sendVerificationEmail = async ({ to, name, token }) => {
  const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  return exports.sendEmail({
    to,
    subject: "Verify your International Talent Space Station account",
    html: `
      <h2>Hello ${name || "there"},</h2>
      <p>Thank you for creating an account with International Talent Space Station.</p>
      <p>Please verify your email address by clicking the button below:</p>
      <p>
        <a href="${url}" style="background:#2563eb;color:white;padding:12px 18px;border-radius:8px;text-decoration:none;">
          Verify Email
        </a>
      </p>
      <p>If the button does not work, copy this link:</p>
      <p>${url}</p>
    `,
  });
};

exports.sendPasswordResetEmail = async ({ to, name, token }) => {
  const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  return exports.sendEmail({
    to,
    subject: "Reset your International Talent Space Station password",
    html: `
      <h2>Hello ${name || "there"},</h2>
      <p>You requested a password reset.</p>
      <p>Click below to create a new password:</p>
      <p>
        <a href="${url}" style="background:#2563eb;color:white;padding:12px 18px;border-radius:8px;text-decoration:none;">
          Reset Password
        </a>
      </p>
      <p>If you did not request this, you can ignore this email.</p>
      <p>${url}</p>
    `,
  });
};