import nodemailer from 'nodemailer';
 
class MailSender {
  constructor() {
    this._transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendOtpMail(email, otp) {
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: 'Kode OTP Anda',
      text: `Kode OTP Anda adalah: ${otp}. Berlaku selama 15 menit.`,
    };

    return await this._transporter.sendMail(mailOptions);
  }

  async sendNotificationPayment(email) {
    
  }
}

export default MailSender;
