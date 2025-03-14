import React, { useRef, useState, useEffect } from "react";
import { getPlayerSocket, closeSocket } from "../scenes/getPlayerSocket";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const WebRTC = () => {
  const videoRef = useRef(null);
  const remoteRef = useRef(null);
  const [peerConnection, setpeerConnection] = useState(null);
  const [otherSocketID, setotherSocketID] = useState();
  const [togeneratePeer, settogeneratePeer] = useState(false);
  const [flagValue, setFlagValue] = useState(false);
  const [showRemote, setShowRemote] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const socket = getPlayerSocket();

  const navigate = useNavigate();

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

        const audioTrack = localstream.getAudioTracks();
        audioTrack.forEach((track) => {
          track.enabled = isMicOn;
        });

        const videoTrack = localstream.getVideoTracks();
        videoTrack.forEach((track) => {
          track.enabled = isVideoOn;
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
  }, [otherSocketID, peerConnection, isMicOn, isVideoOn]);

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
    <div>
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
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
      <div className="fixed bottom-0 left-0 right-0 flex justify-center p-4 bg-[#2D1B4E]/90 backdrop-blur-sm">
        <div className="flex items-center gap-4 p-2 rounded-xl bg-[#735DA5] shadow-lg">
          {/* Mic Button */}
          <button
            onClick={() => setIsMicOn(!isMicOn)}
            className={`p-2 rounded-lg ${
              isMicOn
                ? "bg-[#D3C5E5] hover:bg-[#be9ce9]"
                : "bg-[#4A2B7F] hover:bg-[#3F2B5E]"
            } transition-colors`}
          >
            {isMicOn ? (
              <Mic className="w-4 h-4 text-[#2D1B4E]" />
            ) : (
              <MicOff className="w-4 h-4 text-[#D3C5E5]" />
            )}
          </button>

          {/* Video Button */}
          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`p-2 rounded-lg ${
              isVideoOn
                ? "bg-[#D3C5E5] hover:bg-[#be9ce9]"
                : "bg-[#4A2B7F] hover:bg-[#3F2B5E]"
            } transition-colors`}
          >
            {isVideoOn ? (
              <Video className="w-4 h-4 text-[#2D1B4E]" />
            ) : (
              <VideoOff className="w-4 h-4 text-[#D3C5E5]" />
            )}
          </button>

          {/* Leave Button */}
          <button
            onClick={() => {
              closeSocket();
              navigate("/");
            }}
            className="p-2 rounded-lg bg-red-500 hover:bg-red-600 transition-colors"
          >
            <PhoneOff className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WebRTC;
