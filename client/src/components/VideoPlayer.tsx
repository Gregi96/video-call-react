import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { Icons } from 'assets'
import { useRoomStore } from 'lib/stores'
import { R } from 'lib/utils'

type VideoPlayerProps = {
    stream: MediaStream,
    ownStream?: boolean
}

export const VideoPlayer: React.FunctionComponent<VideoPlayerProps> = ({
    stream,
    ownStream
}) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const { activeCamera, peers } = useRoomStore()
    const [offCamera, setOffCamera] = useState(false)

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream
        }
    }, [stream])

    useEffect(() => {
        const [ videoTrack ] = stream.getVideoTracks()

        if (R.isEmpty(videoTrack) || !videoTrack) {
            return setOffCamera(true)
        }

        if (videoTrack.enabled) {
            return setOffCamera(false)
        }

        setOffCamera(true)
    }, [activeCamera, peers])

    return (
        <VideoContainer>
            <Video
                ref={videoRef}
                autoPlay
                muted={ownStream}
            />
            {offCamera && (
                <VideoOff>
                    <Icons.CameraOff/>
                </VideoOff>
            )}
        </VideoContainer>
    )
}

const VideoContainer = styled.div`
    position: relative;
`

const Video = styled.video`
    object-fit: cover;
    width: 100%;
`

const VideoOff = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background-color: white;
`
