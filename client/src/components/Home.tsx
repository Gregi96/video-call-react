import React from 'react'
import styled from 'styled-components'
import { CreateButton } from './CreateButton'

export const Home: React.FunctionComponent = () => (
    <HomeContainer>
        <CreateButton/>
    </HomeContainer>
)

const HomeContainer = styled.div`
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`

