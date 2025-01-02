import Phaser from "phaser";
import monsterup from "../assets/character/upwalk_pokemon.png";
import monsterdown from "../assets/character/downwalk_pokemon.png";
import monsterleft from "../assets/character/leftwalk_pokemon.png";
import monsterright from "../assets/character/rightwalk_pokemon.png";
import { io } from "socket.io-client";

class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game");
    this.cursor;
    this.player;
    this.playerId;
    this.mainplayerName;
    this.socket;
    this.otherPlayers = {};
  }

  preload() {
    this.load.spritesheet("monsterup", monsterup, {
      frameWidth: 663.25,
      frameHeight: 650,
    });
    this.load.spritesheet("monsterdown", monsterdown, {
      frameWidth: 663.25,
      frameHeight: 650,
    });
    this.load.spritesheet("monsterleft", monsterleft, {
      frameWidth: 663.25,
      frameHeight: 650,
    });
    this.load.spritesheet("monsterright", monsterright, {
      frameWidth: 663.25,
      frameHeight: 650,
    });
  }

  create() {
    this.createPlayerAnimations();
    this.socket = io("http://localhost:8000");
    this.player = this.physics.add
      .sprite(100, 100, "monsterdown")
      .setScale(0.05);
    this.socket.emit("main:player");
    this.socket.on("main:playerdone", ({ name }) => {
      this.mainplayerText = this.add
        .text(0, 0, name, {
          font: "12px Arial",
          fill: "#ffffff",
          fontStyle: "bold",
        })
        .setOrigin(0.5);
      this.mainplayerName = this.add.container(
        this.player.x,
        this.player.y - 25,
        [this.mainplayerText]
      );
    });

    this.socket.emit("current:players");
    this.socket.on("current:playersdone", (players, main_player) => {
      console.log("Current Players : ", players);
      const array = Object.values(players);
      console.log("Array Value: ", array[0]);
      for (let key in array[0]) {
        if (array[0][key].username != main_player) {
          console.log("Condition Matching: ", array[0][key].username != main_player)
          continue;
        }
        console.log("Key Value: ", array[0][key].username);
      }
    });

    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
  }

  update() {
    this.player.setVelocity(0);
    let direction = "down";
    let moved = false;
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-100);
      this.mainplayerName.setPosition(this.player.x, this.player.y - 25);
      this.player.play("walkleft", true);
      direction = "left";
      moved = true;
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(100);
      this.mainplayerName.setPosition(this.player.x, this.player.y - 25);
      this.player.play("walkright", true);
      direction = "right";
      moved = true;
    } else if (this.cursors.up.isDown) {
      this.player.setVelocityY(-100);
      this.mainplayerName.setPosition(this.player.x, this.player.y - 25);
      this.player.play("walkup", true);
      direction = "up";
      moved = true;
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(100);
      this.mainplayerName.setPosition(this.player.x, this.player.y - 25);
      this.player.play("walkdown", true);
      direction = "down";
      moved = true;
    } else {
      this.player.setVelocity(0);
      this.player.anims.stop();
    }

    if (moved) {
      this.socket.emit("player:move", {
        x: this.player.x,
        y: this.player.y,
        direction,
      });
    }
  }
  createPlayerAnimations() {
    this.anims.create({
      key: "walkup",
      frames: this.anims.generateFrameNumbers("monsterup", {
        frames: [0, 1, 2, 3],
      }),
      frameRate: 16,
      repeat: -1,
    });
    this.anims.create({
      key: "walkdown",
      frames: this.anims.generateFrameNumbers("monsterdown", {
        frames: [0, 1, 2, 3],
      }),
      frameRate: 16,
      repeat: -1,
    });
    this.anims.create({
      key: "walkleft",
      frames: this.anims.generateFrameNumbers("monsterleft", {
        frames: [0, 1, 2, 3],
      }),
      frameRate: 16,
      repeat: -1,
    });
    this.anims.create({
      key: "walkright",
      frames: this.anims.generateFrameNumbers("monsterright", {
        frames: [0, 1, 2, 3],
      }),
      frameRate: 16,
      repeat: -1,
    });
  }

  addOtherPlayer(playerInfo) {
    console.log("Player Info: ", playerInfo);
    const otherPlayerContainer = this.add.container(playerInfo.x, playerInfo.y);
    const otherPlayerSprite = this.add
      .sprite(0, 0, "monsterdown")
      .setScale(0.05);
    const otherPlayerName = this.add
      .text(0, -25, playerInfo.name, {
        font: "14px Roboto Slab",
      })
      .setOrigin(0, 0);
    otherPlayerContainer.add([otherPlayerSprite, otherPlayerName]);
    console.log("ID in add", typeof playerInfo.id);
    this.otherPlayers[playerInfo.id] = otherPlayerContainer;
  }
}

export default GameScene;
