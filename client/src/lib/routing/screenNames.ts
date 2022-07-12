export enum ScreenNames {
    Home = '/',
    Room = '/room/:id'
}

export const ScreenNamesWithParams = {
    chatRoom: (roomId: string) => `/room/${roomId}`
}
