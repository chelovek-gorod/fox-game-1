import { AnimatedSprite } from "pixi.js";
import { ACTION, CEIL_OFFSET, COMMANDS, DIRECTION, HERO } from "../constants";
import { sprites } from "../engine/loader"
import { EventHub, events, useButton, resetAllButtons, restart } from '../engine/events'
import { tickerAdd, tickerRemove } from "../engine/application";
import MagicStar from "./MagicStar";
import { checkUseMessageFrom, collectTargetObject, gameWin, getTargetsCount } from "../game";

const star_colors = ['blue', 'purple', 'yellow', 'white', 'green']

export default class Hero extends AnimatedSprite {
    constructor(isFox, x, y, ceils, targets, magicLevel, starContainer, isCommandsAsButtons) {
        super( sprites[isFox ? 'fox' : 'bear'].animations.idle )
        this.anchor.set(0.5, isFox ? 0.7 : 0.8)
        this.position.set(x, y)

        this.startPoint = {x, y}

        this.animationSpeed = 0.5
        // this.loop = true // nod changed, and set PIXI bu default
        this.play()

        this.isFox = isFox
        this.AnimationsData = sprites[isFox ? 'fox' : 'bear'].animations

        this.actionsList = []
        this.isCommandsAsButtons = isCommandsAsButtons

        this.ceils = ceils
        this.targets = targets

        this.direction = DIRECTION.down
        this.isLastActionForward = false // use for continue run animation
        this.target = null

        this.startIdleTimeout = null // waiting time after use button (not used with CP)

        this.star_colors = []
        for(var ci = 0; ci < magicLevel || ci < star_colors.length; ci++) {
            this.star_colors.push( star_colors[ci] )
        }
        this.starContainer = starContainer
        this.magicLevel = magicLevel
        this.maxColorIndex = Math.ceil(magicLevel / 3)
        this.starInterval = null
        this.starTimeout = Math.ceil(600 / magicLevel)
        this.onOffStars(true)

        EventHub.on( events.getButtonClick, this.getAction, this )
        if (this.isFox) {
            EventHub.on( events.setFoxCommands, this.getActionsList, this)
        } else {
            EventHub.on( events.setBearCommands, this.getActionsList, this)
        }
        EventHub.on( events.changeFocus, this.onOffStars, this )
        EventHub.on( events.restart, this.restart, this )

        tickerRemove( this )
    }

    restart() {
        this.onLoop = null
        this.isLastActionForward = false
        if (this.startIdleTimeout) {
            clearTimeout(this.startIdleTimeout)
            this.startIdleTimeout = null
        }
        this.direction = DIRECTION.down
        tickerRemove(this)
        this.actionsList.length = 0
        this.position.set(this.startPoint.x, this.startPoint.y)
        this.scale.x = 1
        this.idle()
    }

    onOffStars(isOn) {
        if (!isOn) return clearInterval(this.starInterval)

        this.starInterval = (this.magicLevel > 0) ? setInterval( this.addStar.bind(this), this.starTimeout) : null
    }

    addStar() {
        const color = this.star_colors[ Math.floor( Math.random() * this.maxColorIndex ) ]
        this.starContainer.addChild( new MagicStar(this.x, this.y, color) )
    }

    getCeil(direction) {
        const offset = CEIL_OFFSET[direction]
        if (!offset) return null

        return this.ceils.find( ceil => ceil.x === this.x + offset.dx && ceil.y === this.y + offset.dy)
    }

    getActionsList( actions ) {
        this.actionsList = [...actions].reverse()
        this.actionsList.pop() // remove "START" or "START MESSAGE" command
        this.getAction( this.actionsList.pop() ) // RUN first command
    }

    // only if use CP
    nextAction() {
        this.onLoop = null // !!! clear after turnTo

        if (this.actionsList.length) return this.getAction( this.actionsList.pop() )

        // no more actions
        this.errorCommand(null)
    }

