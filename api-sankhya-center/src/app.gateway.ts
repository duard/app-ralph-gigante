import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common'

@WebSocketGateway({
  cors: {
    origin: '*', // Permitir todas as origens para facilitar dev
  },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(AppGateway.name)
  private connectedUsers = new Map<string, any>() // socketId -> user

  constructor() {}

  async handleConnection(client: Socket) {
    const token =
      (client.handshake.query.token as string) || client.handshake.auth?.token

    if (token) {
      // Se token fornecido, tentar validar como JWT Sankhya
      try {
        // Decodificar payload do JWT sem verificar assinatura
        const parts = token.split('.')
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())

          // Verificar expiração
          if (payload.exp && payload.exp * 1000 > Date.now()) {
            this.connectedUsers.set(client.id, payload)
            this.logger.log(
              `Client connected: ${client.id}, User: ${payload.username || payload.sub}`,
            )
            this.server.emit('api-status', {
              status: 'online',
              timestamp: new Date(),
              user: payload.username || payload.sub,
            })
            return
          }
        }

        // Token inválido ou expirado
        this.logger.warn(
          `Client ${client.id} conectou com token inválido/expirado`,
        )
      } catch (error) {
        this.logger.warn(`Client ${client.id} conectou com token mal formatado`)
      }
    }

    // Sem token válido: visitante
    this.logger.log(`Client connected: ${client.id} (Visitante)`)
    this.server.emit('api-status', {
      status: 'online',
      timestamp: new Date(),
    })
  }

  handleDisconnect(client: Socket) {
    const user = this.connectedUsers.get(client.id)
    this.logger.log(
      `Client disconnected: ${client.id}, User: ${user?.username || user?.sub || 'Visitante'}`,
    )
    this.connectedUsers.delete(client.id)
  }

  // Método para obter usuários conectados
  getConnectedUsers(): Map<string, any> {
    return this.connectedUsers
  }

  // Opcional: Heartbeat
  afterInit() {
    setInterval(() => {
      this.server.emit('api-status', {
        status: 'online',
        timestamp: new Date(),
      })
    }, 5000)
  }
}
