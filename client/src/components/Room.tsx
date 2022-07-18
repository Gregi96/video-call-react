import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Icons } from 'assets'
import { useRoomStore, useTranslationStore } from 'lib/stores'
import { SocketEvents } from 'lib/types'
import { useCopyToClipboard } from 'lib/hooks'
import { VideoPlayer } from './VideoPlayer'

type VideoContainerProps = {
    countOfCaller: number
}

export const Room: React.FunctionComponent = () => {
    const { id } = useParams()
    const { T } = useTranslationStore()
    const {
        ws,
        peer,
        stream,
        peers,
        activeCamera,
        activeMicrophone,
        toggleMicrophone,
        toggleVideoCamera,
        usersInRoom,
        checkedUsersInRoom,
        checkCountOfUsersInRoom,
        hideCameraIds
    } = useRoomStore()
    const { copyText, isCopied } = useCopyToClipboard()
    const [getAccessToJoinRoom, setGetAccessToJoinRoom] = useState(false)
    const [checkAgain, setCheckAgain] = useState(false)
    const [noSpaceInRoom, setNoSpaceInRoom] = useState(true)

    useEffect(() => {
        if (id) {
            checkCountOfUsersInRoom(id)
        }
    }, [checkAgain])

    useEffect(() => {
        if (peer && getAccessToJoinRoom) {
            ws.emit(SocketEvents.joinRoom, {
                roomId: id,
                peerId: peer.id
            })
        }
    }, [id, peer, getAccessToJoinRoom])

    useEffect(() => {
        if (!checkedUsersInRoom) {
            return
        }

        if (checkedUsersInRoom && usersInRoom > 3) {
            return setNoSpaceInRoom(true)
        }

        navigator.mediaDevices.getUserMedia({audio: true, video: true})
            .then(localStream => {
                if (localStream.getVideoTracks().length > 0 && localStream.getAudioTracks().length > 0) {
                    setNoSpaceInRoom(false)
                    setGetAccessToJoinRoom(true)

                    localStream.getVideoTracks()
                        .forEach(track => {
                            track.stop()
                            localStream.removeTrack(track)
                        })

                    return
                }
            })
    }, [checkAgain, checkedUsersInRoom, usersInRoom])

    if (noSpaceInRoom) {
        return (
            <AcceptContainer>
                <div>
                    {T.noSpaceInRoom}
                </div>
                <button onClick={() => setCheckAgain(prev => !prev)}>
                    {T.tryAgain}
                </button>
            </AcceptContainer>
        )
    }

    if (!getAccessToJoinRoom) {
        return (
            <AcceptContainer>
                <div>
                    {T.acceptCameraAudio}
                </div>
                <button onClick={() => setCheckAgain(prev => !prev)}>
                    {T.tryAgain}
                </button>
            </AcceptContainer>
        )
    }

    return (
        <Container>
            <VideoContainer countOfCaller={Object.values(peers).length}>
                {stream && (
                    <VideoUserContainer>
                        <VideoPlayer
                            stream={stream}
                            ownStream
                            cameraOff={!activeCamera}
                        />
                        <ControllerIcons>
                            <IconContainer onClick={() => toggleVideoCamera(id)}>
                                {activeCamera ? (
                                    <Icons.Camera/>
                                ) : (
                                    <Icons.CameraOff/>
                                )}
                            </IconContainer>
                            <IconContainer onClick={toggleMicrophone}>
                                {activeMicrophone ? (
                                    <Icons.Microphone/>
                                ) : (
                                    <Icons.MicrophoneOff/>
                                )}
                            </IconContainer>
                        </ControllerIcons>
                    </VideoUserContainer>
                )}
                {Object.keys(peers).map((key => {
                    const hidden = hideCameraIds.includes(key)

                    return (
                        <VideoPlayer
                            key={key}
                            stream={peers[key].stream}
                            cameraOff={hidden}
                        />
                    )
                }))}
            </VideoContainer>
            <InviteContainer>
                <InviteText>
                    {T.copyUrlToInvite}
                </InviteText>
                <InviteUrl>
                    {window.location.href}
                    <InviteButton onClick={() => copyText(window.location.href)}>
                        {isCopied ? T.copied : T.copy}
                    </InviteButton>
                </InviteUrl>
            </InviteContainer>
        </Container>
    )
}

const Container = styled.div`
    height: 100%;
`

const VideoContainer = styled.div<VideoContainerProps>`
    display: grid;
    grid-template-columns: 50% 50%;
    grid-auto-rows: ${({ countOfCaller }) => countOfCaller > 1 ? '50vh' : '100vh'};
`

const InviteText = styled.div`
    text-align: center;
    margin-bottom: 5px;
`

const AcceptContainer = styled.div`
    height: 100%;
    justify-content: center;
    align-items: center;
    display: flex;
    flex-direction: column;
`

const InviteContainer = styled.div`
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    margin-left: auto;
    margin-right: auto;
    margin-top: 30px;
    max-width: 600px;
    padding: 10px;
    background-color: ${({ theme }) => theme.colors.cornflowerblue};
    border-radius: 10px;
`

const InviteButton = styled.button`
    margin-left: 10px;
    padding: 5px;
`

const InviteUrl = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`

const ControllerIcons = styled.div`
    display: flex;
    justify-content: center;
    position: absolute;
    right: 20px;
    bottom: 20px;
`

const VideoUserContainer = styled.div`
    position: relative;
`

const IconContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.colors.lightblue};
    width: 50px;
    height: 50px;
    margin-right: 10px;
`

