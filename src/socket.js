import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const initSocket = () => {
    return new Promise((resolve, reject) => {
        const socket = io(SOCKET_SERVER_URL, {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 20000,
            transports: ['websocket', 'polling'],
            path: '/socket.io/'
        });

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            resolve(socket);
        });

        socket.on('connect_error', (error) => {
            console.error('Socket error:', error);
            reject(error);
        });

        socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });
    });
};
