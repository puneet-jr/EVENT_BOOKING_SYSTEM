import nodemailer from 'nodemailer';

const createTransporter = async () => {
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

export const sendEmail = async (to, subject, text) => {
  try {
    const transporter = await createTransporter();
    const mailOptions = {
      from: 'admin@eventbooking.com',
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`[EMAIL SIMULATION] Sent to ${to}:`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text}`);
    console.log(`Ethereal Preview URL: ${nodemailer.getTestMessageUrl(info)}`);

    return true;
  } catch (error) {
    console.error(`[EMAIL SIMULATION ERROR] Failed to send to ${to}:`, error.message);
    return false;
  }
};
