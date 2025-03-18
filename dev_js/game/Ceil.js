import { Container, Sprite } from "pixi.js";
import { CEIL_HALF_SIZE } from "../constants";
import { sprites } from "../engine/loader";

export default class Ceil extends Container {
    constructor(x, y) {
        super()

        this.image = new Sprite(sprites.ceil)
        this.image.alpha = 0.7
        this.addChild(this.image)
        this.position.set(x, y)

        this.item = null
    }

    addItem(item) { console.log(this.x, this.y)
        item.position.set(CEIL_HALF_SIZE, CEIL_HALF_SIZE)
        this.addChild(item)
        console.log(item.x, item.y)
    }
}