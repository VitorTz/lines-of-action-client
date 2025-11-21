

export interface Lobby {
    host: {
        id: string,
        username: string
    },
    guest: {
        id: string,
        username: string
    },
    message: string,
    status: 'waiting' | 'full',
    createdAt: Date
}