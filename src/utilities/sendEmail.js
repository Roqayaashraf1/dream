import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, message }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // You can use other services like SendGrid, Mailgun, etc.
    auth: {
      user: "roqayaashraf25@gmail.com", // Replace with your email
      pass: "xsht ktaj gajl hctq", // Replace with your email password or an app-specific password
    },
  });

  const mailOptions = {
    from: "roqayaashraf25@gmail.com", // Replace with your email
    to,
    subject,
    html: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

export default sendEmail;
