import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { Home, Room } from 'components'
import { ScreenNames } from 'lib/routing'

export const renderRoutes = () => (
    <Routes>
        <Route
            path={ScreenNames.Home}
            element={(
                <Home/>
            )}
        />
        <Route
            path={ScreenNames.Room}
            element={(
                <Room/>
            )}
        />
    </Routes>
)
