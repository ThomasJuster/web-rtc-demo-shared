type RouteName =
  | 'createSession'
  | 'joinSession'
  | 'sessionExists'

interface Route {
  method: 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE'
  pathname: string
  query: {
    password?: { required: boolean }
  }
}

export const API_ROUTES: { [Key in RouteName]: Route } = {
  createSession: {
    method: 'PUT',
    pathname: '/sessions/:sessionName',
    query: {
      password: { required: false },
    },
  },
  joinSession: {
    method: 'PATCH',
    pathname: '/sessions/:sessionName',
    query: {
      password: { required: false },
    },
  },
  sessionExists: {
    method: 'GET',
    pathname: '/sessions/:sessionName',
    query: {},
  }
}

interface ServerApiConfig {
  baseUrl?: string;
}

export class ServerApi {
  public origin: string;
  constructor ({ baseUrl = 'http://localhost:4321/' }: ServerApiConfig = {}) {
    this.origin = new URL(baseUrl).origin;
  }

  public async createSession (sessionName: string, password?: string): Promise<Response> {
    const { pathname, method } = API_ROUTES.createSession
    const url = new URL(pathname.replace(':sessionName', sessionName), this.origin)
    if (password) url.searchParams.set('password', password)
    const result = await window.fetch(url.href, { method })
    return result
  }

  public async joinSession (sessionName: string, password?: string): Promise<Response> {
    const { pathname, method } = API_ROUTES.joinSession
    const url = new URL(pathname.replace(':sessionName', sessionName), this.origin)
    if (password) url.searchParams.set('password', password)
    const result = await window.fetch(url.href, { method })
    return result
  }

  public async sessionExists (sessionName: string): Promise<Response> {
    const { pathname, method } = API_ROUTES.sessionExists
    const url = new URL(pathname.replace(':sessionName', sessionName), this.origin)
    const result = await window.fetch(url.href, { method })
    return result
  }
}
