import { Sprite } from "pixi.js";
import { CEIL_OFFSET, DIRECTION, FOX_SPEED } from "../constants";
import { sprites } from "../engine/loader"
import { EventHub, events, useButton, resetAllButtons } from '../engine/events'
import { tickerAdd, tickerRemove } from "../engine/application";

export default class Fox extends Sprite {
    constructor(x, y, ceils) {
        super( sprites.fox )
        this.anchor.set(0.6, 0.75)
        this.position.set(x, y)

        this.ceils = ceils

        EventHub.on( events.getButtonClick, this.getButtonClick, this)
    }

    getCeil(direction) {
        const offset = CEIL_OFFSET[direction]
        if (!offset) return null

        return this.ceils.find( ceil => ceil.x === this.x + offset.dx && ceil.y === this.y + offset.dy)
    }

    getButtonClick( direction ) { console.log('Fox.getButtonClick()', direction)
        const targetCeil = this.getCeil(direction)
        if (!targetCeil) return useButton({direction: direction, isOk: false})

        useButton({direction: direction, isOk: true})

        if (direction === DIRECTION.left) this.scale.x = -1
        if (direction === DIRECTION.right) this.scale.x = 1

        this.target = {x: targetCeil.x, y: targetCeil.y, direction}
        tickerAdd(this)
    }

    endMove() {
        this.position.set(this.target.x, this.target.y)
        this.target = null
        tickerRemove( this )
        resetAllButtons()
    }

    tick(time) {
        if (this.target === null) return tickerRemove( this )

        const speed = time.elapsedMS * FOX_SPEED
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