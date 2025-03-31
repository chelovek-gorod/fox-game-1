import { Sprite, Container, Text } from "pixi.js"
import { GlowFilter } from 'pixi-filters'
import { sprites } from "../engine/loader"
import { setCursorPointer } from "../functions"
import { COMMANDS, CP } from "../constants"
import { getAppPointer, tickerAdd, tickerRemove } from "../engine/application"
import { textStyles } from "../engine/fonts"

export default class Command extends Container { 
    constructor(type, x, y, isMain = false) {
        super()
        this.image = new Sprite(sprites.commands.textures[type])
        this.image.anchor.set(0, 1)
        this.addChild(this.image)

        this.position.set(x, y)

        this.type = type
        this.startPoint = isMain ? {x, y} : null

        this.glowFilter = new GlowFilter({
            distance: 15, // Расстояние от объекта
            outerStrength: 2, // Сила внешнего свечения
            innerStrength: 2, // Сила внутреннего свечения
            color: 0xffff00,
            quality: 1 // Качество
        })
        this.filters = []

        if (this.type === COMMANDS.loop) {
            this.loopCount = 2
            this.text = new Text({ text: this.loopCount, style: textStyles.loop })
            this.text.anchor.set(0.5)
            this.text.position.set(92, -32)
            this.addChild(this.text)
        }

        setCursorPointer(this)
        this.isDragging = false
        this.cursorOffset = {x: 0, y: 0}
        this.on('pointerdown', this.pickUp, this)
        this.on('pointerup', this.pickDown, this)
        this.on('pointerupoutside', this.pickDown, this)
    }

    pickUp(event) {
        // check CP state
        if ('isOnPlay' in this.parent) {
            if (this.parent.isOnPlay) return
        } else {
            if (this.parent.parent.parent.isOnPlay) return
        }

        this.isDragging = true
        const mousePosition = event.data.getLocalPosition(this.parent)
        this.cursorOffset.x = this.x - mousePosition.x
        this.cursorOffset.y = this.y - mousePosition.y
        this.filters = [this.glowFilter]

        // set in up layer
        const parent = this.parent
        parent.removeChild(this)
        parent.addChild(this)

        tickerAdd(this)
    }

    pickDown() {
        tickerRemove(this)
        this.isDragging = false
        this.filters = []

        return this.checkIsInStack()
    }

    checkIsInStack() {
        const mousePosition = getAppPointer(this.parent)
        const crossX = mousePosition.x > CP.stackOffsetX && mousePosition.x < CP.stackOffsetX + CP.stackWidth
        const crossY = mousePosition.y > CP.stackOffsetY && mousePosition.y < CP.stackOffsetY + CP.stackHeight

        if (crossX && crossY) {
            // if command is already in stack
            if (this.startPoint === null) return this.parent.parent.commandReplaced(this)

            const x = this.x
            const y = this.y

            this.position.set(this.startPoint.x, this.startPoint.y)

            const clone = new Command(this.type, x, y)
            if (this.parent.isFoxActive) this.parent.foxStack.addCommand(clone)
            else this.parent.bearStack.addCommand(clone)
        } else {
            if (this.startPoint === null) return this.kill()
            
            this.position.set(this.startPoint.x, this.startPoint.y)
        }
    }

    tick() {
        if (!this.isDragging) return

        const mousePosition = getAppPointer(this.parent)
        this.x = mousePosition.x + this.cursorOffset.x
        this.y = mousePosition.y + this.cursorOffset.y
    }

    kill() {
        this.off('pointerdown', this.pickUp, this)
        this.off('pointerup', this.pickDown, this)
        this.off('pointerupoutside', this.pickDown, this)

        if (this.parent) {
            const parent = this.parent
            parent.removeChild(this)
            if (this.type === COMMANDS.start || this.type === COMMANDS.startMessage) parent.parent.clearStack()
            else parent.parent.sortCommands()
        }

        this.destroy()
    }
}