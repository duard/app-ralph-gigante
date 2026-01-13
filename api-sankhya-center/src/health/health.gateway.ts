import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common'

const API_VERSION = '1.0.0'

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class HealthGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer() server: Server
  private logger: Logger = new Logger('HealthGateway')

  afterInit() {
    this.logger.log('Health WebSocket Gateway initialized')
    this.startHeartbeat()
  }

  handleConnection(client: Socket) {
    this.logger.log(
      `Client connected: ${client.id} (Visitante - sem autenticação)`,
    )
    client.emit('status', {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: API_VERSION,
    })
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`)
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket) {
    client.emit('pong', {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: API_VERSION,
    })
  }

  // Heartbeat to keep connection alive and verify status
  startHeartbeat() {
    setInterval(() => {
      this.server.emit('heartbeat', {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: API_VERSION,
      })
    }, 5000)
  }
}
