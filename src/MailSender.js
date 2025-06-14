import nodemailer from 'nodemailer';
import fs from 'fs-extra';

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

    return this._transporter.sendMail(mailOptions);
  }

  async sendNotificationPaymentSuccess(email, fullname, pdfPath) {
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
      attachments: [
        {
          filename: 'Struk-Pembayaran.pdf',
          path: pdfPath,
        },
      ],
    };

    const result = await this._transporter.sendMail(mailOptions);

    // Hapus file PDF setelah email dikirim
    await fs.unlink(pdfPath);

    return result;
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
    return this._transporter.sendMail(mailOptions);
  }

  async sendNotificationRentalRequest(
    userId,
    rentalId,
    paymentId,
    cost,
    startDate,
    endDate,
    emailsDb,
  ) {
    const emails = emailsDb.map((row) => row.email);
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: emails.join(','), // Menggabungkan array emails menjadi string yang dipisahkan koma
      subject: `Permohonan Penyewaan dari User ${userId}`,
      text: `
      Halo,

      User dengan ID ${userId} telah mengajukan permohonan penyewaan dengan detail sebagai berikut:

      - ID Penyewaan: ${rentalId}
      - ID Pembayaran: ${paymentId}
      - Biaya: Rp${cost.toLocaleString('id-ID')}
      - Tanggal Mulai: ${startDate}
      - Tanggal Selesai: ${endDate}

      Mohon untuk segera meninjau permohonan ini. Terima kasih.

      Salam,
      Sistem Otomasi
    `,
    };
    return this._transporter.sendMail(mailOptions);
  }

  async sendNotificationRentalPaymentToUser(
    userId,
    rentalId,
    paymentId,
    cost,
    startDate,
    endDate,
    email,
  ) {
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: `Segera Lakukan Pembayaran untuk Rental ID ${rentalId}`,
      text: `
  Halo,
  
  Kami ingin menginformasikan bahwa permohonan rental Anda dengan detail sebagai berikut:
  
  - Rental ID: ${rentalId}
  - Payment ID: ${paymentId}
  - Biaya: Rp${cost.toLocaleString('id-ID')}
  - Tanggal Mulai: ${startDate}
  - Tanggal Selesai: ${endDate}
  
  Harap segera melakukan pembayaran untuk menyelesaikan proses rental Anda. Berikut adalah informasi rekening untuk pembayaran:
  
  Rekening Bank:
  - BNI: 1234567890 (a.n. PT Rental Indonesia)
  - BRI: 9876543210 (a.n. PT Rental Indonesia)
  - BCA: 1122334455 (a.n. PT Rental Indonesia)
  
  Pastikan untuk mencantumkan Payment ID sebagai berita transfer untuk mempermudah proses verifikasi.


  
  Jika Anda memerlukan bantuan atau ingin melakukan verifikasi bukti pembayaran, silakan hubungi kami melalui email di inengahmarcceljbc@gmail.com.
  
  Terima kasih,
  Tim Rental
      `,
    };
    return this._transporter.sendMail(mailOptions);
  }

  async sendNotificationExtensionRequest(
    id,
    userId,
    rentalId,
    paymentId,
    cost,
    addedDuration,
    newEndDate,
    emailsDb,
  ) {
    const formattedEndDate = new Date(newEndDate).toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long', // misalnya: Senin
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const emails = emailsDb.map((row) => row.email);
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: emails.join(','), // Gabungkan email admin atau pihak terkait
      subject: `Permohonan Perpanjangan Penyewaan dari User ${userId}`,
      text: `
      Halo,

      User dengan ID ${userId} telah mengajukan perpanjangan penyewaan dengan detail sebagai berikut:

      - ID Perpanjangan ${id}
      - ID Penyewaan: ${rentalId}
      - ID Pembayaran: ${paymentId}
      - Biaya Tambahan: ${cost}
      - Durasi Tambahan: ${addedDuration} bulan
      - Tanggal Selesai Baru: ${formattedEndDate}

      Mohon untuk segera meninjau permohonan perpanjangan ini. Terima kasih.

      Salam,
      Sistem Otomasi
    `,
    };
    return this._transporter.sendMail(mailOptions);
  }

  async sendNotificationExtensionPaymentToUser(
    userId,
    rentalId,
    extensionId,
    paymentId,
    cost,
    endDate,
    addedDuration,
    email,
  ) {
    const formattedEndDate = new Date(endDate).toLocaleDateString('id-ID', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: `Segera Lakukan Pembayaran Perpanjangan untuk Rental ID ${rentalId}`,
      text: `
      Halo,

      Kami ingin menginformasikan bahwa permohonan *perpanjangan* rental Anda telah diterima dengan detail sebagai berikut:

      - Rental ID: ${rentalId}
      - Extension ID: ${extensionId}
      - Payment ID: ${paymentId}
      - Biaya Tambahan: Rp${cost.toLocaleString('id-ID')}
      - Durasi Tambahan: ${addedDuration} bulan
      - Tanggal Selesai Baru: ${formattedEndDate}

      Harap segera melakukan pembayaran untuk melanjutkan penyewaan. Berikut informasi rekening:

      Rekening Bank:
      - BNI: 1234567890 (a.n. PT Rental Indonesia)
      - BRI: 9876543210 (a.n. PT Rental Indonesia)
      - BCA: 1122334455 (a.n. PT Rental Indonesia)

      Pastikan mencantumkan Payment ID sebagai berita transfer untuk mempermudah proses verifikasi.

      Jika Anda butuh bantuan atau ingin melakukan verifikasi bukti pembayaran, silakan hubungi kami di inengahmarcceljbc@gmail.com.

      Terima kasih,
      Tim Rental
    `,
    };

    return this._transporter.sendMail(mailOptions);
  }

  async sendNotificationShipmentStatusToUser(shipmentId, email, status, fullname) {
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: `Status Pengiriman ${shipmentId}: ${status}`,
      text: `
      Halo ${fullname},

      Kami ingin memberi tahu bahwa status terbaru untuk pengiriman Anda telah diperbarui.

      -----------------------------------------
      ID Pengiriman   : ${shipmentId}
      Nama Penerima   : ${fullname}
      Status Terkini  : ${status.toUpperCase()}
      -----------------------------------------

      Silakan pantau terus status pengiriman Anda. Jika Anda membutuhkan bantuan lebih lanjut, jangan ragu untuk menghubungi kami melalui email ini.

      Terima kasih telah menggunakan layanan kami.

      Hormat kami,  
      Tim Support
          `,
    };

    return this._transporter.sendMail(mailOptions);
  }

  async sendNotificationRentalAlmostEnd(email, fullname, rentalId, endDate) {
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: `Masa Sewa Perangkat Akan Berakhir (${rentalId})`,
      text: `
      Halo ${fullname},

      Kami ingin mengingatkan bahwa masa sewa perangkat Anda akan segera berakhir.

      -----------------------------------------
      Nama Pengguna : ${fullname}
      Rental ID     : ${rentalId}
      Tanggal Berakhir: ${new Date(endDate).toLocaleDateString('id-ID')}
      -----------------------------------------

      Silakan perpanjang masa sewa Anda jika masih ingin menggunakan perangkat ini. Jika tidak diperpanjang, perangkat akan dijadwalkan untuk dikembalikan.

      Terima kasih telah menggunakan layanan kami.

      Hormat kami,  
      Tim Support
          `,
    };

    return this._transporter.sendMail(mailOptions);
  }

  async sendNotificationRentalAwaitingReturn(email, fullname, rentalId, endDate) {
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: `Masa Sewa Telah Selesai - Rental ID ${rentalId}`,
      text: `
    Halo ${fullname},

    Kami ingin memberitahukan bahwa masa sewa perangkat Anda telah berakhir pada:

    -----------------------------------------
    Nama Pengguna : ${fullname}
    Rental ID     : ${rentalId}
    Tanggal Berakhir: ${new Date(endDate).toLocaleDateString('id-ID')}
    Status Rental : Menunggu Pengembalian
    -----------------------------------------

    📦 Perangkat Anda dijadwalkan untuk diambil oleh petugas dalam waktu dekat.

    🕒 Anda memiliki waktu 2 hari sejak email ini dikirimkan untuk memperbarui alamat pengambilan perangkat jika diperlukan.  
    Jika Anda tidak melakukan perubahan dalam waktu tersebut, maka sistem akan otomatis menggunakan alamat utama yang terdaftar pada akun Anda.

    Untuk bantuan lebih lanjut, silakan hubungi tim support kami melalui email ini.

    Terima kasih telah menggunakan layanan kami.

    Hormat kami,  
    Tim Support
        `,
    };

    return this._transporter.sendMail(mailOptions);
  }
}

export default MailSender;
