import { AnimatedSprite } from "pixi.js";
import { sprites } from "../engine/loader"
import { tickerAdd, tickerRemove } from "../engine/application";
import { getDistance, moveSprite, turnSpriteToTarget } from '../functions';
import { BUTTERFLY, CEIL_HALF_SIZE, _2PI } from "../constants";

export default class Butterfly extends AnimatedSprite {
    constructor(width, height, color, flowers, container) {
        super( sprites[`bf_${color}`].animations.bf )
        this.anchor.set(0.5)
        this.scale.set(BUTTERFLY.scaleMax)
        this.position.set(Math.random() * width, Math.random() * height)
        this.container = container

        this.animationSpeed = BUTTERFLY.flyAnimationSpeed
        this.gotoAndPlay( Math.floor(Math.random() * this.textures.length) )

        this.flowers = flowers
        this.areaWidth = width
        this.areaHeight = height

        this.rotation = _2PI * Math.random()

        this.isOnFlower = false
        this.targetFlower = undefined
        this.targetPoint = this.getTargetPoint()
        
        tickerAdd(this)
    }

    getTargetPoint() {
        this.isTurnedToTarget = false
        this.targetFlower = this.flowers.find( flower => flower.isEmpty )
        if (this.targetFlower) {
            this.targetFlower.isEmpty = false
            return {x: this.targetFlower.x, y: this.targetFlower.y}
        }
        return {x: Math.random() * this.areaWidth, y: Math.random() * this.areaHeight}
    }

    landing(delta) {
        const path = delta * BUTTERFLY.landingSpeed
        const turnSpeed = delta * BUTTERFLY.landingTurnSpeed
        const distance = getDistance(this, this.targetPoint)
        // turn to target
        if (!this.isTurnedToTarget) {
            this.isTurnedToTarget = turnSpriteToTarget(this, this.targetPoint, turnSpeed)
        }
        // fly to target
        if (distance > path) return moveSprite(this, path)

        this.scale.set(this.scale.x - delta * BUTTERFLY.scaleStep)

        if (this.scale.x <= BUTTERFLY.scaleMin) {
            this.scale.set( BUTTERFLY.scaleMin )
            tickerRemove(this)
            this.animationSpeed = BUTTERFLY.idleAnimationSpeed
            this.timer = setTimeout( () => {
                this.animationSpeed = BUTTERFLY.flyAnimationSpeed
                const currentFlower = this.targetFlower
                this.isOnFlower = false
                this.targetFlower = undefined
                this.targetPoint = this.getTargetPoint()
                currentFlower.isEmpty = true
                tickerAdd(this)
                this.container.addChild(this)
            }, BUTTERFLY.landingTimeoutMin + Math.random() * BUTTERFLY.landingTimeoutDelta )
        }
    }

    takeoff(delta) {
        this.scale.set(this.scale.x + delta * BUTTERFLY.scaleStep)
        if (this.scale.x >= BUTTERFLY.scaleMax) this.scale.set( BUTTERFLY.scaleMax )
    }

    tick(time) {
        if (this.isOnFlower) return this.landing(time.elapsedMS)
        if (this.scale.x < BUTTERFLY.scaleMax) return this.takeoff(time.elapsedMS)

        const path = time.elapsedMS * BUTTERFLY.flySpeed
        const turnSpeed = time.elapsedMS * BUTTERFLY.turnSpeed
        const distance = getDistance(this, this.targetPoint)

        // turn to target
        if (!this.isTurnedToTarget) {
            this.isTurnedToTarget = turnSpriteToTarget(this, this.targetPoint, turnSpeed)
        }

        // fly to target
        if (distance > CEIL_HALF_SIZE) return moveSprite(this, path)

        // on target
        if (this.targetFlower) {
            this.isOnFlower = true
            this.targetFlower.parent.addChild(this)
        }
        else this.targetPoint = this.getTargetPoint()
    }
}