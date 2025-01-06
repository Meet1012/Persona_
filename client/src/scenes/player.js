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
    this.socket;
    this.otherPlayers = {};
    this.name = sessionStorage.getItem("MainPlayer");
    this.playerGroup = {};
  }

  preload() {
    this.load.spritesheet("monsterup", monsterup, {
      frameWidth: 663.25,
      frameHeight: 650,
      frameRate: 60,
    });
    this.load.spritesheet("monsterdown", monsterdown, {
      frameWidth: 663.25,
      frameHeight: 650,
      frameRate: 60,
    });
    this.load.spritesheet("monsterleft", monsterleft, {
      frameWidth: 663.25,
      frameHeight: 650,
      frameRate: 60,
    });
    this.load.spritesheet("monsterright", monsterright, {
      frameWidth: 663.25,
      frameHeight: 650,
      frameRate: 60,
    });
  }

  create() {
    this.createPlayerAnimations();
    this.socket = io("http://localhost:8000");

    // Main player setup
    this.player = this.physics.add
      .sprite(100, 100, "monsterdown")
      .setScale(0.05);
    this.player.setCollideWorldBounds(true);

    this.mainplayerText = this.add
      .text(this.player.x, this.player.y - 25, this.name, {
        font: "12px Arial",
        fill: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.socket.on("current:players", (players) => {
      Object.keys(players).forEach((nameID) => {
        if (nameID !== this.name) {
          this.addOtherPlayer(players[nameID], nameID);
        }
      });
    });

    this.socket.on("player:moved", ({ playerMoved, playerName }) => {
      const otherPlayerData = this.otherPlayers[playerName];
      if (otherPlayerData) {
        const { sprite, nameText } = otherPlayerData;
        sprite.setPosition(playerMoved.x, playerMoved.y);
        nameText.setPosition(playerMoved.x, playerMoved.y - 25);
        if (playerMoved.direction) {
          sprite.play(`walk${playerMoved.direction}`, true);
        } else {
          sprite.anims.stop();
        }
      }
    });

    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });



    // Collision Thing
    // this.player.setCollideWorldBounds(true); // Collide with world bounds
    // this.player.body.setBounce(0); // Disable bouncing
    // this.player.body.setFriction(1); // Increase friction to reduce slidingsd
  }

  update() {
    this.player.setVelocity(0);
    let direction = null;
    let moved = false;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-100);
      this.mainplayerText.setPosition(this.player.x, this.player.y - 25);
      this.player.play("walkleft", true);
      direction = "left";
      moved = true;
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(100);
      this.mainplayerText.setPosition(this.player.x, this.player.y - 25);
      this.player.play("walkright", true);
      direction = "right";
      moved = true;
    } else if (this.cursors.up.isDown) {
      this.player.setVelocityY(-100);
      this.mainplayerText.setPosition(this.player.x, this.player.y - 25);
      this.player.play("walkup", true);
      direction = "up";
      moved = true;
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(100);
      this.mainplayerText.setPosition(this.player.x, this.player.y - 25);
      this.player.play("walkdown", true);
      direction = "down";
      moved = true;
    } else {
      this.player.setVelocity(0);
      this.player.anims.stop();
    }

    if (!moved) {
      direction = null;
    }

    if (moved) {
      this.socket.emit("player:move", {
        name: this.name,
        x: this.player.x,
        y: this.player.y,
        direction,
      });
    }
    this.socket.emit("player:move", {
      name: this.name,
      x: this.player.x,
      y: this.player.y,
      direction,
    });
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

  addOtherPlayer(playerInfo, playerName) {
    const sprite = this.physics.add
      .sprite(playerInfo.x, playerInfo.y, "monsterdown")
      .setScale(0.05);

    const nameText = this.add
      .text(playerInfo.x, playerInfo.y - 25, playerName, {
        font: "12px Arial",
        fill: "#ffffff",
      })
      .setOrigin(0.5);
    this.otherPlayers[playerName] = { sprite, nameText };
    // this.physics.add.collider(this.player, sprite);
    // Object.values(this.otherPlayers).forEach(({ sprite: otherSprite }) => {
    //   console.log("Sprite Collision: ", sprite);
    //   this.physics.add.collider(this.player, otherSprite);
    // });
  }
}

export default GameScene;
