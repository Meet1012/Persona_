import React, { useRef, useState, useEffect } from "react";
import { getPlayerSocket } from "../scenes/getPlayerSocket";

const WebRTC = () => {
  const videoRef = useRef(null);
  const remoteRef = useRef(null);
  const [peerConnection, setpeerConnection] = useState(null);
  const [otherSocketID, setotherSocketID] = useState();
  const [flagValue, setFlagValue] = useState(false);
  const [showRemote, setShowRemote] = useState(true);
  const socket = getPlayerSocket();

  // Handle private accepted event
  socket.on("private:accepted", ({ to, flag }) => {
    console.log("Flag Value: ", flag);
    setotherSocketID(to);
    setFlagValue(flag);
    setShowRemote(true);
  });

  socket.on("remove:private", () => {
    // if (peerConnection) {
    //   peerConnection.close();
    //   console.log("Peer Connection closed !!");
    // }
    setotherSocketID();
    setShowRemote(false); // Hide remote video
  });

  // Initialize PeerConnection with ICE servers
  const generatePeerConnection = () => {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.stunprotocol.org",
        },
      ],
    });

    // Handle remote stream
    peer.ontrack = (event) => {
      console.log("Remote stream received");
      if (remoteRef.current) {
        remoteRef.current.srcObject = event.streams[0];
      }
    };

    console.log("Generated PeerConnection: ", peer);
    setpeerConnection(peer);
  };

  useEffect(() => {
    // Access local video stream
    const getUserMedia = async () => {
      try {
        const localstream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = localstream;
        }

        // Add local tracks to PeerConnection
        if (peerConnection) {
          localstream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, localstream);
          });
          console.log("Local stream added to PeerConnection");
        }
      } catch (err) {
        console.error("Error accessing local media:", err);
      }
    };

    getUserMedia();

    // Cleanup
    return () => {
      // if (peerConnection) {
      //   peerConnection.close();
      //   console.log("PeerConnection closed on component unmount.");
      // }
    };
  }, [otherSocketID, peerConnection]);

  // Start a call (generate and send an offer)

  useEffect(() => {
    if (otherSocketID && peerConnection) {
      console.log("USE EFFECT SocketID, peerConnection: ", {
        otherSocketID,
        peerConnection,
      });
      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && otherSocketID) {
          console.log("Sending ICE candidate to remote peer");
          socket.emit("ice:candidate", {
            candidate: event.candidate,
            to: otherSocketID,
          });
        }
      };
      if (flagValue) {
        startCall()
          .then(() => console.log("Call started!"))
          .catch((err) => console.error("Error starting call:", err));
      }
    }
  }, [otherSocketID, peerConnection]);
  const startCall = async () => {
    if (!peerConnection) {
      console.error("No PeerConnection available!");
      return;
    }

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    console.log("Sending offer to remote peer:", otherSocketID);
    socket.emit("created:offer", { offer, to: otherSocketID });
  };

  useEffect(() => {
    // Handle incoming offer
    socket.on("offer", async ({ offer, from }) => {
      console.log("Offer Socket is here: ", peerConnection);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer)
        );

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        console.log("Sending answer back to:", from);
        socket.emit("created:answer", { answer, to: from });
      }
    });

    // Handle incoming answer
    socket.on("answer", async ({ answer }) => {
      if (peerConnection) {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
        console.log("Remote description set with answer");
      }
    });

    // Handle incoming ICE candidates
    socket.on("ice:candidate", ({ candidate }) => {
      if (peerConnection) {
        peerConnection
          .addIceCandidate(new RTCIceCandidate(candidate))
          .then(() => console.log("ICE candidate added successfully"))
          .catch((err) => console.error("Error adding ICE candidate:", err));
      }
    });

    // Cleanup
    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice:candidate");
    };
  }, [otherSocketID, peerConnection]);

  useEffect(() => {
    console.log("Initializing PeerConnection");
    generatePeerConnection();
  }, []);

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex gap-4">
        {/* Local Video */}
        <video
          ref={videoRef}
          className="w-48 h-auto rounded-lg border-2 border-gray-300 shadow-lg"
          autoPlay
          playsInline
          muted
        />
        {/* Remote Video */}
        {showRemote && (
          <video
            ref={remoteRef}
            className="w-48 h-auto rounded-lg border-2 border-gray-300 shadow-lg"
            autoPlay
            playsInline
          />
        )}
      </div>
    </div>
  );
};

export default WebRTC;