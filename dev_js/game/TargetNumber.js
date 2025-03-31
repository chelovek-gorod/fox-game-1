import { Sprite } from "pixi.js";
import { NUMBER, _2PI } from "../constants";
import { getAppScreen, tickerAdd, tickerRemove } from "../engine/application";
import { sprites } from "../engine/loader"
import TargetButterfly from "./TargetButterfly"
import { EventHub, events } from "../engine/events";

export default class TargetNumber extends Sprite {
    constructor(x, y, number, sky, bfColorsList) {
        super( sprites['target_' + number] )
        this.anchor.set(0.5, 0.6)
        this.position.set(x, y)
        this.number = number
        this.sky = sky

        this.startData = {
            x, y, parent: null
        }

        this.bfColorsList = bfColorsList

        EventHub.on( events.restart, this.restart, this )
    }

    restart() {
        if (this.startData.parent === null) return

        tickerRemove(this)
        this.alpha = 1
        this.scale.set(1)
        this.position.set(this.startData.x, this.startData.y)
        this.startData.parent.addChild(this)

        this.startData.parent = null
    }

    collected() {
        this.startData.parent = this.parent
        this.sky.addChild(this)
        tickerAdd(this)

        const bf_count = this.number
        const screen = getAppScreen()
        const startAngle = _2PI * Math.random()
        const stepAngle = _2PI / bf_count

        for(var bf = 0; bf < bf_count; bf++) {
            this.sky.addChild(
                // x, y, color, direction, screenWidth, screenHeight
                new TargetButterfly(
                    this.x, this.y, this.bfColorsList[ bf % this.bfColorsList.length ],
                    startAngle + stepAngle * bf, screen.width, screen.height
                )
            )
        }
    }

    tick(time) {
        this.y += time.elapsedMS * NUMBER.speedY
        this.alpha -= time.elapsedMS * NUMBER.step
        this.scale.set( this.scale.x += NUMBER.step * time.elapsedMS )
        
        if (this.alpha <= 0) {
            tickerRemove(this)
            this.parent.removeChild(this)
        }
    }
}