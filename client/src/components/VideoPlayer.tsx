import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { Icons } from 'assets'

type VideoPlayerProps = {
    stream: MediaStream,
    ownStream?: boolean,
    cameraOff: boolean
}

export const VideoPlayer: React.FunctionComponent<VideoPlayerProps> = ({
    stream,
    ownStream,
    cameraOff
}) => {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream

            videoRef.current.onloadedmetadata = () => {
                videoRef.current!.play()
            }
        }
    }, [stream])

    return (
        <VideoContainer>
            <Video
                ref={videoRef}
                autoPlay
                muted={ownStream}
                playsInline
                controls={false}
            />
            {cameraOff && (
                <VideoOffScreen>
                    <VideoOff>
                        <Icons.CameraOff/>
                    </VideoOff>
                </VideoOffScreen>
            )}
        </VideoContainer>
    )
}

const VideoContainer = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
`

const Video = styled.video`
    object-fit: cover;
    width: 100%;
    height: 100%;
`

const VideoOffScreen = styled.div`
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background-color: black;
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
