import { Sprite } from "pixi.js";
import { sprites } from "../engine/loader"

export default class Flower extends Sprite {
    constructor(x, y, isFlowerToLeft) {
        super( sprites.flower )
        this.anchor.set(0.5, 0.5)
        this.position.set(x, y)
        this.scale.x = isFlowerToLeft ? -1 : 1

        this.isEmpty = true
    }
}