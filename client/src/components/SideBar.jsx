import { useEffect, useState } from "react";
import { User, Users, Menu, X, Bell } from "lucide-react";
import { getPlayerSocket } from "../scenes/getPlayerSocket";

const socket = getPlayerSocket();

function SideBar() {
  const main_player = sessionStorage.getItem("MainPlayer");
  const [isOpen, setIsOpen] = useState(false);
  const [currID, setCurrID] = useState(0);
  const [currPlayers, setCurrPlayers] = useState([]);

  function addtocurrPlayers(playerName, socketID) {
    setCurrID((prevID) => {
      const newID = prevID + 1;
      setCurrPlayers((prevPlayers) => {
        const playerExist = prevPlayers.some(
          (player) => player.name == playerName
        );
        if (!playerExist) {
          return [
            ...prevPlayers,
            { id: newID, name: playerName, socketID: socketID },
          ];
        }
        return prevPlayers;
      });
    });
  }

  function sendNotification(socketID) {
    console.log("Notification Sending to: ", socketID, main_player);
    socket.emit("sent:notification", {
      socketID: socketID,
      playerName: main_player,
    });
  }

  useEffect(() => {
    socket.on("current:players", (players) => {
      Object.keys(players).forEach((ID) => {
        addtocurrPlayers(players[ID].username, ID);
      });
    });

    socket.on("new:player", ([data, playerName, socketID]) => {
      addtocurrPlayers(playerName, socketID);
    });

    socket.on("player:disconnected", (playerName) => {
      setCurrPlayers((prevPlayers) => {
        // Return the filtered array
        return prevPlayers.filter((player) => player.name !== playerName);
      });
    });

    // Cleanup
    return () => {
      socket.off("player:disconnected");
      socket.off("new:player");
      socket.off("current:players");
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 absolute">
      <div
        className={`h-full bg-[#735DA5] transition-all duration-300 p-2 ${
          isOpen ? "w-64" : "w-16"
        }`}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white flex items-center p-2"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Main Player */}
        <div className="mt-4 p-2 bg-[#D3C5E5] rounded-lg flex items-center space-x-2">
          <User className="text-[#735DA5]" />
          {isOpen && (
            <span className="text-[#735DA5] font-semibold">{main_player}</span>
          )}
        </div>

        <hr className="my-4 border-white" />

        {/* Online Players */}
        <div>
          {currPlayers.map((player) => (
            <div
              key={player.id}
              className="p-2 bg-[#D3C5E5] rounded-lg flex items-center space-x-2 my-2"
            >
              <Users className="text-[#735DA5]" />
              {isOpen && <span className="text-[#735DA5]">{player.name}</span>}
              {isOpen && (
                <button className="ml-auto text-[#735DA5]">
                  <Bell
                    size={16}
                    onClick={() => sendNotification(player.socketID)}
                  />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SideBar;
