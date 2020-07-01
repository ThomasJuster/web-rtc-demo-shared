import { SocketMessage } from './socket-message'

export const API_ROUTES = {
  createSession: { method: 'PUT', pathname: '/sessions/{sessionName}', query: 'password' },
  joinSession: { method: 'PATCH', pathname: '/sessions/{sessionName}', query: 'password' },
  sessionExists: { method: 'GET', pathname: '/sessions/{sessionName}', query: undefined },
}

export const SOCKET_ROUTE = '/sessions/{sessionName}?peerId={peerId}';

interface ServerAPIConfig {
  url?: string;
}

export class ServerAPI {
  public origin: string;
  constructor (config: ServerAPIConfig = {}) {
    this.origin = new URL(config.url || 'http://localhost:4321').origin;
  }

  public async createSession (sessionName: string, password?: string): Promise<Response> {
    const { pathname, method } = API_ROUTES.createSession
    const url = new URL(pathname.replace('{sessionName}', sessionName), this.origin)
    if (password) url.searchParams.set('password', password)
    const result = await window.fetch(url.href, { method })
    return result
  }

  public async joinSession (sessionName: string, password?: string): Promise<Response> {
    const { pathname, method } = API_ROUTES.joinSession
    const url = new URL(pathname.replace('{sessionName}', sessionName), this.origin)
    if (password) url.searchParams.set('password', password)
    const result = await window.fetch(url.href, { method })
    return result
  }

  public async sessionExists (sessionName: string): Promise<Response> {
    const { pathname, method } = API_ROUTES.sessionExists
    const url = new URL(pathname.replace('{sessionName}', sessionName), this.origin)
    const result = await window.fetch(url.href, { method })
    return result
  }
}

interface SocketAPIConfig {
  url: string;
  sessionName: string;
  peerId: string;
}

type MessageListener = (data: SocketMessage) => unknown | Promise<unknown>

export class SocketAPI {
  private websocket: WebSocket
  private keepAliveInterval: number | undefined

  constructor (config: SocketAPIConfig) {
    const url = new URL(config.url.replace('{sessionName}', config.sessionName).replace('{peerId}', config.peerId));
    this.websocket = new WebSocket(url.href)
    window.addEventListener('beforeunload', () => this.websocket.close())
    this.websocket.onopen = (): void => {
      this.keepAliveInterval = window.setInterval(() => this.send({ type: 'keep-alive' }), 1000 * 30) // every 30 seconds.
    }
    this.websocket.onclose = (): void => window.clearInterval(this.keepAliveInterval)
  }

  public close () {
    this.websocket.close()
  }

  public onOffer (listener: MessageListener): SocketAPI {
    this.onMessage((data) => data.type === 'offer' && listener(data))
    return this
  }

  public onAnswer (listener: MessageListener): SocketAPI {
    this.onMessage((data) => data.type === 'answer' && listener(data))
    return this
  }

  public onIceCandidate (listener: MessageListener): SocketAPI {
    this.onMessage((data) => data.type === 'ice-candidate' && listener(data))
    return this
  }

  public onConnectedPeers (listener: MessageListener): SocketAPI {
    this.onMessage((data) => data.type === 'connected-peers-id' && listener(data))
    return this
  }
  
  public send (data: SocketMessage): void {
    this.websocket.send(JSON.stringify(data))
  }
  
  private onMessage (listener: MessageListener): SocketAPI {
    this.websocket.addEventListener('message', (event) => {
      const message: SocketMessage = JSON.parse(event.data)
      listener(message)
    })
    return this
  }
}
