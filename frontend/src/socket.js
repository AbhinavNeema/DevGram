import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_BACKEND_URL;

const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
});

export const connectSocket = (token) => {
  const t = token || localStorage.getItem('token');
  if (t) {
    socket.auth = { token: t };
    if (socket.connected) {
      socket.disconnect();
    }
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket;