import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { useRoomStore, useTranslationStore } from 'lib/stores'
import { SocketEvents } from 'lib/types'
import { VideoPlayer } from './VideoPlayer'

export const Room: React.FunctionComponent = () => {
    const { id } = useParams()
    const { T } = useTranslationStore()
    const { ws, peer, stream, peers } = useRoomStore()

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
                <VideoPlayer
                    stream={stream}
                    muted
                />
            )}
            {Object.values(peers).map((peer, index) => (
                <VideoPlayer
                    key={index}
                    stream={peer.stream}
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

