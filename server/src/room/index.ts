import { Socket } from 'socket.io'
import { v4 as uuidV4 } from 'uuid'

const rooms: Record<string, Array<string>> = {}

type JoinRoomProps = {
    roomId: string,
    peerId: string
}

export const roomHandler = (socket: Socket) => {
    const createRoom = () => {
        const roomId = uuidV4()

        rooms[roomId] = []
        socket.emit("room-created", { roomId })
    }

    const leaveRoom = ({ roomId, peerId }: JoinRoomProps) => {
        rooms[roomId] = rooms[roomId].filter(id => id !== peerId)
        socket.to(roomId).emit("user-disconnected", { peerId })
    }

    const joinRoom = ({ roomId, peerId }: JoinRoomProps) => {
        if (rooms[roomId]) {
            rooms[roomId].push(peerId)
            socket.join(roomId)
            socket.to(roomId).emit("user-joined", { peerId })
            socket.emit('get-users', {
                roomId,
                participants: rooms[roomId]
            })
        }

        socket.on("disconnect", () => {
            if (rooms[roomId]) {
                leaveRoom({
                    roomId,
                    peerId
                })
            }
        })
    }

    socket.on("create-room", createRoom)
    socket.on('join-room', joinRoom)
}
