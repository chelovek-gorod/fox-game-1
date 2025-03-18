import { Container, Sprite } from "pixi.js";
import { DIRECTION, BUTTON } from "../constants";
import { tickerAdd, tickerRemove } from "../engine/application";
import { EventHub, events, getButtonClick, resetAllButtons } from "../engine/events";
import { sprites } from "../engine/loader";

let isButtonUsed = false
let isButtonActive = false

export default class Button extends Container {
    constructor(cx, cy, direction) {
        super()

        this.position.set(cx, cy)
        this.direction = direction

        this.base = new Sprite( sprites.button)
        this.base.eventMode = 'static'
        this.base.on('pointerdown', this.getClick.bind(this) )
        this.base.anchor.set(0.5)
        this.addChild(this.base)

        const arrowAngle = direction === DIRECTION.left ? -90
                         : direction === DIRECTION.right ? 90
                         : direction === DIRECTION.down ? 180 : 0

        this.arrow = new Sprite( sprites.button_arrow )
        this.arrow.anchor.set(0.5)
        this.arrow.angle = arrowAngle
        this.addChild(this.arrow)

        this.red = new Sprite( sprites.red_arrow )
        this.red.alpha = 0
        this.red.anchor.set(0.5)
        this.red.angle = arrowAngle
        this.addChild(this.red)

        this.light = new Sprite( sprites.blue_arrow )
        this.light.anchor.set(0.5)
        this.light.scale.set(BUTTON.lightScale)
        this.light.angle = arrowAngle
        this.addChild(this.light)

        this.isTrueClick = false

        EventHub.on( events.useButton, this.useButton, this)
        EventHub.on( events.resetAllButtons, this.resetButton, this)
    }

    getClick() {
        if (isButtonUsed || isButtonActive) return

        isButtonActive = true
        getButtonClick( this.direction )
    }

    useButton( data ) {
        isButtonUsed = data.isOk

        if (data.direction === this.direction) {
            this.isTrueClick = data.isOk
            if (!data.isOk) {
                this.red.alpha = 1
                this.light.alpha = 0
            }
            tickerAdd(this)
        } else {
            this.light.alpha = 0
        }      
    }

    resetButton() {
        tickerRemove(this)
        isButtonUsed = false
        isButtonActive = false
        this.isTrueClick = false
        this.light.scale.set(BUTTON.lightScale)
        this.red.alpha = 0
        this.light.alpha = 1
    }

    tick(time) {
        const step = time.elapsedMS * BUTTON.step

        if( this.isTrueClick ) {
            this.light.alpha -= step
            this.light.scale.set(this.light.scale.x + step)
            if (this.light.alpha <= 0) {
                tickerRemove(this)
                if (isButtonUsed === false) resetAllButtons()
            }
        } else {
            this.red.alpha -= step
            if (this.red.alpha <= 0) {
                tickerRemove(this)
                if (isButtonUsed === false) resetAllButtons()
            }
        }
    }
}