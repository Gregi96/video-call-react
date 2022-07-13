import React from 'react'
import styled from 'styled-components'
import { useRoomStore, useTranslationStore } from 'lib/stores'
import { SocketEvents } from 'lib/types'

export const CreateButton: React.FunctionComponent = () => {
    const { ws } = useRoomStore()
    const { T } = useTranslationStore()

    return (
        <CreateRoomButton onClick={() => ws.emit(SocketEvents.createRoom)}>
            {T.createNewRoomButton}
        </CreateRoomButton>
    )
}

const CreateRoomButton = styled.button`
    padding: 5px 10px;
`
