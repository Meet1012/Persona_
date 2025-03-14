import Phaser, { Scale } from "phaser";

const collisionLayer = { layer: null };
class MapScene extends Phaser.Scene {
  constructor() {
    super("scene-map");
  }

  preload() {
    // Load map and tileset
    this.load.tilemapTiledJSON(
      "map",
      "../src/assets/map/NewOfficeMap/map.json"
    );
    this.load.image("tiles", "../src/assets/map/NewOfficeMap/Office_Map.jpg");
  }

  create() {
    // Load map and tileset layers
    const map = this.make.tilemap({ key: "map" });
    const tileset = map.addTilesetImage("Office_Map", "tiles");

    // Create layers
    const wallsLayer = map.createLayer("Collision", tileset, 0, 0);
    const baseLayer = map.createLayer("Base", tileset, 0, 0).setDepth(0);
    const gateLayer = map.createLayer("Gate", tileset, 0, 0);

    // Set collision on specific layers
    wallsLayer.setVisible(false);
    collisionLayer.layer = wallsLayer;
    this.scene.launch("scene-game");
  }

  update() {}
}

export default { MapScene, collisionLayer };
