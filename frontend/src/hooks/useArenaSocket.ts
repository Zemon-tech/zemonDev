import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { socketService } from '../services/socket.service';
import { Socket } from 'socket.io-client';

export const useArenaSocket = () => {
  const { getToken, isSignedIn } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isSignedIn) return;

    const initSocket = async () => {
      try {
        const token = await getToken();
        if (token) {
          const newSocket = socketService.connect(token);
          setSocket(newSocket);

          newSocket.on('connect', () => setIsConnected(true));
          newSocket.on('disconnect', () => setIsConnected(false));
        }
      } catch (error) {
        console.error('Socket connection error:', error);
      }
    };

    initSocket();

    return () => {
      socketService.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [getToken, isSignedIn]);

  return { socket, isConnected };
}; 