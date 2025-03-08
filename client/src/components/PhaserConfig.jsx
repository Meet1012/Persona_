import React, { useEffect, useRef, useState } from "react";
import Phaser, { Scale } from "phaser";
import getGameScene from "../scenes/player";
import MapScene from "../scenes/map";

const PhaserGame = () => {
  const gameContainerRef = useRef(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 550,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 0 },
          debug: true,
        },
      },
      scene: [MapScene.MapScene, getGameScene(MapScene.collisionLayer)],
      scale: {
        pixelArt: true, // Add this line
      },
    };

    const game = new Phaser.Game(config);

    return () => {
      // Cleanup the Phaser instance when the component unmounts
      game.destroy(true);
    };
  }, []);

  return <div className="flex-1 bg-black" ref={gameContainerRef}></div>;
};

export default PhaserGame;
