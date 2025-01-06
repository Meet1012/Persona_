import React, {
  createContext,
  useMemo,
  useContext,
  useState,
  useEffect,
} from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export const SocketProvider = (props) => {
  // const socket = useMemo(() => io("localhost:8000"), []);
  const [socket, setSocket] = useState();
  useEffect(() => {
    const soc = io("localhost:8000");
    setSocket(soc);
    return () => {
      soc.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
};
