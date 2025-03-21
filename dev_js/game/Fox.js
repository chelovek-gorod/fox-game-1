import { AnimatedSprite } from "pixi.js";
import { CEIL_OFFSET, DIRECTION, FOX } from "../constants";
import { sprites } from "../engine/loader"
import { EventHub, events, useButton, resetAllButtons } from '../engine/events'
import { tickerAdd, tickerRemove } from "../engine/application";
import MagicStar from "./MagicStar";

const star_colors = ['blue', 'purple', 'yellow', 'white', 'green']

export default class Fox extends AnimatedSprite {
    constructor(x, y, ceils, targets, magicLevel, starContainer) {
        super( sprites.fox.animations.idle )
        this.anchor.set(0.5, 0.7)
        this.position.set(x, y)

        this.animationSpeed = 0.5
        this.loop = true
        this.play()

        this.ceils = ceils
        this.targets = targets
        this.numbers = []

        this.direction = DIRECTION.down

        this.idleTimer = null

        this.star_colors = []
        for(var ci = 0; ci < magicLevel || ci < star_colors.length; ci++) {
            this.star_colors.push( star_colors[ci] )
        }
        this.starContainer = starContainer
        this.starTimeout = Math.floor(1000 / magicLevel)
        this.starInterval = setInterval( this.addStar.bind(this), this.starTimeout)

        EventHub.on( events.getButtonClick, this.getCommand, this)
    }

    addStar() {
        const color = this.star_colors[ Math.floor( Math.random() * this.star_colors.length ) ]
        this.starContainer.addChild( new MagicStar(this.x, this.y, color) )
    }

    setTargetNumbers(numbers) {
        this.numbers = [...numbers.sort((a, b) => b - a)]
        console.log(this.numbers)
    }

    getCeil(direction) {
        const offset = CEIL_OFFSET[direction]
        if (!offset) return null

        return this.ceils.find( ceil => ceil.x === this.x + offset.dx && ceil.y === this.y + offset.dy)
    }

    getCommand( direction ) {
        if (this.numbers.length === 0) return

        clearTimeout(this.idleTimer)
        const targetCeil = this.getCeil(direction)

        if (!targetCeil) {
            useButton({direction: direction, isOk: false})

            if (this.direction !== DIRECTION.down && this.direction !== direction) {
                this.textures = sprites.fox.animations[`turn_from_${this.direction}_to_${DIRECTION.down}`]
                this.gotoAndPlay(0)
                this.onLoop = this.errorCommand.bind(this)
            } else {
                this.errorCommand()
            }

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

    errorCommand() {
        this.direction = DIRECTION.down
        this.textures = sprites.fox.animations.lose
        this.gotoAndPlay(0)
        this.onLoop = this.startIdle.bind(this)
    }

    startMove() {
        this.onLoop = null
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

        const targetNumber = this.targets.find( n => n.x === this.x && n.y === this.y )
        if (targetNumber && targetNumber.number === this.numbers[this.numbers.length - 1]) {
            targetNumber.collected()
            this.numbers.pop()
        }
        if (this.numbers.length === 0) {
            if (this.direction !== DIRECTION.down) {
                this.textures = sprites.fox.animations[`turn_from_${this.direction}_to_${DIRECTION.down}`]
                this.direction = DIRECTION.down
                this.gotoAndPlay(0)
                this.onLoop = this.win()
            } else {
                this.win()
            }
            return
        }

        this.textures = sprites.fox.animations.rotation
        switch (this.direction) {
            case DIRECTION.up : this.gotoAndStop(9); break
            case DIRECTION.left : this.gotoAndStop(4); break
            case DIRECTION.right : this.gotoAndStop(13); break
            default : this.gotoAndStop(0); break
        }

        this.idleTimer = setTimeout( () => {
            if (this.direction !== DIRECTION.down) {
                this.textures = sprites.fox.animations[`turn_from_${this.direction}_to_${DIRECTION.down}`]
                this.direction = DIRECTION.down
                this.gotoAndPlay(0)
                this.onLoop = this.startIdle.bind(this)
            } else {
                this.startIdle()
            }
        }, FOX.beforeIdleTimeout)
        
        resetAllButtons()
    }

    startIdle() {
        this.direction = DIRECTION.down
        this.onLoop = null
        clearTimeout( this.idleTimer )
        this.textures = sprites.fox.animations.idle
        this.gotoAndPlay(0)
    }

    win() {
        // this.loop = false
        clearTimeout( this.idleTimer )
        this.textures = sprites.fox.animations.win
        this.gotoAndPlay(0)
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