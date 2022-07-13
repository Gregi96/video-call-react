import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { roomHandler } from './room'
import { Events } from './types'

const port = 8080;
const app = express()
app.use(cors())
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
})

io.on(Events.Connection, (socket) => {
    roomHandler(socket)

    socket.on(Events.Disconnect, () => {
        console.log('user is disconnected')
    })
})

server.listen(port, () => {
    console.log('Listening to the server', port)
})
