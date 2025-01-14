import dotenv from 'dotenv';
import amqp from 'amqplib';
import Listener from './listener.js';
import MailSender from './MailSender.js';

dotenv.config();

const init = async () => {
    const mailSenser = new MailSender();
    const listener = new Listener(mailSenser);

    const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
    const channel = await connection.createChannel();
    await channel.assertQueue('otp:register', {
        durable: true,
      });

    channel.consume('otp:register', listener.listenOtp, { noAck: true })
}

init();