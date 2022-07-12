import React from 'react'
import styled, { ThemeProvider } from 'styled-components'
import { theme } from 'lib/styles'
import { renderRoutes } from 'lib/routing'

export const App = () => (
    <ThemeProvider theme={theme}>
        <AppContainer>
            {renderRoutes()}
        </AppContainer>
    </ThemeProvider>
)

const AppContainer = styled.div`
    width: 100%;
    height: 100vh;
`
