# Ping Pong Client Documentation

Este documento explica como implementar um client simples para verificar a disponibilidade da API Sankhya via WebSocket ping pong.

## Problemas Comuns e Soluções

### Erro 404 em /health

- **Sintoma**: `GET http://localhost:3000//health [HTTP/1.1 404 Not Found]`
- **Causa**: URL com barras duplas (`//health`).
- **Solução**: Corrija a URL para `/health` sem barra extra.

### WebSocket Não Conecta

- **Sintoma**: `Firefox não conseguiu estabelecer conexão ws://localhost:3000/socket.io/...`
- **Causa**: Servidor não rodando ou porta errada.
- **Solução**: Verifique se a API está rodando em `http://localhost:3000`. Use `pnpm start`.

## Implementação Simples

### Código do Client (React/TypeScript)

```tsx
import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

const HealthStatus = () => {
  const [status, setStatus] = useState<string>('Offline')
  const [version, setVersion] = useState<string>('')
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    // Conectar ao WebSocket (porta correta)
    const newSocket = io('http://localhost:3000') // Sem barra extra
    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('Socket connected')
      setStatus('Online')
      // Enviar ping
      console.log('Sent ping')
      newSocket.emit('ping')
    })

    newSocket.on('disconnect', () => {
      setStatus('Offline')
      setVersion('')
    })

    newSocket.on('pong', (data: any) => {
      console.log('Received pong:', data)
      setVersion(data.version || 'Unknown')
    })

    newSocket.on('heartbeat', (data: any) => {
      // Opcional: atualizar status com heartbeat
      setStatus('Online')
      setVersion(data.version || 'Unknown')
    })

    // Limpar on unmount
    return () => {
      newSocket.disconnect()
    }
  }, [])

  return (
    <div>
      <h3>API Health Status: {status}</h3>
      {version && <p>Version: {version}</p>}
    </div>
  )
}

export default HealthStatus
```

### Como Usar

1. Instale `socket.io-client`: `npm install socket.io-client`.
2. Use o componente em seu app React.
3. O status muda para "Online" ao conectar e receber pong/heartbeat.
4. Versão é exibida se disponível.

### Verificação Manual

- **HTTP Health Check**: `curl http://localhost:3000/health` (deve retornar 200).
- **WebSocket Ping**: Conecte e envie 'ping' via dev tools.

### Logs Esperados no Backend

- `Client connected: [id] (Visitante)`
- `Received pong response`

Se ainda houver problemas, verifique se a API está rodando e a porta está correta.
