class Listener {
  constructor(mailSender, usersService, notificationsService, receiptService) {
    this._mailSender = mailSender;
    this._usersService = usersService;
    this._notificationsService = notificationsService;
    this._receiptService = receiptService;

    this.listenOtp = this.listenOtp.bind(this);
    this.listenPaymentsSuccess = this.listenPaymentsSuccess.bind(this);
    this.listenPaymentsFailed = this.listenPaymentsFailed.bind(this);
    this.listenRentalRequest = this.listenRentalRequest.bind(this);
    this.listenRentalPayment = this.listenRentalPayment.bind(this);
  }

  async listenOtp(message) {
    try {
      const { otp, email } = JSON.parse(message.content.toString());
      const id = await this._usersService.getUserId(email);
      await this._notificationsService.addLogNotification(
        {
          userId: id,
          notificationType: 'INFO',
          messageContent: `Mengirimkan kode otp ke email: ${email}`,
        },
      );
      const result = await this._mailSender.sendOtpMail(email, otp);
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }

  async listenPaymentsSuccess(message) {
    try {
      const {
        email, fullname, userId, paymentId,
      } = JSON.parse(message.content.toString());

      await this._notificationsService.addLogNotification({
        userId,
        notificationType: 'INFO',
        messageContent: `Mengirimkan notifikasi pembayaran sukses kepada ${fullname} dengan email: ${email}`,
      });

      // Generate struk pembayaran dengan data lengkap
      const pdfPath = await this._receiptService.generateReceipt(fullname, paymentId);

      // Kirim email dengan lampiran struk PDF
      const result = await this._mailSender.sendNotificationPaymentSuccess(email, fullname, pdfPath);

      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }

  async listenPaymentsFailed(message) {
    try {
      const { email, fullname, rentalId } = JSON.parse(message.content.toString());
      const result = await this._mailSender.sendNotificationPaymentFailed(email, fullname, rentalId);
      const id = await this._usersService.getUserId(email);
      await this._notificationsService.addLogNotification(
        {
          userId: id,
          notificationType: 'ERROR',
          messageContent: `Mengirimkan notifikasi pembayaran gagal kepada ${fullname} dengan email: ${email} pada rental: ${rentalId}`,
        },
      );
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }

  async listenRentalRequest(message) {
    try {
      const {
        userId, rentalId, paymentId, cost, startDate, endDate,
      } = JSON.parse(message.content.toString());
      const emailsDb = await this._usersService.getAllEmailAdmin();
      const result = await this._mailSender.sendNotificationRentalRequest(userId, rentalId, paymentId, cost, startDate, endDate, emailsDb);
      await this._notificationsService.addLogNotification(
        {
          userId,
          notificationType: 'INFO',
          messageContent: 'Mengirimkan notifikasi permintaan rental kepada admin agar bisa diproses',
        },
      );
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  }

  async listenRentalPayment(message) {
    try {
      const {
        userId, rentalId, paymentId, cost, startDate, endDate,
      } = JSON.parse(message.content.toString());
      const email = await this._usersService.getEmailUser(userId);
      await this._notificationsService.addLogNotification(
        {
          userId,
          notificationType: 'INFO',
          messageContent: `Mengirimkan notifikasi permintaan pembayaran ${paymentId} pada penyewaan ${rentalId} dengan biaya ${cost} kepada pengguna`,
        },
      );
      const result = await this._mailSender.sendNotificationRentalPaymentToUser(userId, rentalId, paymentId, cost, startDate, endDate, email);
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  }
}

export default Listener;
