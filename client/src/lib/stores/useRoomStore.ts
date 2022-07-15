import socketIoClient, { Socket } from 'socket.io-client'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidV4 } from 'uuid'
import Peer from 'peerjs'
import { ScreenNamesWithParams } from 'lib/routing'
import { SocketEvents, PeerState, SetState } from 'lib/types'
import { APP_CONFIG } from 'lib/config'

type RoomCreatedType = {
    roomId: string
}

export type useRoomStoreResponse = {
    ws: Socket,
    peer?: Peer,
    peers: PeerState,
    stream?: MediaStream,
    activeCamera: boolean,
    activeMicrophone: boolean,
    toggleMicrophone: VoidFunction,
    toggleVideoCamera(roomId?: string): void,
    addPeer(peerId: string, stream: MediaStream): void,
    removePeer(peerId: string, stream: MediaStream): void
}

const ws = socketIoClient(APP_CONFIG.WP_URL)

export const useRoomStore = (): useRoomStoreResponse => {
    const [peers, setPeers] = useState<PeerState>({})
    const [myPeer, setMyPeer] = useState<Peer>()
    const [stream, setStream] = useState<MediaStream>(new MediaStream())
    const navigation = useNavigate()
    const [activeCamera, setActiveCamera] = useState(false)
    const [activeMicrophone, setActiveMicrophone] = useState(false)

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

    const addPeer = (peerId: string, peerStream: MediaStream) => setPeers(prev => ({
        ...prev,
        [peerId]: {
            stream: peerStream
        }
    }))

    const switchCameraTrack = (newStream: MediaStream, roomId = '') => {
        if (myPeer) {
            Object.values(myPeer.connections).forEach(connection => {
                const videoTrack = newStream
                    ?.getTracks()
                    .find(track => track.kind === 'video')

                const [ peerConnection ] = connection

                peerConnection.peerConnection
                    .getSenders()
                    .find((sender: RTCRtpSender) => {
                        if (sender.track) {
                            return sender.track.kind === 'video'
                        }

                        return false
                    })
                    .replaceTrack(videoTrack)
                    .then(() => {
                        if (myPeer && roomId.length > 0) {
                            ws.emit(SocketEvents.showCamera, {
                                peerId: myPeer.id,
                                roomId
                            })
                        }
                    })
                    .catch()
            })
        }
    }

    const switchAudioTrack = (newStream: MediaStream) => {
        if (myPeer) {
            Object.values(myPeer.connections).forEach(connection => {
                const audioTrack = newStream
                    ?.getTracks()
                    .find(track => track.kind === 'audio')

                const [ peerConnection ] = connection

                peerConnection.peerConnection
                    .getSenders()
                    .find((sender: RTCRtpSender) => {
                        if (sender.track) {
                            return sender.track.kind === 'audio'
                        }

                        return false
                    })
                    .replaceTrack(audioTrack)
                    .catch()
            })
        }
    }

    const toggleVideoCamera = (roomId = '') => {
        if (!stream) {
            return
        }

        if (activeCamera) {
            stream.getVideoTracks()
                .forEach(track => {
                    track.stop()
                    stream.removeTrack(track)
                })

            if (myPeer) {
                ws.emit(SocketEvents.hideCamera, {
                    peerId: myPeer.id,
                    roomId
                })
            }

            return setActiveCamera(false)
        }

        navigator.mediaDevices.getUserMedia({
            video: true
        })
            .then(localStream => {
                localStream.getVideoTracks()
                    .forEach(track => stream.addTrack(track))

                switchCameraTrack(localStream, roomId)
                setActiveCamera(true)
            })
            .catch()
    }

    const toggleMicrophone = () => {
        if (!stream) {
            return
        }

        if (activeMicrophone) {
            stream.getAudioTracks()
                .forEach(track => {
                    track.stop()
                    stream.removeTrack(track)
                })

            return setActiveMicrophone(false)
        }

        navigator.mediaDevices.getUserMedia({
            audio: true
        })
            .then(localStream => {
                localStream.getAudioTracks()
                    .forEach(track => stream.addTrack(track))

                switchAudioTrack(localStream)
                setActiveMicrophone(true)
            })
            .catch()
    }

    useEffect(() => {
        const meId = uuidV4()
        const peer = new Peer(meId)

        setMyPeer(peer)
        toggleVideoCamera()
        toggleMicrophone()

        ws.on(SocketEvents.roomCreated, ({ roomId }: RoomCreatedType) => {
            navigation(ScreenNamesWithParams.chatRoom(roomId))
        })

        ws.on(SocketEvents.getUsers, ({ roomId, participants }) => {
            console.log('participants', participants)
        })

        ws.on(SocketEvents.userDisconnected, ({ peerId }) => {
            removePeer(peerId)
        })

        ws.on(SocketEvents.hideCamera, ({ peerId, roomId }) =>
            setPeers(prevState =>
                Object.keys(prevState).reduce((acc, key) => {
                    if (key === peerId) {
                        const [ videoTrack ] = prevState[key].stream.getVideoTracks()

                        videoTrack.enabled = false

                        return {
                            ...acc,
                            [key]: {
                                stream: prevState[key].stream
                            }
                        }
                    }

                    return acc
                }, {})
            )
        )

        ws.on(SocketEvents.showCamera, ({ peerId, roomId }) =>
            setPeers(prevState =>
                Object.keys(prevState).reduce((acc, key) => {
                    if (key === peerId) {
                        const [ videoTrack ] = prevState[key].stream.getVideoTracks()

                        videoTrack.enabled = true

                        return {
                            ...acc,
                            [key]: {
                                stream: prevState[key].stream
                            }
                        }
                    }

                    return acc
                }, {})
            )
        )

        return () => {
            ws.off(SocketEvents.roomCreated)
            ws.off(SocketEvents.getUsers)
            ws.off(SocketEvents.userDisconnected)
            ws.off(SocketEvents.hideCamera)
            ws.off(SocketEvents.showCamera)
            myPeer?.disconnect()
            myPeer?.destroy()
        }
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

        return () => {
            ws.off(SocketEvents.userJoined)
        }
    }, [myPeer, stream])

    return {
        ws,
        peer: myPeer,
        stream,
        addPeer,
        removePeer,
        peers,
        toggleVideoCamera,
        activeCamera,
        toggleMicrophone,
        activeMicrophone
    }
}
