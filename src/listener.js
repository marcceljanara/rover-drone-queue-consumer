class Listener {
    constructor(mailSender) {
      this._mailSender = mailSender;

      this.listenOtp = this.listenOtp.bind(this);
      this.listenPaymentsSuccess = this.listenPaymentsSuccess.bind(this);
      this.listenPaymentsFailed = this.listenPaymentsFailed.bind(this);
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
  }

export default Listener;
