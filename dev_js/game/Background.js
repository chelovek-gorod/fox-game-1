import { Container, TilingSprite } from "pixi.js";
import { BG } from "../constants";
import { sprites } from "../engine/loader";

export default class Background extends Container {
    constructor() {
        super()

        this.topTile = new TilingSprite(sprites.tile_bg_top)
        this.addChild(this.topTile)

        this.bottomTile = new TilingSprite(sprites.tile_bg_bottom)
        this.addChild(this.bottomTile)
    }

    screenResize(screenData, halfScreenHeight) {
        let scale = halfScreenHeight / BG.topHeight
        if (scale > 1) scale = 1

        const topHeight = BG.topHeight * scale
        this.bottomTile.position.set(0, topHeight)

        this.topTile.tileScale.set(scale)
        this.bottomTile.tileScale.set(scale)

        this.topTile.height = topHeight
        this.topTile.width = screenData.width
        this.bottomTile.width = screenData.width
        this.bottomTile.height = screenData.height - topHeight
    }
}