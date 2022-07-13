export type PeerStream = {
    stream: MediaStream
}

export type PeerState = Record<string, PeerStream>
