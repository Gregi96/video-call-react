import { useStore } from 'outstated'
import { useRoomStore as roomStore, useRoomStoreResponse } from './useRoomStore'
import { useTranslationStore as translationStore  } from './useTranslationStore'

export const stores = [
    roomStore,
    translationStore
]

export const useRoomStore = () => useStore(roomStore)
export const useTranslationStore = () => useStore(translationStore)

