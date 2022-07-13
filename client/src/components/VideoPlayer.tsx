import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'

type VideoPlayerProps = {
    stream: MediaStream,
    muted?: boolean
}

export const VideoPlayer: React.FunctionComponent<VideoPlayerProps> = ({
    stream,
    muted
}) => {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream
        }
    }, [stream])

    return (
        <Video
            ref={videoRef}
            autoPlay
            muted={muted}
        />
    )
}

const Video = styled.video`
    object-fit: cover;
    width: 100%;
`
