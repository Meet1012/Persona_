import React, { useEffect, useRef, useState } from "react";
import Phaser, { Scale } from "phaser";
import GameScene from "../scenes/player";
import MapScene from "../scenes/map";

const PhaserGame = () => {
  const gameContainerRef = useRef(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 1440,
      height: 640,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 0 },
          debug: true,
        },
      },
      scene: [MapScene, GameScene],
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

  return (
    <div className="flex">
      <div
        ref={gameContainerRef}
        id="phaser-container"
        className="w-full h-full"
      ></div>
    </div>
  );
};

export default PhaserGame;
