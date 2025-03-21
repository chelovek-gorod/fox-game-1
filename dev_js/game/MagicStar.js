import { Sprite } from "pixi.js";
import { CEIL_HALF_SIZE, CEIL_SIZE, STAR, _2PI } from "../constants";
import { tickerAdd, tickerRemove } from "../engine/application";
import { sprites } from "../engine/loader"

export default class MagicStar extends Sprite {
    constructor(x, y, color) {
        super( sprites['star_' + color] )
        this.anchor.set(0.5)
        const rx = -CEIL_HALF_SIZE + Math.random() * CEIL_SIZE
        const ry = -CEIL_HALF_SIZE + Math.random() * CEIL_SIZE
        this.position.set(x + rx , y + ry)

        this.scale.set( STAR.scaleMin )
        this.rotation = _2PI * Math.random()

        this.alpha = 0
        this.isUp = true

        this.speedX = this.position.x < x ? -STAR.speedX : STAR.speedX
        this.speedY = -STAR.speedY

        this.lifeTime = STAR.lifeTimeMin + Math.random() * STAR.lifeTimeDelta

        tickerAdd(this)
    }

    tick(time) {
        this.x += time.elapsedMS * this.speedX
        this.y += time.elapsedMS * this.speedY
        this.lifeTime -= time.elapsedMS
        
        if (this.lifeTime < 0) {
            if (this.alpha > 0) {
                this.alpha -= STAR.alphaStep * time.elapsedMS
                this.scale.set( this.scale.x -= STAR.scaleStep * time.elapsedMS )
            } else {
                tickerRemove(this)
                this.parent.removeChild(this)
                this.destroy()
            }
            return
        }

        if (this.isUp) {
            this.alpha += STAR.alphaStep * time.elapsedMS
            this.scale.set( this.scale.x += STAR.scaleStep * time.elapsedMS )
            if (this.alpha >= STAR.alphaMax) this.isUp = false
        } else {
            this.alpha -= STAR.alphaStep * time.elapsedMS
            this.scale.set( this.scale.x -= STAR.scaleStep * time.elapsedMS )
            if (this.alpha <= 0) this.isUp = true
        }
    }
}