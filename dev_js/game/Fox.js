import { AnimatedSprite } from "pixi.js";
import { CEIL_OFFSET, DIRECTION, FOX } from "../constants";
import { sprites } from "../engine/loader"
import { EventHub, events, useButton, resetAllButtons } from '../engine/events'
import { tickerAdd, tickerRemove } from "../engine/application";

export default class Fox extends AnimatedSprite {
    constructor(x, y, ceils) {
        super( sprites.fox.animations.idle )
        this.anchor.set(0.5, 0.7)
        this.position.set(x, y)

        this.animationSpeed = 0.5
        this.loop = true
        this.play()

        this.ceils = ceils

        this.direction = DIRECTION.down

        EventHub.on( events.getButtonClick, this.getCommand, this)
    }

    getCeil(direction) {
        const offset = CEIL_OFFSET[direction]
        if (!offset) return null

        return this.ceils.find( ceil => ceil.x === this.x + offset.dx && ceil.y === this.y + offset.dy)
    }

    getCommand( direction ) {
        const targetCeil = this.getCeil(direction)

        if (!targetCeil) {
            useButton({direction: direction, isOk: false})
            this.textures = sprites.fox.animations.lose
            this.gotoAndPlay(0)
            this.onLoop = this.commandDone.bind(this)
            return
        }

        useButton({direction: direction, isOk: true})

        if (this.direction !== direction) {
            this.textures = sprites.fox.animations[`turn_from_${this.direction}_to_${direction}`]
            this.direction = direction
            this.gotoAndPlay(0)
            this.onLoop = this.startMove.bind(this)
        } else {
            this.startMove()
        }

        this.target = {x: targetCeil.x, y: targetCeil.y, direction}
    }

    startMove() {
        this.scale.x = (this.direction === DIRECTION.left) ? -1 : 1
        const side = (this.direction === DIRECTION.left) ? DIRECTION.right : this.direction
        this.textures = sprites.fox.animations[`go_${side}`]
        this.gotoAndPlay(0)
        tickerAdd(this)
    }

    endMove() {
        this.scale.x = 1
        this.position.set(this.target.x, this.target.y)
        this.target = null
        tickerRemove( this )
        if (this.direction !== DIRECTION.down) {
            this.textures = sprites.fox.animations[`turn_from_${this.direction}_to_${DIRECTION.down}`]
            this.direction = DIRECTION.down
            this.gotoAndPlay(0)
            this.onLoop = this.commandDone.bind(this)
        } else {
            this.commandDone()
        }
        resetAllButtons()
    }

    commandDone() {
        this.textures = sprites.fox.animations.idle
        this.gotoAndPlay(0)
        resetAllButtons()
    }

    tick(time) {
        if (this.target === null) return tickerRemove( this )

        const speed = time.elapsedMS * FOX.speed
        if (this.target.direction === DIRECTION.left) {
            this.position.x -= speed
            if (this.position.x <= this.target.x) return this.endMove()
        }
        if (this.target.direction === DIRECTION.right) {
            this.position.x += speed
            if (this.position.x >= this.target.x) return this.endMove()
        }
        if (this.target.direction === DIRECTION.up) {
            this.position.y -= speed
            if (this.position.y <= this.target.y) return this.endMove()
        }
        if (this.target.direction === DIRECTION.down) {
            this.position.y += speed
            if (this.position.y >= this.target.y) return this.endMove()
        }
    }
}