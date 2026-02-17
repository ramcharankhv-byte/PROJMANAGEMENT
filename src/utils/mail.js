import mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  const mailGenerator = new mailgen({
    theme: "default",
    product: {
      name: "TASK MANAGER",
      link: "https://taskmanagerlink.com",
    },
  });
  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
  const emailHtml = mailGenerator.generate(options.mailgenContent);

  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: Number(process.env.MAILTRAP_SMTP_PORT),
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASS,
    },
  });

  const mail = {
    from: "mail.taskmanager@<your_domain>",
    to: options.email,
    subject: options.subject,
    text: emailTextual,
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mail);
  } catch (err) {
    console.error("Email service failed silently", err);
  }
};
const emailVerificationMailgenContent = (username, verifyUrl) => {
  return {
    body: {
      name: username,
      intro: "Welcome to our App! We're very excited to have you on board.",
      action: {
        instructions: "To get started with your account, please click here:",
        button: {
          color: "#22BC66",
          text: "Verify your account",
          link: verifyUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email we'd love to help.",
    },
  };
};
const forgotpassMailgenContent = (username, verifyUrl) => {
  return {
    body: {
      name: username,
      intro: "You have requested a password reset.",
      action: {
        instructions: "To reset your password, please click here:",
        button: {
          color: "#22BC66",
          text: "Reset your password",
          link: verifyUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email we'd love to help.",
    },
  };
};

export { sendEmail, emailVerificationMailgenContent, forgotpassMailgenContent };
