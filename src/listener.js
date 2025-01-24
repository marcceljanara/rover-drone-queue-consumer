class Listener {
    constructor(mailSender, usersService) {
      this._mailSender = mailSender;
      this._usersService = usersService;

      this.listenOtp = this.listenOtp.bind(this);
      this.listenPaymentsSuccess = this.listenPaymentsSuccess.bind(this);
      this.listenPaymentsFailed = this.listenPaymentsFailed.bind(this);
      this.listenRentalRequest = this.listenRentalRequest.bind(this);
      this.listenRentalPayment = this.listenRentalPayment.bind(this);
    }
   
    async listenOtp(message) {
      try {
        const { otp, email } = JSON.parse(message.content.toString());
        const result = await this._mailSender.sendOtpMail(email, otp);
        console.log(result);
      } catch (error) {
        console.error(error);
      }
    }

    async listenPaymentsSuccess(message) {
      try {
        const { email, fullname } = JSON.parse(message.content.toString());
        const result = await this._mailSender.sendNotificationPaymentSuccess(email, fullname);
        console.log(result);
      } catch (error) {
        console.error(error);
      }
    }
    
    async listenPaymentsFailed(message) {
      try {
        const { email, fullname, rentalId } = JSON.parse(message.content.toString());
        const result = await this._mailSender.sendNotificationPaymentFailed(email, fullname, rentalId);
        console.log(result);
      } catch (error) {
        console.error(error);
      }
    }

    async listenRentalRequest(message) {
      try {
        const { userId, rentalId, paymentId, cost, startDate, endDate } = JSON.parse(message.content.toString());
        const emailsDb = await this._usersService.getAllEmailAdmin();
        const result = await this._mailSender.sendNotificationRentalRequest(userId, rentalId, paymentId, cost, startDate, endDate, emailsDb);
        console.log(result);
      } catch (error) {
        console.log(error);
      }
    }
    
    async listenRentalPayment(message) {
      try {
        const { userId, rentalId, paymentId, cost, startDate, endDate } = JSON.parse(message.content.toString());
        const email = await this._usersService.getEmailUser(userId);
        const result = await this._mailSender.sendNotificationRentalPaymentToUser(userId, rentalId, paymentId, cost, startDate, endDate, email);
        console.log(result);
      } catch (error) {
        console.log(error);
      }
    }
  }

export default Listener;
