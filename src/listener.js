class Listener {
    constructor(mailSender) {
      this._mailSender = mailSender;

      this.listenOtp = this.listenOtp.bind(this);
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
  }

export default Listener;
