import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'outstated'
import { stores } from 'lib/stores'
import { App } from './app'
import './index.css'
import './reset.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <Provider stores={stores}>
            <App />
        </Provider>
    </BrowserRouter>
)
