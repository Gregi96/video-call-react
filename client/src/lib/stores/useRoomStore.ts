import socketIoClient, { Socket } from 'socket.io-client'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidV4 } from 'uuid'
import Peer from 'peerjs'
import { ScreenNamesWithParams } from 'lib/routing'
import { SocketEvents, PeerState } from 'lib/types'
import { APP_CONFIG } from 'lib/config'

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

const ws = socketIoClient(APP_CONFIG.WP_URL)

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

        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        })
            .then(setStream)
            .catch(console.log)

        ws.on(SocketEvents.roomCreated, ({ roomId }: RoomCreatedType) => {
            navigation(ScreenNamesWithParams.chatRoom(roomId))
        })
        ws.on(SocketEvents.getUsers, ({ roomId, participants }) => {
            console.log('participants', participants)
        })
        ws.on(SocketEvents.userDisconnected, ({ peerId }) => {
            removePeer(peerId)
        })
    }, [])

    useEffect(() => {
        if (!myPeer || !stream) {
            return
        }

        ws.on(SocketEvents.userJoined, ({ peerId }) => {
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
