import socketIoClient, { Socket } from 'socket.io-client'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidV4 } from 'uuid'
import Peer from 'peerjs'
import { ScreenNamesWithParams } from 'lib/routing'

const WS = 'http://localhost:8080'

const ws = socketIoClient(WS)

type PeerStream = {
    stream: MediaStream
}

export type PeerState = Record<string, PeerStream>

type RoomCreatedType = {
    roomId: string
}

export type useRoomStoreResponse = {
    ws: Socket,
    peer?: Peer,
    peers: PeerState,
    stream?: MediaStream,
    addPeer(peerId: string, stream: MediaStream): void,
    removePeer(peerId: string, stream: MediaStream): void
}

export const useRoomStore = (): useRoomStoreResponse => {
    const [peers, setPeers] = useState<PeerState>({})
    const [myPeer, setMyPeer] = useState<Peer>()
    const [stream, setStream] = useState<MediaStream>()
    const navigation = useNavigate()

    const removePeer = (peerId: string) => setPeers(prev => Object.keys(prev)
        .reduce((acc, key) => {
            if (key !== peerId) {
                return {
                    ...acc,
                    [key]: prev[key]
                }
            }

            return acc
        }, {} as PeerState))

    const addPeer = (peerId: string, stream: MediaStream) => setPeers(prev => ({
        ...prev,
        [peerId]: {
            stream
        }
    }))

    useEffect(() => {
        const meId = uuidV4()
        const peer = new Peer(meId)

        setMyPeer(peer)

        try {
            navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            })
                .then(setStream)
        } catch (error) {
            alert('Couldn\'t get the stream')
            console.log(error)
        }

        ws.on('room-created', ({ roomId }: RoomCreatedType) => {
            navigation(ScreenNamesWithParams.chatRoom(roomId))
        })
        ws.on('get-users', ({ roomId, participants }) => {
            console.log('participants', participants)
        })
        ws.on('user-disconnected', ({ peerId }) => {
            removePeer(peerId)
        })
    }, [])

    useEffect(() => {
        if (!myPeer) {
            return
        }

        if (!stream) {
            return
        }

        ws.on('user-joined', ({ peerId }) => {
            const call = myPeer.call(peerId, stream)

            call.on('stream', peerStream => addPeer(peerId, peerStream))
        })

        myPeer.on('call', call => {
            call.answer(stream)
            call.on('stream', peerStream => addPeer(call.peer, peerStream))
        })
    }, [myPeer, stream, peers])

    return {
        ws,
        peer: myPeer,
        stream,
        addPeer,
        removePeer,
        peers
    }
}
