import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { useStore } from 'outstated'
import { useRoomStore as roomStore } from 'lib/stores'
import { VideoPlayer } from './VideoPlayer'
import { PeerState } from 'lib/stores/useRoomStore'

export const Room: React.FunctionComponent = () => {
    const { id } = useParams()
    const { ws, peer, stream, peers } = useStore(roomStore)

    useEffect(() => {
        if (peer) {
            // eslint-disable-next-line no-underscore-dangle
            ws.emit('join-room', { roomId: id, peerId: peer._id })
        }
    }, [id, peer, ws])

    return (
        <VideoContainer>
            <VideoPlayer stream={stream}/>
            {Object.values(peers as PeerState).map((peer, index) => (
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
    display: flex;
    flex-wrap: wrap;
    video {
      width: 49%;
    }
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

