// publisher.js
import amqp from 'amqplib';

const publish = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
  const channel = await connection.createChannel();

  const message = {
    to: 'refadonald@gmail.com',
    data: {
      fullname: 'Budi',
      rentalId: 'rental-001',
      endDate: '2025-06-20',
    },
  };

  // Ganti ini ke 'rental:awaitingreturn' untuk tes listener lain
  const queue = 'rental:awaitingreturn';

  await channel.assertQueue(queue, { durable: true });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  console.log(`✅ Sent message to queue "${queue}"`);

  setTimeout(() => {
    connection.close();
  }, 1000);
};

publish();
