import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import path from 'path';

class ReceiptService {
  constructor(usersService) {
    this._usersService = usersService;
  }

  async generateReceipt(fullname, paymentId) {
    const payment = await this._usersService.getPaymentById(paymentId);

    if (!payment) {
      throw new Error(`Payment ID ${paymentId} tidak ditemukan.`);
    }

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: '/snap/bin/chromium', // Menunjukkan lokasi Chromium yang benar
        timeout: 60000 // 60 detik
      });

      const page = await browser.newPage();

      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; }
              .receipt { border: 1px solid #ddd; padding: 10px; max-width: 400px; margin: auto; }
              h2 { margin-bottom: 5px; }
              p { margin: 5px 0; }
            </style>
          </head>
          <body>
            <div class="receipt">
              <h2>Struk Pembayaran</h2>
              <p><strong>ID Pembayaran:</strong> ${payment.id}</p>
              <p><strong>ID Rental:</strong> ${payment.rental_id}</p>
              <p><strong>Nama:</strong> ${fullname}</p>
              <p><strong>Jumlah:</strong> Rp${payment.amount.toLocaleString()}</p>
              <p><strong>Tanggal:</strong> ${new Date(payment.payment_date).toLocaleString()}</p>
              <p><strong>Metode Pembayaran:</strong> ${payment.payment_method}</p>
              <p><strong>Deskripsi:</strong> ${payment.transaction_description}</p>
              <p>Terima kasih telah bertransaksi!</p>
            </div>
          </body>
        </html>
      `;

      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      const receiptDir = path.resolve('./receipts');
      await fs.ensureDir(receiptDir);

      const filePath = path.join(receiptDir, `receipt-${paymentId}.pdf`);
      await page.pdf({ path: filePath, format: 'A6' });

      return filePath;
    } catch (error) {
      console.error('Gagal generate PDF:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

export default ReceiptService;
