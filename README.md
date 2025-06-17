# D2L Service

Sistema distribuido con dos backends y comunicación en tiempo real mediante WebSocket y RabbitMQ.

## Arquitectura

El sistema consta de:
1. Backend principal (puerto 3000)
2. Servicio WebSocket dedicado (puerto 3010)
3. RabbitMQ para comunicación entre servicios
4. MongoDB para persistencia de datos

## Inicialización

1. Instalar dependencias:
```bash
# En el directorio raíz
npm install

# En el directorio del servicio WebSocket
cd services/wsservice
npm install
```

2. Iniciar los servicios con Docker:
```bash
docker-compose up --build
```

## Servicios disponibles

### Backend Principal (puerto 3000)
- API REST
- Autenticación
- Gestión de usuarios
- Integración con WebSocket y RabbitMQ

### Servicio WebSocket (puerto 3010)
- Conexiones WebSocket en tiempo real
- Salas de chat
- Sistema de notificaciones
- Integración con RabbitMQ

### RabbitMQ (puertos 5672, 15672)
- Puerto 5672: AMQP
- Puerto 15672: Panel de administración
- Credenciales: user/pass

### MongoDB (puerto 27017)
- Base de datos principal

## Uso del WebSocket

Ejemplo de conexión desde el cliente:
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3010');

// Unirse a una sala
socket.emit('join-room', 'room1');

// Enviar mensaje de chat
socket.emit('chat-message', {
    room: 'room1',
    message: 'Hola mundo'
});

// Escuchar mensajes
socket.on('chat-message', (message) => {
    console.log('Mensaje recibido:', message);
});

// Enviar notificación
socket.emit('notification', {
    type: 'user-action',
    payload: {
        userId: '123',
        action: 'login'
    }
});

// Escuchar notificaciones
socket.on('notification', (notification) => {
    console.log('Notificación recibida:', notification);
});
```
