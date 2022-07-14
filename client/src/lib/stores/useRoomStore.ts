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
    activeCamera: boolean,
    activeMicrophone: boolean,
    toggleMicrophone: VoidFunction,
    toggleVideoCamera(roomId: string | undefined): void,
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
                const videoTrack: any = newStream
                    ?.getTracks()
                    .find(track => track.kind === 'video')

                connection[0].peerConnection
                    .getSenders()
                    .find((sender: RTCRtpSender) => sender.track.kind === 'video')
                    .replaceTrack(videoTrack)
                    .then(() => {
                        if (myPeer && roomId.length > 0) {
                            ws.emit(SocketEvents.showCamera, {
                                peerId: myPeer.id,
                                roomId
                            })
                        }
                    })
                    .catch((err: any) => console.error(err))
            })
        }
    }

    const switchAudioTrack = (newStream: MediaStream) => {
        if (myPeer) {
            Object.values(myPeer.connections).forEach(connection => {
                const audioTrack: any = newStream
                    ?.getTracks()
                    .find(track => track.kind === 'audio')

                connection[0].peerConnection
                    .getSenders()
                    .find((sender: RTCRtpSender) => sender.track.kind === 'audio')
                    .replaceTrack(audioTrack)
                    .catch((err: any) => console.error(err))
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
            .catch(console.log)
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
            .catch(console.log)
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

        ws.on(SocketEvents.hideCamera, ({ peerId, roomId }) => {
            setPeers(prevState =>
                Object.keys(prevState).reduce((acc, key) => {
                    if (key === peerId) {
                        const updatedStream = prevState[key].stream.getVideoTracks()[0]
                        updatedStream.enabled = false

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
        })

        ws.on(SocketEvents.showCamera, ({ peerId, roomId }) => {
            setPeers(prevState =>
                Object.keys(prevState).reduce((acc, key) => {
                    if (key === peerId) {
                        const updatedStream = prevState[key].stream.getVideoTracks()[0]
                        updatedStream.enabled = true

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
        peers,
        toggleVideoCamera,
        activeCamera,
        toggleMicrophone,
        activeMicrophone
    }
}
