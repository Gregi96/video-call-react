import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'

type VideoPlayerProps = {
    stream: MediaStream,
    activeCamera?: boolean,
    activeMicrophone?: boolean
}

export const VideoPlayer: React.FunctionComponent<VideoPlayerProps> = ({
    stream,
    activeCamera = true,
    activeMicrophone = true
}) => {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream
        }
    }, [stream])

    useEffect(() => {
        stream.getVideoTracks()[0].enabled = activeCamera
        stream.getAudioTracks()[0].enabled = activeMicrophone
    }, [activeCamera, activeMicrophone])

    return (
        <Video
            ref={videoRef}
            autoPlay
        />
    )
}

const Video = styled.video`
    object-fit: cover;
    width: 100%;
`
