import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { socketService } from '../services/socket.service';
import { Socket } from 'socket.io-client';

export const useArenaSocket = () => {
  const { getToken, isSignedIn } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      console.log('Not signed in, skipping socket connection');
      return;
    }

    const initSocket = async () => {
      try {
        console.log('Initializing socket connection...');
        const token = await getToken();
        if (token) {
          console.log('Token obtained, connecting socket...');
          const newSocket = socketService.connect(token);
          setSocket(newSocket);

          newSocket.on('connect', () => {
            console.log('Socket connected successfully!');
            setIsConnected(true);
          });
          
          newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
          });
          
          newSocket.on('error', (error) => {
            console.error('Socket error:', error);
          });
        } else {
          console.error('Failed to get token for socket connection');
        }
      } catch (error) {
        console.error('Socket connection error:', error);
      }
    };

    initSocket();

    return () => {
      console.log('Cleaning up socket connection');
      socketService.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [getToken, isSignedIn]);

  return { socket, isConnected };
}; 