import { io, Socket} from "socket.io-client";

class SocketService {
  private socket: Socket| null = null;
  private isConnected = false;

  connect(token: string) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(import.meta.env.VITE_BACKEND_URL, {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on("connect", () => {
      this.isConnected = true;
      console.log('Connected to Arena socket');
    });

    this.socket.on("disconnect", () => {
      this.isConnected = false;
      console.log('Disconnected from Arena socket');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  getSocket() {
    return this.socket;
  }

  isSocketConnected() {
    return this.isConnected;
  }
}

export const socketService = new SocketService(); 