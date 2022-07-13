import { Socket } from 'socket.io'
import { v4 as uuidV4 } from 'uuid'
import { Events } from '../types'

const rooms: Record<string, string[]> = {}

type JoinRoomProps = {
    roomId: string,
    peerId: string
}

export const roomHandler = (socket: Socket) => {
    const createRoom = () => {
        const roomId = uuidV4()

        rooms[roomId] = []
        socket.emit(Events.RoomCreated, { roomId })
    }

    const leaveRoom = ({ roomId, peerId }: JoinRoomProps) => {
        rooms[roomId] = rooms[roomId].filter(id => id !== peerId)
        socket.to(roomId).emit(Events.UserDisconnected, { peerId })
    }

    const joinRoom = ({ roomId, peerId }: JoinRoomProps) => {
        if (rooms[roomId]) {
            rooms[roomId].push(peerId)
            socket.join(roomId)
            socket.to(roomId).emit(Events.UserJoined, { peerId })
            socket.emit(Events.GetUsers, {
                roomId,
                participants: rooms[roomId]
            })
        }

        socket.on(Events.Disconnect, () => {
            if (rooms[roomId]) {
                leaveRoom({
                    roomId,
                    peerId
                })
            }
        })
    }

    socket.on(Events.CreateRoom, createRoom)
    socket.on(Events.JoinRoom, joinRoom)
}
