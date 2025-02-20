import React, { useRef, useState, useEffect } from "react";
import { getPlayerSocket } from "../scenes/getPlayerSocket";

const WebRTC = () => {
  const videoRef = useRef(null);
  const remoteRef = useRef(null);
  const [peerConnection, setpeerConnection] = useState(null);
  const [otherSocketID, setotherSocketID] = useState();
  const [togeneratePeer, settogeneratePeer] = useState(false);
  const [flagValue, setFlagValue] = useState(false);
  const [showRemote, setShowRemote] = useState(false);
  const socket = getPlayerSocket();

  // Initialize PeerConnection
  const generatePeerConnection = () => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" }, // Free Google STUN Server
        // {
        //   urls: "turn:global.relay.metered.ca:443",
        //   username: "f6507426c0f4f89d0bda02e2",
        //   credential: "7YF0907XexAfvkbL",
        // },
      ],
    });

    // Add this: Handle incoming tracks from remote peer
    peer.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        remoteRef.current.srcObject = event.streams[0];
      }
    };
    // Add this: Handle ICE candidate generation
    peer.onicecandidate = (event) => {
      console.log("Sending ICE Candidate !!");
      if (event.candidate) {
        socket.emit("ice:candidate", {
          candidate: event.candidate,
          to: otherSocketID,
        });
      }
    };

    setpeerConnection(peer);
    return peer;
  };
  // Handle private accepted event
  socket.on("private:accepted", ({ to, flag }) => {
    setotherSocketID(to);
    settogeneratePeer(true);
    setFlagValue(flag);
    setShowRemote(true);
  });

  socket.on("remove:private", () => {
    settogeneratePeer(false);
    setShowRemote(false);
  });

  const startCall = () => {
    console.log("Started Call !!");
    peerConnection.onnegotiationneeded = async () => {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      console.log("Offer Generated !");
      console.log("Sending offer to : ", otherSocketID);
      socket.emit("created:offer", { offer, to: otherSocketID });
    };
  };

  useEffect(() => {
    // Access local video stream
    const getUserMedia = async () => {
      console.log("Executed User Media !!");
      try {
        const localstream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = localstream;
        }
        if (peerConnection) {
          localstream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, localstream);
            console.log("Added track:", track.kind);
          });
        }
      } catch (err) {
        console.error("Error accessing local media:", err);
      }
    };

    getUserMedia();

    // Cleanup
    return () => {};
  }, [otherSocketID, peerConnection]);

  useEffect(() => {
    if (togeneratePeer) {
      generatePeerConnection();
    } else {
      if (peerConnection) {
        console.log("Peer Connection Closing: ", peerConnection);
        peerConnection.close();
        setpeerConnection(null);
      }
    }
  }, [togeneratePeer]);

  useEffect(() => {
    console.log("Peer Connection generate Peer: ", peerConnection);
    if (flagValue && peerConnection) {
      startCall();
    }

    return () => {};
  }, [peerConnection]);

  useEffect(() => {
    socket.on("offer", async ({ offer, from }) => {
      console.log("Offer Recieved: ", offer);
      console.log("From: ", from);
      if (peerConnection.signalingState != "stable") {
        console.log("State not Stable");
        await Promise.all([
          peerConnection.setLocalDescription({ type: "rollback" }),
          peerConnection.setRemoteDescription(new RTCSessionDescription(offer)),
        ]);
      } else {
        peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      }
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      console.log("Sending Answer Back to: ", from);
      socket.emit("created:answer", { answer, to: from });
    });

    socket.on("answer", async ({ answer, from }) => {
      console.log("Recieved Answer: ", answer);
      console.log("From: ", from);
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
      console.log("Answer Set to Remote Description !", peerConnection);
    });

    socket.on("newice:candidate", ({ candidate, from }) => {
      if (peerConnection) {
        peerConnection
          .addIceCandidate(new RTCIceCandidate(candidate))
          .then(() => console.log("Added ICE Candidate!"))
          .catch((err) => console.error("Error adding ICE candidate:", err));
      }
    });

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("newice:candidate");
    };
  }, [otherSocketID, peerConnection]);

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
