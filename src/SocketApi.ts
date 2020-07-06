import { SocketMessage, SocketMessageConnectedPeersId, SocketMessageOffer, SocketMessageAnswer, SocketMessageIceCandidate, parseSocketMessage } from './socket-message'

export const SOCKET_ROUTE = '/sessions/:sessionName?peerId=:peerId';

interface SocketApiConfig {
  baseUrl: string;
  sessionName: string;
  peerId: string;
}

type MessageListener<T extends SocketMessage> = (event: CustomEvent<T>) => unknown | Promise<unknown>

export class SocketApi extends EventTarget {
  private websocket: WebSocket
  private keepAliveInterval: number | null

  constructor ({ baseUrl, sessionName, peerId }: SocketApiConfig) {
    super()
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

    this.websocket.addEventListener('message', (event) => {
      const socketMessage = parseSocketMessage(event.data)
      if (socketMessage.type !== 'keep-alive') {
        this.dispatchEvent(new CustomEvent(socketMessage.type, { detail: socketMessage }))
      }
    })
  }

  public close () {
    this.websocket.close()
  }
  
  public send (data: SocketMessage): void {
    this.websocket.send(JSON.stringify(data))
  }
}

export interface SocketApi extends EventTarget {
  addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void
  dispatchEvent(event: Event): boolean
  removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean): void;
  
  addEventListener (type: SocketMessageConnectedPeersId['type'], listener: MessageListener<SocketMessageConnectedPeersId>): void;
  removeEventListener (type: SocketMessageConnectedPeersId['type'], listener: MessageListener<SocketMessageConnectedPeersId>): void;
  dispatchEvent (event: CustomEvent<SocketMessageConnectedPeersId>): void;

  addEventListener (type: SocketMessageOffer['type'], listener: MessageListener<SocketMessageOffer>): void;
  removeEventListener (type: SocketMessageOffer['type'], listener: MessageListener<SocketMessageOffer>): void;
  dispatchEvent (event: CustomEvent<SocketMessageOffer>): void;

  addEventListener (type: SocketMessageAnswer['type'], listener: MessageListener<SocketMessageAnswer>): void;
  removeEventListener (type: SocketMessageAnswer['type'], listener: MessageListener<SocketMessageAnswer>): void;
  dispatchEvent (event: CustomEvent<SocketMessageAnswer>): void;

  addEventListener (type: SocketMessageIceCandidate['type'], listener: MessageListener<SocketMessageIceCandidate>): void;
  removeEventListener (type: SocketMessageIceCandidate['type'], listener: MessageListener<SocketMessageIceCandidate>): void;
  dispatchEvent (event: CustomEvent<SocketMessageIceCandidate>): void;
}
