import React, { Fragment, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { useRoomStore } from 'lib/stores'
import { VideoPlayer } from './VideoPlayer'
import { SocketEvents } from 'lib/types'

export const Room: React.FunctionComponent = () => {
    const { id } = useParams()
    const { ws, peer, stream, peers } = useRoomStore()

    useEffect(() => {
        if (peer) {
            ws.emit(SocketEvents.joinRoom, {
                roomId: id,
                // eslint-disable-next-line no-underscore-dangle
                peerId: peer.id
            })
        }
    }, [id, peer])

    return (
        <VideoContainer>
            {stream && (
                <Fragment>
                    <VideoPlayer
                        stream={stream}
                        muted
                    />
                </Fragment>
            )}
            {Object.values(peers).map((peer, index) => (
                <VideoPlayer
                    key={index}
                    stream={peer.stream}
                />
            ))}
            <InviteUrl>
                <InviteText>
                    Copy url to invite friends
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

