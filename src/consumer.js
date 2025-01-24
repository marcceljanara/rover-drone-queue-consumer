import dotenv from 'dotenv';
import amqp from 'amqplib';
import Listener from './listener.js';
import MailSender from './MailSender.js';
import UsersService from './UsersService.js';

dotenv.config();

const init = async () => {
    const mailSenser = new MailSender();
    const usersService = new UsersService();
    const listener = new Listener(mailSenser, usersService);

    const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
    const channel = await connection.createChannel();
    await channel.assertQueue('otp:register', {
        durable: true,
      });
    await channel.assertQueue('payment:success', {
      durable: true,
    });
    await channel.assertQueue('payment:failed', {
      durable: true,
    });
    await channel.assertQueue('rental:request', {
      durable: true,
    });
    await channel.assertQueue('rental:payment', {
      durable: true,
    });
    channel.consume('otp:register', listener.listenOtp, { noAck: true });
    channel.consume('payment:success', listener.listenPaymentsSuccess, { noAck: true });
    channel.consume('payment:failed', listener.listenPaymentsFailed, { noAck: true });
    channel.consume('rental:request', listener.listenRentalRequest, { noAck: true });
    channel.consume('rental:payment', listener.listenRentalPayment, { noAck: true });
}

init();