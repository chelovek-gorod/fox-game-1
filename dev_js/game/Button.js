import { Container, Sprite } from "pixi.js";
import { ACTION, BUTTON } from "../constants";
import { tickerAdd, tickerRemove } from "../engine/application";
import { EventHub, events, getButtonClick, resetAllButtons } from "../engine/events";
import { sprites } from "../engine/loader";
import { setCursorPointer } from "../functions";

let isButtonUsed = false
let isButtonActive = false

export default class Button extends Container {
    constructor(cx, cy, action) {
        super()

        setCursorPointer(this)
        this.on('pointerdown', this.getClick, this)

        this.position.set(cx, cy)
        this.action = action

        this.base = new Sprite( sprites.button)
        this.base.anchor.set(0.5)
        this.addChild(this.base)

        const imageAngle = action === ACTION.left ? -90
                         : action === ACTION.right ? 90
                         : action === ACTION.down ? 180 : 0

        this.image = new Sprite( action === ACTION.use ? sprites.button_use : sprites.button_arrow )
        this.image.anchor.set(0.5)
        this.image.angle = imageAngle
        this.addChild(this.image)

        this.red = new Sprite( action === ACTION.use ? sprites.red_use : sprites.red_arrow )
        this.red.alpha = 0
        this.red.anchor.set(0.5)
        this.red.angle = imageAngle
        this.addChild(this.red)

        this.light = new Sprite( action === ACTION.use ? sprites.blue_use : sprites.blue_arrow )
        this.light.anchor.set(0.5)
        this.light.scale.set(BUTTON.lightScale)
        this.light.angle = imageAngle
        this.addChild(this.light)

        this.isTrueClick = false

        EventHub.on( events.useButton, this.useButton, this)
        EventHub.on( events.resetAllButtons, this.resetButton, this)
    }

    getClick() { console.log('click')
        if (isButtonUsed || isButtonActive) return

        isButtonActive = true
        getButtonClick( this.action )
    }

    useButton( data ) {
        isButtonUsed = data.isOk

        if (data.action === this.action) {
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