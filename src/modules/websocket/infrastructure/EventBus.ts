import { Channel, connect, ChannelModel } from 'amqplib';

export class EventBus {
  private connection!: ChannelModel;
  private channel!: Channel;
  private static instance: EventBus;

  private constructor() {}

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  async connect(url: string) {
    this.connection = await connect(url);
    this.channel = await this.connection.createChannel();
  }

  async publish(exchange: string, routingKey: string, message: any) {
    // Aseguramos que el exchange existe
    await this.channel.assertExchange(exchange, 'topic', { durable: false });
    
    // Publicamos el mensaje
    this.channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(message))
    );
  }

  async subscribe(exchange: string, routingKey: string, onMessage: (msg: any) => void) {
    // Aseguramos que el exchange existe
    await this.channel.assertExchange(exchange, 'topic', { durable: false });
    
    // Creamos una cola exclusiva y temporal
    const { queue } = await this.channel.assertQueue('', {
      exclusive: true,
      autoDelete: true
    });

    // Bindeamos la cola al exchange con el routing key
    await this.channel.bindQueue(queue, exchange, routingKey);

    // Consumimos los mensajes
    this.channel.consume(queue, (msg) => {
      if (msg) {
        const content = JSON.parse(msg.content.toString());
        onMessage(content);
        this.channel.ack(msg);
      }
    });
  }

  async close() {
    await this.channel?.close();
    await this.connection?.close();
  }
}