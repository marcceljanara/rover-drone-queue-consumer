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

  async sendNotificationPaymentSuccess(email, fullname) {
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: 'Pembayaran Berhasil Terverifikasi',
      text: `
      Halo ${fullname},
      
      Kami dengan senang hati menginformasikan bahwa pembayaran Anda telah berhasil diverifikasi. Berikut adalah detail transaksi Anda:

      -----------------------------------------
      Nama Pengguna: ${fullname}
      Status Pembayaran: Berhasil
      -----------------------------------------

      Terima kasih telah menggunakan layanan kami! Jika Anda memiliki pertanyaan atau memerlukan bantuan lebih lanjut, jangan ragu untuk menghubungi kami melalui email ini.

      Hormat kami,
      Tim Support
    `,
    };
    return await this._transporter.sendMail(mailOptions);
  }

  async sendNotificationPaymentFailed(email, fullname, rentalId) {
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: `Pembayaran untuk Rental ID ${rentalId} Gagal`,
      text: `
      Halo ${fullname},

      Kami ingin memberitahukan Anda bahwa pembayaran untuk rental ID ${rentalId} tidak berhasil. Dengan ini, status rental Anda telah dibatalkan.

      -----------------------------------------
      Nama Pengguna    : ${fullname}
      Status Rental    : Dibatalkan
      Status Pembayaran: Gagal
      Rental ID        : ${rentalId}
      -----------------------------------------

      Kami memahami bahwa ini mungkin menimbulkan ketidaknyamanan, dan kami ingin membantu Anda menyelesaikan masalah ini. Jika Anda memiliki pertanyaan atau membutuhkan bantuan lebih lanjut, jangan ragu untuk menghubungi kami melalui email ini.

      Terima kasih telah menggunakan layanan kami.

      Hormat kami,
      Tim Support
      `,
    };
    return await this._transporter.sendMail(mailOptions);
}

}

export default MailSender;
