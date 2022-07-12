import React from 'react'
import styled from 'styled-components'
import { useRoomStore } from 'lib/stores'

export const CreateButton: React.FunctionComponent = () => {
    const { ws } = useRoomStore()

    return (
        <CreateRoomButton onClick={() => ws.emit('create-room')}>
            Crete new room to stream
        </CreateRoomButton>
    )
}

const CreateRoomButton = styled.button`
    padding: 5px 10px;
`
