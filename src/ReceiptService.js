import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import path from 'path';

class ReceiptService {
  constructor(usersService) {
    this._usersService = usersService;
  }

  async generateReceipt(fullname, paymentId) {
    // Ambil data pembayaran dari database
    const payment = await this._usersService.getPaymentById(paymentId);

    if (!payment) {
      throw new Error(`Payment ID ${paymentId} tidak ditemukan.`);
    }

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: 60000 // Menambah waktu timeout 1 menit
    });
    
    const page = await browser.newPage();

    // HTML template untuk struk PDF
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

    await page.setContent(htmlContent);

    const receiptDir = path.resolve('./receipts');
    await fs.ensureDir(receiptDir); // Pastikan folder receipts ada

    const filePath = path.join(receiptDir, `receipt-${paymentId}.pdf`);
    await page.pdf({ path: filePath, format: 'A6' });

    await browser.close();
    return filePath;
  }
}

export default ReceiptService;
