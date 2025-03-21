import { AnimatedSprite } from "pixi.js";
import { sprites } from "../engine/loader"
import { tickerAdd, tickerRemove } from "../engine/application";
import { moveSprite } from '../functions';
import { BUTTERFLY } from "../constants";

export default class TargetButterfly extends AnimatedSprite {
    constructor(x, y, color, direction, screenWidth, screenHeight) {
        super( sprites[`bf_${color}`].animations.bf )
        this.anchor.set(0.5)
        this.scale.set(0)
        this.position.set(x, y)

        this.animationSpeed = BUTTERFLY.flyAnimationSpeed
        this.gotoAndPlay( Math.floor(Math.random() * this.textures.length) )

        this.maxX = screenWidth
        this.maxY = screenHeight

        this.rotation = direction

        this.speed = BUTTERFLY.flySpeed * 0.5 + Math.random() * (BUTTERFLY.flySpeed * 0.5)
        
        tickerAdd(this)
    }

    tick(time) {
        if (this.scale.x < BUTTERFLY.scaleMax) this.scale.set(this.scale.x + time.elapsedMS * BUTTERFLY.scaleStep)

        moveSprite(this, time.elapsedMS * this.speed)

        if (this.x < -200 || this.y < -200 || this.x > this.maxX + 200 || this.y > this.maxY + 200) {
            tickerRemove(this)
            this.destroy()
        }
    }
}