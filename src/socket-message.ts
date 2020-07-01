// Here, I use a discriminated union − "type" being the discriminator −
// see https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions
export type SocketMessage =
  | { type: 'connected-peers-id', peerIds: string[] }
  | { type: 'offer'; offererId: string; answererId: string; description: RTCSessionDescriptionInit }
  | { type: 'answer'; offererId: string; answererId: string; description: RTCSessionDescriptionInit }
  | { type: 'ice-candidate'; fromPeerId: string; toPeerId: string; candidate: RTCIceCandidateInit }
  | { type: 'keep-alive' }
