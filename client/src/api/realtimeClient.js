// io is a function to create a socket connection to the server
import { io } from 'socket.io-client';

// we need a socket url, just like a number to call to
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// io function takes the url, and then {} is the configuration which is optional
export const socket = io(SOCKET_URL, {
  // usually socket.io will try to connect automatically
  // but here we want it to connect only when we want it
  // for example, when the user get a number only we build a "connection"
  autoConnect: false,
});
