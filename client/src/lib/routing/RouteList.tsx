import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { Home, Room } from 'components'

export const renderRoutes = () => (
    <Routes>
        <Route
            path={'/'}
            element={
                <Home/>
            }
        />
        <Route
            path={'/room/:id'}
            element={
                <Room/>
            }
        />
    </Routes>
)