    getAction( action ) { console.log('getAction', action)
        // if all numbers and items collected
        if (getTargetsCount() === 0) return

        clearTimeout(this.startIdleTimeout)

        switch( action ) {
            case ACTION.use: this.useItem(); break

            case ACTION.left:
            case ACTION.right:
            case ACTION.up:
            case ACTION.down: this.moveByDirection( action ); break

            case ACTION.turnLeft: this.turnTo( DIRECTION.left ); break
            case ACTION.turnRight: this.turnTo( DIRECTION.right ); break
            case ACTION.forward: this.forward(); break

            case ACTION.use: this.useItem( action ); break
            case ACTION.message: this.sendMessage(); break

            default: this.errorCommand(action); break
        }
    }

    errorCommand(action) {
        if (this.isCommandsAsButtons) useButton({action: action, isOk: false})

        this.isLastActionForward = false

        if (this.direction !== DIRECTION.down) {
            this.scale.x = 1
            this.textures = this.AnimationsData[`turn_from_${this.direction}_to_${DIRECTION.down}`]
            this.gotoAndPlay(0)
            this.onLoop = this.showErrorAnimation.bind(this)
            return
        }

        return this.showErrorAnimation()
    }
    showErrorAnimation() {
        this.textures = this.AnimationsData.lose
        this.gotoAndPlay(0)
        this.onLoop = () => {
            if (this.isCommandsAsButtons) {
                resetAllButtons()
                this.idle()
                console.log('loop of showErrorAnimation')
            }
            else {
                restart()
            }
        }
    }

    win() {
        tickerRemove(this)
        this.onLoop = false
        if (this.startIdleTimeout) {
            clearTimeout(this.startIdleTimeout)
            this.startIdleTimeout = null // waiting time after use button (not used with CP)
        }
        if (this.direction !== DIRECTION.down) {
            this.scale.x = 1
            this.textures = this.AnimationsData[`turn_from_${this.direction}_to_${DIRECTION.down}`]
            this.gotoAndPlay(0)
            this.onLoop = this.showWinAnimation.bind(this)
            return
        }

        this.showWinAnimation()
    }
    showWinAnimation() {
        this.direction = DIRECTION.down
        this.textures = this.AnimationsData.win
        this.gotoAndPlay(0)
    }

    sendMessage(action) {
        this.isLastActionForward = false

        const isMessageSend = checkUseMessageFrom( this.isFox ? 'fox' : 'bear' )
        if (!isMessageSend) return this.errorCommand(action)
        
        if (this.direction !== DIRECTION.down) {
            this.scale.x = 1
            this.textures = this.AnimationsData[`turn_from_${this.direction}_to_${DIRECTION.down}`]
            this.gotoAndPlay(0)
            this.onLoop = this.idle.bind(this)
            return
        }

        return this.idle()
    }

    idle() { console.log('idle')
        this.onLoop = false
        this.isLastActionForward = false

        if (this.startIdleTimeout) {
            clearTimeout(this.startIdleTimeout)
            this.startIdleTimeout = null // waiting time after use button (not used with CP)
        }
        this.direction = DIRECTION.down

        this.textures = this.AnimationsData.idle
        this.gotoAndPlay(0)
    }

    useItem( action ) {
        this.isLastActionForward = false

        // find target in current ceil
        const target = this.targets.find( t => t.x === this.x && t.y === this.y )
        if (!target) return this.errorCommand(action)

        // check if game.js
        const isCollected = collectTargetObject(target)
        if(!isCollected ) return this.errorCommand(action)

        // check rest targets
        if (getTargetsCount() > 0) {
            if (this.isCommandsAsButtons) return this.waitNextButton()
            return this.nextAction()
        }

        // WIN
        gameWin() // game.js run win animation for all heroes
    }

