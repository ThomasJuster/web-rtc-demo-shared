export interface SocketMessageConnectedPeersId { type: 'connected-peers-id', peerIds: string[] }
export interface SocketMessageOffer { type: 'offer'; offererId: string; answererId: string; description: RTCSessionDescriptionInit }
export interface SocketMessageAnswer { type: 'answer'; offererId: string; answererId: string; description: RTCSessionDescriptionInit }
export interface SocketMessageIceCandidate { type: 'ice-candidate'; fromPeerId: string; toPeerId: string; candidate: RTCIceCandidateInit }
export interface SocketMessageKeepAlive { type: 'keep-alive' }

// Here, I use a discriminated union − "type" being the discriminator −
// see https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions
export type SocketMessage =
  | SocketMessageConnectedPeersId
  | SocketMessageOffer
  | SocketMessageAnswer
  | SocketMessageIceCandidate
  | SocketMessageKeepAlive

function ok<T> (value: T, message?: string): asserts value is NonNullable<T> {
  if (!value) throw new Error(message || `value ${value} cannot be null or undefined`)
}

export function parseSocketMessage (data: string | Buffer | ArrayBuffer | Buffer[]): SocketMessage {
  const messageAsString = data.toString('utf-8')
  const message: SocketMessage = JSON.parse(messageAsString) // let it throw, a message should be JSON.
  ok(message.type, 'SocketMessage must have a "type" property')
  switch (message.type) {
    case 'connected-peers-id':
      ok(Array.isArray(message.peerIds), 'peerIds must be an array')
      break
    case 'offer':
    case 'answer':
      ok(message.answererId, 'SocketMessage must have property "answererId"')
      ok(message.description, 'SocketMessage must have property "description"')
      ok(message.offererId, 'SocketMessage must have property "offererId"')
      break
    case 'ice-candidate':
      ok(message.fromPeerId)
      ok(message.toPeerId)
      ok(message.candidate)
      break
    case 'keep-alive':
      break
    default:
      throw new Error('SocketMessage must have a valid "type" property')
  }

  return message
}