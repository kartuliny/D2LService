import { Channel, connect, Connection, ChannelModel } from 'amqplib';

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
        await this.channel.assertExchange(exchange, 'topic', { durable: false });
        
        this.channel.publish(
            exchange,
            routingKey,
            Buffer.from(JSON.stringify(message))
        );
    }

    async subscribe(exchange: string, routingKey: string, onMessage: (msg: any) => void) {
        await this.channel.assertExchange(exchange, 'topic', { durable: false });
        
        const { queue } = await this.channel.assertQueue('', {
            exclusive: true,
            autoDelete: true
        });

        await this.channel.bindQueue(queue, exchange, routingKey);

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