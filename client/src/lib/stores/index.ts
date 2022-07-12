import { useStore } from 'outstated'
import { useRoomStore as roomStore, useRoomStoreResponse } from './useRoomStore'

export const stores = [
    roomStore
]

export const useRoomStore = () => useStore(roomStore)

