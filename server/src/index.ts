import express from 'express'
import http from 'http'
import dotenv from 'dotenv'
import { Server } from 'socket.io'
import cors from 'cors'
import { roomHandler } from './room'
import { Events } from './types'
import path from 'path'

dotenv.config()
const app = express()
app.use(cors())
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
})

app.use(express.static(path.join(__dirname,'../../client/dist')))

io.on(Events.Connection, (socket) => {
    roomHandler(socket)
})

app.get('/*', (req, res) => {
    console.log(req)
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'), (err) => {
        if (err) {
            console.log(err)
            res.status(500).send({err, path: path.join(__dirname, '../../client/dist/index.html')})
        }
    });
});

const port = process.env.PORT || 8080
server.listen(port)
