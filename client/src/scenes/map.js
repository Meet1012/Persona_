import Phaser, { Scale } from "phaser";

const collisionLayer = { layer: null };
class MapScene extends Phaser.Scene {
  constructor() {
    super("scene-map");
  }

  preload() {
    // Load map and tileset
    this.load.tilemapTiledJSON("map", "../src/assets/map/RoomMap/map.json");
    this.load.image("tiles", "../src/assets/map/RoomMap/office-tilemap-resized.jpg");
  }

  create() {
    // Load map and tileset layers
    const map = this.make.tilemap({ key: "map" });
    const tileset = map.addTilesetImage("TileSet", "tiles");

    // Create layers
    const baseLayer = map.createLayer("Base", tileset, 0, 0);
    // const treeLayer = map.createLayer("Trees", tileset, 0, 0);
    const wallsLayer = map.createLayer("Collision", tileset, 0, 0);
    // const roadLayer = map.createLayer("Road", tileset, 0, 0);
    // const houseLayer = map.createLayer("House", tileset, 0, 0);

    // Set collision on specific layers
    // wallsLayer.setCollisionByProperty({ collides: true });
    collisionLayer.layer = wallsLayer;
    console.log("Collision Layer in map.js: ", collisionLayer);
    this.scene.launch("scene-game");
  }

  update() {}
}

export default { MapScene, collisionLayer };
