import React, { useEffect } from 'react'
import { useRoomStore as roomStore } from 'lib/stores'
import { useStore } from 'outstated'
import styled from 'styled-components'

export const CreateButton: React.FunctionComponent = () => {
    const { ws } = useStore(roomStore)

    const createRoom = () => {
        ws.emit('create-room')
    }

    return (
        <CreateRoomButton onClick={createRoom}>
            Crete new room to stream
        </CreateRoomButton>
    )
}

const CreateRoomButton = styled.button`
    padding: 5px 10px;
`
