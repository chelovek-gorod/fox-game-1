import { Container, Sprite } from "pixi.js";
import { NUMBER, _2PI, STAR_COLORS } from "../constants";
import { getAppScreen, tickerAdd, tickerRemove } from "../engine/application";
import { sprites } from "../engine/loader"
import TargetButterfly from "./TargetButterfly"
import MagicStar from "./MagicStar";
import { EventHub, events } from "../engine/events";

const upOffset = 10

export default class TargetItem extends Container {
    constructor(x, y, item, starContainer, sky, bfColorsList) {
        super()
        this.position.set(x, y)

        this.shadow = new Sprite( sprites.magic_items.textures[item + '_shadow'] )
        this.shadow.anchor.set(0.5, 0.5)
        this.minScale = 0.7 
        this.shadow.position.set(0, 0)

        this.image = new Sprite( sprites.magic_items.textures[item] )
        this.image.anchor.set(0.5, 0.75)
        this.image.scale.set(0.9)
        this.minY = -upOffset
        this.maxY = 0 
        this.isMoveUp = Math.random() < 0.5 ? true : false
        this.image.position.set(0, this.minY + Math.random() * upOffset)

        this.addChild(this.shadow, this.image)

        this.item = item
        this.starContainer = starContainer
        this.sky = sky

        this.bfColorsList = bfColorsList

        this.isCollected = false

        this.startData = {
            x: this.image.x, y: this.image.y, parent: null
        }

        this.starInterval = null
        this.onOffStars(true)
        EventHub.on( events.changeFocus, this.onOffStars, this )
        EventHub.on( events.restart, this.restart, this )

        tickerAdd(this)
    }

    restart() {
        if (this.startData.parent === null) return

        tickerRemove(this)

        this.isCollected = false
        this.image.alpha = 1
        this.image.scale.set(1)
        this.image.position.set(this.startData.x, this.startData.y)
        this.startData.parent.addChild(this)
        this.onOffStars(true)

        this.shadow.alpha = 1

        tickerAdd(this)

        this.startData.parent = null
    }

    onOffStars(isOn) {
        if (this.isCollected) return

        if (!isOn) clearInterval(this.starInterval)
        else this.starInterval = setInterval( this.addStar.bind(this), 300)
    }

    addStar() {
        const color = STAR_COLORS[ Math.floor( Math.random() * STAR_COLORS.length ) ]
        this.starContainer.addChild( new MagicStar(this.x, this.y, color) )
    }

    collected() {
        this.startData.parent = this.parent
        clearInterval(this.starInterval)
        this.sky.addChild(this)
        
        this.isCollected = true

        const bf_count = 7
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
        if (!this.isCollected) {
            const path = time.elapsedMS * NUMBER.speedY
            if (this.isMoveUp) {
                this.image.y -= path
                if (this.image.y <= this.minY) this.isMoveUp = !this.isMoveUp
            } else {
                this.image.y += path
                if (this.image.y >= this.maxY) this.isMoveUp = !this.isMoveUp
            }
            this.shadow.scale.set(this.minScale + 0.005 * this.image.position.y)
        
        } else {
            this.image.y += time.elapsedMS * NUMBER.speedY
            this.image.alpha -= time.elapsedMS * NUMBER.step
            this.image.scale.set( this.image.scale.x += NUMBER.step * time.elapsedMS )
            
            if (this.image.alpha <= 0) {
                tickerRemove(this)
                this.sky.removeChild(this)
            }
            this.shadow.scale.set(this.minScale + 0.005 * this.image.position.y)
            this.shadow.alpha = this.image.alpha
        }
    }
}