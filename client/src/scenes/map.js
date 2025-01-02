import Phaser, { Scale } from "phaser";


class MapScene extends Phaser.Scene {
  constructor() {
    super("scene-map");
  }

  preload() {
    // Load map and tileset
    this.load.tilemapTiledJSON("map", "../src/assets/map/OfficeMap/map.json");
    this.load.image("tiles", "../src/assets/map/OfficeMap/Interiors.png");
  }

  create() {
    // Load map and tileset layers
    const map = this.make.tilemap({ key: "map" });
    const tileset = map.addTilesetImage("Interiors", "tiles");

    // Create layers
    const baseLayer = map.createLayer("Base", tileset, 0, 0);
    // const treeLayer = map.createLayer("Trees", tileset, 0, 0);
    const wallsLayer = map.createLayer("Wall", tileset, 0, 0);
    // const roadLayer = map.createLayer("Road", tileset, 0, 0);
    // const houseLayer = map.createLayer("House", tileset, 0, 0);

    // Set collision on specific layers
    wallsLayer.setCollisionByProperty({ collides: true });
    this.scene.launch("scene-game");
  }

  update() {}
}

export default MapScene;
