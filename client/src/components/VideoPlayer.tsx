import React, { useEffect, useRef } from 'react'

type VideoPlayerProps = {
    stream: MediaStream
}

export const VideoPlayer: React.FunctionComponent<VideoPlayerProps> = ({ stream }) => {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream
        }
    }, [stream])

    return (
        <video
            ref={videoRef}
            autoPlay
            muted
        />
    )
}
