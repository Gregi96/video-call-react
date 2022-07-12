import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'

type VideoPlayerProps = {
    stream: MediaStream,
}

export const VideoPlayer: React.FunctionComponent<VideoPlayerProps> = ({
    stream
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
            muted
        />
    )
}

const Video = styled.video`
    object-fit: cover;
    width: 100%;
`
