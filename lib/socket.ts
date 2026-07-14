import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (userId?: string) => {
    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
            transports: ['websocket'],
            autoConnect: false
        });
    }
    
    if (userId && !socket.connected) {
        socket.auth = { userId };
        socket.connect();
        socket.emit('user-online', userId);
    }
    
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};