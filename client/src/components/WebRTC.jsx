import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const WebRTC = ({ username, players }) => {
  const [localStream, setLocalStream] = useState(null);
  const [connections, setConnections] = useState({});
  const socket = useRef(io("http://localhost:8000"));

  useEffect(() => {
    // Get local media stream
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        const localVideo = document.getElementById("local-video");
        if (localVideo) {
          localVideo.srcObject = stream;
        }
      });

    // Handle incoming WebRTC signaling
    socket.current.on("webrtc:offer", async ({ offer, fromName }) => {
      const peer = createPeerConnection(fromName);
      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.current.emit("webrtc:answer", {
        toName: fromName,
        answer,
        fromName: username,
      });
    });

    socket.current.on("webrtc:answer", ({ answer, fromName }) => {
      connections[fromName].setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.current.on("webrtc:candidate", ({ candidate, fromName }) => {
      connections[fromName].addIceCandidate(new RTCIceCandidate(candidate));
    });

    return () => {
      Object.values(connections).forEach((peer) => peer.close());
    };
  }, [connections]);

  const createPeerConnection = (name) => {
    const peer = new RTCPeerConnection();

    // Add local tracks to peer
    localStream.getTracks().forEach((track) => peer.addTrack(track, localStream));

    // Handle incoming streams
    peer.ontrack = (event) => {
      const remoteVideo = document.getElementById(`video-${name}`);
      if (!remoteVideo) {
        const video = document.createElement("video");
        video.id = `video-${name}`;
        video.srcObject = event.streams[0];
        video.autoplay = true;
        video.playsInline = true;
        document.getElementById("remote-videos").appendChild(video);
      }
    };

    // Handle ICE candidates
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.current.emit("webrtc:candidate", {
          toName: name,
          candidate: event.candidate,
          fromName: username,
        });
      }
    };

    setConnections((prev) => ({ ...prev, [name]: peer }));
    return peer;
  };

  const createOffer = async (name) => {
    const peer = createPeerConnection(name);
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket.current.emit("webrtc:offer", { toName: name, offer, fromName: username });
  };

  useEffect(() => {
    // Initiate WebRTC connections with all other players
    Object.keys(players).forEach((name) => {
      if (name !== username && !connections[name]) {
        createOffer(name);
      }
    });
  }, [players, connections]);

  return (
    <div>
      <div id="local-video-container">
        <video id="local-video" autoPlay playsInline muted />
      </div>
      <div id="remote-videos"></div>
    </div>
  );
};

export default WebRTC;
