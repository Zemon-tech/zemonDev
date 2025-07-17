import { io, Socket} from "socket.io-client";

class SocketService {
  private socket: Socket| null = null;
  private isConnected = false;

  connect(token: string) {
    if (this.socket) {
      console.log('Existing socket found, disconnecting first');
      this.disconnect();
    }

    console.log('Creating new socket connection to:', import.meta.env.VITE_BACKEND_URL);
    
    this.socket = io(import.meta.env.VITE_BACKEND_URL, {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on("connect", () => {
      this.isConnected = true;
      console.log('Connected to Arena socket with ID:', this.socket?.id);
    });

    this.socket.on("disconnect", (reason) => {
      this.isConnected = false;
      console.log('Disconnected from Arena socket. Reason:', reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error('Socket connection error:', error.message);
    });

    this.socket.on("error", (error) => {
      console.error('Socket error:', error);
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