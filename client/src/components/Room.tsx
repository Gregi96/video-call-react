import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Icons } from 'assets'
import { useRoomStore, useTranslationStore } from 'lib/stores'
import { SocketEvents } from 'lib/types'
import { VideoPlayer } from './VideoPlayer'

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
        toggleVideoCamera
    } = useRoomStore()

    useEffect(() => {
        if (peer) {
            ws.emit(SocketEvents.joinRoom, {
                roomId: id,
                peerId: peer.id
            })
        }
    }, [id, peer])

    return (
        <VideoContainer>
            {stream && (
                <VideoUserContainer>
                    <VideoPlayer
                        stream={stream}
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
            {Object.values(peers).map((peerState, index) => (
                <VideoPlayer
                    key={index}
                    stream={peerState.stream}
                />
            ))}
            <InviteUrl>
                <InviteText>
                    {T.copyUrlToInvite}
                </InviteText>
                <div>
                    {window.location.href}
                </div>
            </InviteUrl>
        </VideoContainer>
    )
}

const VideoContainer = styled.div`
    display: grid;
    grid-template-columns: 50% 50%;
`

const InviteText = styled.div`
    text-align: center;
    margin-bottom: 5px;
`

const InviteUrl = styled.div`
    display: flex;
    flex-direction: column;
    margin-left: auto;
    margin-right: auto;
    margin-top: 30px;
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

