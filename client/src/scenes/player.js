import Phaser, { Game } from "phaser";
import monsterup from "../assets/character/upwalk_pokemon.png";
import monsterdown from "../assets/character/downwalk_pokemon.png";
import monsterleft from "../assets/character/leftwalk_pokemon.png";
import monsterright from "../assets/character/rightwalk_pokemon.png";
import { getPlayerSocket } from "./getPlayerSocket";
import { useSocket } from "../context/SocketProvider";
const collisionLayer = { layer: null };
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
    this.socket = getPlayerSocket();
    console.log("Socket created at Player.js");

    // Main player setup
    this.player = this.physics.add
      .sprite(141, 608, "monsterdown")
      .setScale(0.05)
      .setDepth(1);
    this.player.setCollideWorldBounds(true);
    console.log("PLayer Depth: ", this.player.depth);

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

    console.log("Collision Layer in player.js: ", collisionLayer.layer.layer);
    this.physics.add.collider(this.player, collisionLayer.layer.layer);
    collisionLayer.layer.layer.setCollisionBetween(0, 1);
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
    setTimeout(() => {
      this.socket.emit("player:move", {
        socketID: this.socket.id,
        username: this.name,
        x: this.player.x,
        y: this.player.y,
        direction,
      });
    }, 200);

    // Interaction overlap handling
    let interactionEnded = false;
    this.anyoverlap = false;
    this.intersectPlayer = null;

    Object.values(this.otherPlayers).forEach(({ sprite, playerName }) => {
      const overlap = Phaser.Geom.Intersects.RectangleToRectangle(
        this.player.getBounds(),
        sprite.getBounds()
      );

      if (overlap) {
        this.anyoverlap = true;
        this.intersectPlayer = { sprite, playerName };
      }
    });

    // If an overlap exists, handle interaction
    if (this.anyoverlap && this.intersectPlayer) {
      const { sprite, playerName } = this.intersectPlayer;
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
    } else {
      // No overlap detected
      if (this.interactContainer.visible) {
        this.interactContainer.setVisible(false);
        interactionEnded = true; // Mark that the interaction ended
      }
    }

    // Notify the server if the interaction has ended
    if (interactionEnded) {
      this.socket.emit("player:left");
      console.log("Interaction ended. Notification sent to the server.");
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
      console.log("Current Players: ", players);
      Object.keys(players).forEach((ID) => {
        if (players[ID].username !== this.name) {
          this.addOtherPlayer(players[ID], players[ID].username);
        }
      });
    });
    console.log("current:players set");

    //New player
    this.socket.on("new:player", (player) => {
      console.log("Player Details: ", player);
      this.addOtherPlayer(player[0], player[1]);
    });
    console.log("new:player set");

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
    console.log("player:moved set");

    // Handle interaction request
    this.socket.on("interaction:request", ({ from }) => {
      this.choiceContainer.setVisible(true);
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
    console.log("interaction:request set");

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
    console.log("interaction:response set");

    const name = sessionStorage.getItem("MainPlayer");
    console.log("Sending user joined : ", name);
    this.socket.emit("user:joined", name);

    this.socket.on("notification:recieved", ({ Name }) => {
      console.log("Player Name In Notification: ", Name);
      const notificationText =
        this.notificationContainer.getByName("notificationText");
      notificationText.setText(`${Name} has made a Ping !`);
      this.notificationContainer.setVisible(true);
      this.okayButton.on("pointerdown", () => {
        this.notificationContainer.setVisible(false);
      });
    });

    this.socket.on("player:disconnected", (ID) => {
      console.log("ID from Server: ", ID);

      // Find the player by socket ID
      const playerID = Object.keys(this.otherPlayers).find((playerID) => {
        return playerID === ID; // Ensure you return the comparison result
      });

      if (playerID) {
        console.log("Player Found: ", playerID);

        // Get the player's sprite from this.otherPlayers
        const playerData = this.otherPlayers[playerID];

        // Destroy the sprite and remove the player from otherPlayers
        if (playerData && playerData.sprite) {
          playerData.sprite.destroy(); // Destroy the sprite
          console.log(`Sprite for player ${playerID} destroyed.`);
        }
        if (playerData && playerData.nameText) {
          playerData.nameText.destroy();
        }

        // Remove the player from the otherPlayers object
        delete this.otherPlayers[playerID];
        console.log(`Player ${playerID} removed from otherPlayers.`);
      } else {
        console.log(`Player with ID ${ID} not found in otherPlayers.`);
      }

      console.log("Updated otherPlayers: ", this.otherPlayers);
    });
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
    const bg_choice = this.add
      .rectangle(0, 0, 300, 150, 0x000000, 0.8)
      .setOrigin(0.5);
    const acceptButton = this.add
      .text(-50, 0, "Accept", {
        font: "16px Arial",
        fill: "#00ff00",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
      })
      .setInteractive({ cursor: "pointer" });
    this.acceptButton = acceptButton; // Save for later use

    const rejectButton = this.add
      .text(50, 0, "Reject", {
        font: "16px Arial",
        fill: "#ff0000",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
      })
      .setInteractive({ cursor: "pointer" });
    this.rejectButton = rejectButton; // Save for later use

    const infoText = this.add
      .text(0, -50, "Accept Interaction?", {
        font: "16px Arial",
        fill: "#ffffff",
      })
      .setOrigin(0.5)
      .setName("infoText");

    this.choiceContainer.add([bg_choice, acceptButton, rejectButton, infoText]);
    this.choiceContainer.setVisible(false);

    this.notificationContainer = this.add.container(
      this.scale.width / 2,
      this.scale.height / 2
    );
    const notificationText = this.add
      .text(0, -50, "Notification from: ", {
        font: "16px Arial",
        fill: "#ffffff",
      })
      .setName("notificationText")
      .setOrigin(0.5);
    const bg_notification = this.add
      .rectangle(0, 0, 300, 150, 0x000000, 0.8)
      .setOrigin(0.5);
    const okayButton = this.add
      .text(50, 0, "OKAY", {
        font: "16px Retro",
        fill: "#00ff00",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
      })
      .setInteractive({ cursor: "pointer" });
    this.okayButton = okayButton;
    this.notificationContainer.add([
      bg_notification,
      notificationText,
      okayButton,
    ]);
    this.notificationContainer.setVisible(false);
  }
}
const getGameScene = (Layer) => {
  collisionLayer.layer = Layer;
  return GameScene;
};
export default getGameScene;