    turnTo( side ) {
        this.isLastActionForward = false

        let targetDirection
        switch(this.direction) {
            case DIRECTION.down: targetDirection = side === DIRECTION.left ? DIRECTION.right : DIRECTION.left; break
            case DIRECTION.up: targetDirection = side; break
            case DIRECTION.left: targetDirection = side === DIRECTION.left ? DIRECTION.down : DIRECTION.up; break
            case DIRECTION.right: targetDirection = side === DIRECTION.left ? DIRECTION.up : DIRECTION.down; break
        }
        this.scale.x = 1
        this.textures = this.AnimationsData[`turn_from_${this.direction}_to_${targetDirection}`]
        this.direction = targetDirection
        this.gotoAndPlay(0)
        this.onLoop = this.nextAction.bind(this)
    }

    moveByDirection( direction ) {
        const targetCeil = this.getCeil(direction)
        if (!targetCeil) return this.errorCommand(direction)

        if (this.direction !== direction) {
            this.scale.x = 1
            this.isLastActionForward = false
            this.textures = this.AnimationsData[`turn_from_${this.direction}_to_${direction}`]
            this.direction = direction
            this.gotoAndPlay(0)
            this.onLoop = this.forward.bind(this)
        } else {
            this.forward()
        }

        this.target = {x: targetCeil.x, y: targetCeil.y}
    }

    forward() {
        // if called from this.getAction( action ) and action = forward
        if (!this.target) {
            const targetCeil = this.getCeil(this.direction)
            if (!targetCeil) return this.errorCommand(COMMANDS.forward)

            this.target = {x: targetCeil.x, y: targetCeil.y}
        }

        if (!this.isLastActionForward) {
            this.isLastActionForward = true

            let side;
            if (this.isFox) {
                this.scale.x = (this.direction === DIRECTION.left) ? -1 : 1
                side = (this.direction === DIRECTION.left) ? DIRECTION.right : this.direction
            } else {
                this.scale.x = (this.direction === DIRECTION.right) ? -1 : 1
                side = (this.direction === DIRECTION.right) ? DIRECTION.left : this.direction
            }
            this.textures = this.AnimationsData[`go_${side}`]
            this.gotoAndPlay(0)
        }
        tickerAdd(this)
    }

    endMove() {
        tickerRemove( this )
        console.log('end move')

        this.position.set(this.target.x, this.target.y)
        this.target = null
        
        if (this.isCommandsAsButtons) return this.waitNextButton()
        
        this.nextAction()
    }

    // only if use BUTTONS
    waitNextButton() {
        this.isLastActionForward = false

        this.scale.x = 1
        this.textures = this.AnimationsData.rotation
        switch (this.direction) {
            case DIRECTION.up : this.gotoAndStop(this.isFox ? 9 : 8); break
            case DIRECTION.left : this.gotoAndStop(4); break
            case DIRECTION.right : this.gotoAndStop(this.isFox ? 13 : 12); break
            default : this.gotoAndStop(0); break
        }

        this.startIdleTimeout = setTimeout( () => {
            if (this.direction !== DIRECTION.down) {
                this.textures = this.AnimationsData[`turn_from_${this.direction}_to_${DIRECTION.down}`]
                this.direction = DIRECTION.down
                this.gotoAndPlay(0)
                this.onLoop = this.idle.bind(this)
            } else {
                this.idle()
            }
        }, HERO.beforeIdleTimeout)
        
        resetAllButtons()
    }

    tick(time) {
        if (!this.target) return

        const speed = time.elapsedMS * HERO.speed

        if (this.direction === DIRECTION.left) {
            this.position.x -= speed
            if (this.position.x <= this.target.x) this.endMove()
            return 
        }
        if (this.direction === DIRECTION.right) {
            this.position.x += speed
            if (this.position.x >= this.target.x) this.endMove()
            return 
        }
        if (this.direction === DIRECTION.up) {
            this.position.y -= speed
            if (this.position.y <= this.target.y) this.endMove()
            return 
        }
        if (this.direction === DIRECTION.down) {
            this.position.y += speed
            if (this.position.y >= this.target.y) this.endMove()
            return 
        }
    }
}