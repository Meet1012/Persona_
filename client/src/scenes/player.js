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
    this.interactContainer;
    this.interactKey;
    this.choiceContainer;
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
    this.socket = io("localhost:8000");

    // Main player setup
    this.player = this.physics.add
      .sprite(100, 100, "monsterdown")
      .setScale(0.05);
    this.player.setCollideWorldBounds(true);

    this.mainplayerText = this.add
      .text(this.player.x, this.player.y - 25, this.name, {
        font: "12px Arial",
        fill: "#000000",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Socket listeners
    this.setupSocketListeners();

    // Keyboard controls
    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.interactKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.X
    );

    // Interaction UI
    this.createInteractionUI();
  }

  update() {
    this.player.setVelocity(0);
    let direction = null;
    let moved = false;

    // Movement handling
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

    // Emit player movement to server
    this.socket.emit("player:move", {
      name: this.name,
      x: this.player.x,
      y: this.player.y,
      direction,
    });

    this.anyoverlap;
    this.intersectPlayer = null;
    // console.log("Other Players: ", this.otherPlayers);
    // Check for collisions with other players
    Object.values(this.otherPlayers).forEach(({ sprite, playerName }) => {
      const overlap = Phaser.Geom.Intersects.RectangleToRectangle(
        this.player.getBounds(),
        sprite.getBounds()
      );
      if (overlap) {
        this.anyoverlap = true;
        this.intersectPlayer = { sprite, playerName };
      } else {
        // console.log("Collision Is Removed Here !");
        this.interactContainer.setVisible(false);
      }

      if (this.anyoverlap && this.intersectPlayer) {
        const { sprite, playerName } = this.intersectPlayer;
        // console.log("Collision Is Done Here Between: ", this.name, playerName);
        this.interactContainer.setPosition(sprite.x, sprite.y - 50);
        this.interactContainer.setVisible(true);
        if (this.interactKey.isDown) {
          console.log("Request Sent !", playerName);
          this.socket.emit("interact:request", {
            from: this.name,
            to: playerName,
          });
          this.updateRequestMessage("Request Sent! Waiting for Reply......", 0);
        }
      }
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
        fill: "#000000",
      })
      .setOrigin(0.5);
    this.otherPlayers[playerName] = { sprite, nameText, playerName };
  }

  updateRequestMessage(message, duration) {
    this.requestMessage.setText(message);
    this.requestMessage.setVisible(true);
    if (duration > 0) {
      this.time.delayedCall(duration, () => {
        this.requestMessage.setVisible(false);
      });
    }
  }

  setupSocketListeners() {
    // Sync players
    this.socket.on("current:players", (players) => {
      Object.keys(players).forEach((nameID) => {
        if (nameID !== this.name) {
          this.addOtherPlayer(players[nameID], nameID);
        }
      });
    });

    //New player
    this.socket.on("new:player", (player) => {
      console.log("Player Details: ", player);
      this.addOtherPlayer(player[0], player[1]);
    });

    // Handle player movement
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

    // Handle interaction request
    this.socket.on("interaction:request", ({ from }) => {
      this.choiceContainer.setVisible(true);
      console.log("Choice Container on !!");
      const infoText = this.choiceContainer.getByName("infoText");
      infoText.setText(`${from} wants to interact. Accept?`);
      this.acceptButton.on("pointerdown", () => {
        this.socket.emit("interact:response", {
          from,
          to: this.name,
          accepted: true,
        });
        this.choiceContainer.setVisible(false);
      });
      this.rejectButton.on("pointerdown", () => {
        this.socket.emit("interact:response", {
          from,
          to: this.name,
          accepted: false,
        });
        this.choiceContainer.setVisible(false);
      });
    });

    // Handle interaction response
    this.socket.on(
      "interaction:response",
      ({ accepted, from, fromSocket, toSocket }) => {
        console.log("Interaction Response GOT !!!!");
        if (accepted) {
          this.updateRequestMessage(`Interaction accepted by ${from}!`, 3000);
          this.socket.emit("new:private", { fromSocket, toSocket });
        } else {
          this.updateRequestMessage(`${from} rejected your interaction.`, 3000);
        }
      }
    );
  }

  createInteractionUI() {
    this.interactContainer = this.add.container(0, 0);
    this.interactText = this.add.text(0, 0, "Press X to Interact", {
      font: "14px Arial",
      fill: "#000000",
      backgroundColor: "#888888",
      padding: { x: 5, y: 5 },
    });
    this.interactText.setOrigin(0.5);
    this.interactContainer.add([this.interactText]);
    this.interactContainer.setVisible(false);

    this.requestMessage = this.add
      .text(this.scale.width / 2, 50, "", {
        font: "18px Arial",
        fill: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 10, y: 10 },
      })
      .setOrigin(0.5)
      .setVisible(false);

    this.choiceContainer = this.add.container(
      this.scale.width / 2,
      this.scale.height / 2
    );
    const bg = this.add.rectangle(0, 0, 300, 150, 0x000000, 0.8).setOrigin(0.5);
    const acceptButton = this.add
      .text(-50, 0, "Accept", {
        font: "16px Arial",
        fill: "#00ff00",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
      })
      .setInteractive();
    this.acceptButton = acceptButton; // Save for later use

    const rejectButton = this.add
      .text(50, 0, "Reject", {
        font: "16px Arial",
        fill: "#ff0000",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
      })
      .setInteractive();
    this.rejectButton = rejectButton; // Save for later use

    const infoText = this.add
      .text(0, -50, "Accept Interaction?", {
        font: "16px Arial",
        fill: "#ffffff",
      })
      .setOrigin(0.5)
      .setName("infoText");

    this.choiceContainer.add([bg, acceptButton, rejectButton, infoText]);
    this.choiceContainer.setVisible(false);
  }
}

export default GameScene;
