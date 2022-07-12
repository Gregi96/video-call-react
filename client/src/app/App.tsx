import React from 'react'
import styled, { ThemeProvider } from 'styled-components'
import { theme } from 'lib/styles'

export const App = () => (
    <ThemeProvider theme={theme}>
        App
    </ThemeProvider>
)

const AppContainer = styled.div`
    width: 100%;
    height: 100vh;
`
