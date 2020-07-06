import { SocketMessage, SocketMessageConnectedPeersId, SocketMessageOffer, SocketMessageAnswer, SocketMessageIceCandidate, parseSocketMessage } from './socket-message'

export const SOCKET_ROUTE = '/sessions/:sessionName?peerId=:peerId';

interface SocketApiConfig {
  baseUrl: string;
  sessionName: string;
  peerId: string;
}

type MessageListener<T extends SocketMessage> = (message: T) => unknown | Promise<unknown>

export class SocketApi {
  private websocket: WebSocket
  private keepAliveInterval: number | null

  constructor ({ baseUrl, sessionName, peerId }: SocketApiConfig) {
    this.keepAliveInterval = null

    const pathname = SOCKET_ROUTE
      .replace(':sessionName', sessionName)
      .replace(':peerId', peerId)
    this.websocket = new WebSocket(new URL(pathname, baseUrl).href)

    window.addEventListener('beforeunload', () => this.close())
    this.websocket.onopen = (): void => {
      this.keepAliveInterval = window.setInterval(() => this.send({ type: 'keep-alive' }), 1000 * 30) // every 30 seconds.
    }
    this.websocket.onclose = (): void => {
      if (this.keepAliveInterval) window.clearInterval(this.keepAliveInterval)
    }
  }

  public onConnectedPeersId (listener: MessageListener<SocketMessageConnectedPeersId>): void {
    this.onMessage((message) => {
      if (message.type === 'connected-peers-id') listener(message)
    })
  }

  public onOffer (listener: MessageListener<SocketMessageOffer>): void {
    this.onMessage((message) => {
      if (message.type === 'offer') listener(message)
    })
  }

  public onAnswer (listener: MessageListener<SocketMessageAnswer>): void {
    this.onMessage((message) => {
      if (message.type === 'answer') listener(message)
    })
  }

  public onIceCandidate (listener: MessageListener<SocketMessageIceCandidate>): void {
    this.onMessage((message) => {
      if (message.type === 'ice-candidate') listener(message)
    })
  }

  public close () {
    this.websocket.close()
  }
  
  public send (data: SocketMessage): void {
    this.websocket.send(JSON.stringify(data))
  }

  private onMessage (listener: MessageListener<SocketMessage>) {
    this.websocket.addEventListener('message', (event) => {
      const socketMessage = parseSocketMessage(event.data)
      listener(socketMessage)
    })
  }
}
