import { Container, Sprite } from "pixi.js";
import { sprites } from "../engine/loader";
import { EventHub, events } from "../engine/events";
import { tickerAdd, tickerRemove } from "../engine/application";
import MagicStar from "./MagicStar";
import { BLOCKAGE, STAR_COLORS } from "../constants";

export default class Blockage extends Container {
    constructor(x, y, starContainer, skyContainer, parentContainer) {
        super()

        this.position.set(x, y)

        this.starCount = BLOCKAGE.starCount
        this.starContainer = starContainer
        this.skyContainer = skyContainer

        this.startParent = parentContainer

        this.isBlocked = true

        this.branch_1 = new Sprite(sprites.blockage_1)
        this.branch_2 = new Sprite(sprites.blockage_2)
        this.branch_3 = new Sprite(sprites.blockage_3)
        this.branch_4 = new Sprite(sprites.blockage_4)
        this.branch_5 = new Sprite(sprites.blockage_5)
        this.branch_6 = new Sprite(sprites.blockage_6)
        this.shadow = new Sprite(sprites.blockage_shadow)
        this.addChild(this.shadow, this.branch_6, this.branch_5, this.branch_4,
            this.branch_3, this.branch_2, this.branch_1)

        this.items = [
            this.branch_1, this.branch_2, this.branch_3, this.branch_4, this.branch_5, this.branch_6, this.shadow
        ]

        this.items.forEach( item => item.anchor.set(0.5) )

        EventHub.on( events.restart, this.restart, this )
    }

    restart() {
        this.startParent.addChild(this)
        tickerRemove(this)

        this.isBlocked = true

        this.items.forEach( item => {
            item.alpha = 1
            item.y = 0
        })
    }

    unblock() {
        this.isBlocked = false
        this.skyContainer.addChild(this)
        tickerAdd(this)
    }

    tick(time) {
        if (this.starCount > 0){
            this.starCount--
            const color = STAR_COLORS[ Math.floor( Math.random() * STAR_COLORS.length ) ]
            this.starContainer.addChild( new MagicStar(this.x, this.y, color) )
        }

        this.items.forEach( (item, index) => {
            const rate = BLOCKAGE.startRate - index
            item.alpha -= rate * BLOCKAGE.alphaStep * time.elapsedMS
            if (index === this.items.length - 1) {
                if (item.alpha <= 0) tickerRemove(this)
            } else {
                item.y -= rate * BLOCKAGE.flyStep * time.elapsedMS
            }
        })
    }
}