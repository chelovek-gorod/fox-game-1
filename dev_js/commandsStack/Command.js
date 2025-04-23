import { Sprite, TilingSprite, Container, Text, Graphics } from "pixi.js"
import { GlowFilter } from 'pixi-filters'
import { sprites } from "../engine/loader"
import { setCursorPointer } from "../functions"
import { CMD_BLOCK, COMMANDS, CP } from "../constants"
import { getAppPointer, tickerAdd, tickerRemove, sceneAdd, sceneRemove, getAppScreen } from "../engine/application"
import { textStyles } from "../engine/fonts"
import { EventHub, events } from '../engine/events'

let loopShell = null

class LoopShell extends Container {
    constructor() {
        super()
        this.isOpen = false
        this.fullWidth = 0
        this.fullHeight = 0
        this.calledLoopCommand = null // link to loop command, called LoopShell show
        this.shadow = new Graphics()
        setCursorPointer(this.shadow)
        this.shadow.on('pointerdown', this.close, this)
        this.buttons = new Container()
        for(let i = 2; i <= 10; i++) {
            const button = new Container()
            const buttonImage = new Sprite(sprites.commands.textures.loopEndArea)
            buttonImage.anchor.set(0.5)
            const buttonText = new Text({text: i, style: textStyles.loop})
            buttonText.anchor.set(0.5)
            button.addChild(buttonImage, buttonText)
            setCursorPointer(button)
            button.on('pointerdown', () => this.getButtonClick(i), this)
            const button_x = (i === 2 || i === 5 || i === 8) ? -60 : (i === 4 || i === 7 || i === 10) ? 60 : 0
            const button_y = (i < 5) ? -80 : (i > 7) ? 0 : -40
            button.position.set(button_x, button_y)
            this.buttons.addChild(button)
        }
        this.addChild(this.shadow, this.buttons)

        EventHub.on( events.screenResize, this.screenResize, this )
        this.screenResize( getAppScreen() )
    }

    screenResize( screenData ) {
        this.position.set(0, 0)
        this.fullWidth = screenData.width
        this.fullHeight = screenData.height
        if (!this.isOpen) return

        this.updateShadow()
    }

    updateShadow() {
        this.shadow.clear()
        this.shadow.rect(0, 0, this.fullWidth, this.fullHeight)
        this.shadow.fill(CP.boardBGColor)
        this.shadow.alpha = 0.5
    }

    open(loopCommand) {
        this.isOpen = true
        this.calledLoopCommand = loopCommand

        const commandPoint = loopCommand.countArea.getGlobalPosition()
        this.buttons.position.set(commandPoint.x, commandPoint.y)

        this.updateShadow()
        sceneAdd(this)
    }

    close() {
        this.isOpen = false
        this.calledLoopCommand = null

        this.shadow.clear()
        sceneRemove(this)
    }

    getButtonClick(count) {
        this.calledLoopCommand.setLoopIterations(count)
        this.close()
    }
}

export default class Command extends Container { 
    constructor(type, x, y, dragContainer, isMain = false) {
        super()
        if (type === COMMANDS.loop) {
            this.commandsInLoopCount = 0
            this.loopIterations = 2
            this.image = new Container()
            this.loopStart = new Sprite(sprites.commands.textures.loopStart) // 35x95
            this.loopStart.anchor.set(0, 1)
            this.loopStart.position.set(0, 0)
            this.loopTop = new TilingSprite(sprites.commands.textures.loopTop) // 5x16
            this.loopTop.anchor.set(0, 1)
            this.loopTop.position.set(35, 0)
            this.loopTop.width = 5
            this.loopEnd = new Container()
            this.loopEnd.position.set(35, 0)
            this.endImage = new Sprite(sprites.commands.textures.loopEnd) // 115x95
            this.endImage.anchor.set(0, 1)
            this.loopEnd.addChild(this.endImage)
            this.countArea = new Sprite(sprites.commands.textures.loopEndArea)
            this.countArea.anchor.set(0.5)
            this.countArea.position.set(58, -32)
            setCursorPointer(this.countArea)
            this.countArea.eventMode = "static"
            this.countArea.on('pointerdown', () => loopShell.open(this), this)
            this.loopEnd.addChild(this.countArea)
            this.countText = new Text({text: this.loopIterations, style: textStyles.loop})
            this.countText.anchor.set(0.5)
            this.countText.position.set(58, -32)
            this.countText.eventMode = "none"
            this.loopEnd.addChild(this.countText)
            this.image.addChild(this.loopStart, this.loopTop, this.loopEnd)

            if (!loopShell) loopShell = new LoopShell()
        } else {
            this.image = new Sprite(sprites.commands.textures[type])
            this.image.anchor.set(0, 1)
        }
        this.addChild(this.image)
        
        this.position.set(x, y)

        this.dragContainer = dragContainer

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

        setCursorPointer(this)
        this.isDragging = false
        this.cursorOffset = {x: 0, y: 0}
        this.on('pointerdown', this.pickUp, this)
        this.on('pointerup', this.pickDown, this)
        this.on('pointerupoutside', this.pickDown, this)
    }

    pickUp(event) {
        // check CP state
        if (this.dragContainer.isOnPlay) return 
        if (loopShell && loopShell.isOpen) return

        this.isDragging = true
        const mousePosition = event.data.getLocalPosition(this.parent)
        this.cursorOffset.x = this.x - mousePosition.x
        this.cursorOffset.y = this.y - mousePosition.y
        this.filters = [this.glowFilter]

        this.dragContainer.addChild(this)

        tickerAdd(this)
    }

    pickDown() {
        // for loop command if in stack and on count change and on dragging
        if (!this.isDragging) return

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
            if (this.startPoint === null) return this.dragContainer.commandReplaced(this)

            const x = this.x
            const y = this.y

            this.position.set(this.startPoint.x, this.startPoint.y)

            this.dragContainer.addCommandToStack( new Command(this.type, x, y, this.dragContainer) )
        } else {
            if (this.startPoint === null) return this.kill()
            
            this.position.set(this.startPoint.x, this.startPoint.y)
        }
    }

    setLoopIterations(count) {
        this.loopIterations = count
        this.countText.text = count
    }
    updateLoopSize() {
        this.loopTop.width = this.commandsInLoopCount * CMD_BLOCK.action
        this.loopEnd.position.x = this.loopTop.width + (this.commandsInLoopCount > 0 ? 20 : 35)
    }
    resetLoopSize() {
        this.commandsInLoopCount = 0
        this.updateLoopSize()
    }
    addLoopCommandsCount() {
        this.commandsInLoopCount++
        this.updateLoopSize()
    }

    tick() {
        if (!this.isDragging) return

        const mousePosition = getAppPointer(this.parent)
        this.x = mousePosition.x + this.cursorOffset.x
        this.y = mousePosition.y + this.cursorOffset.y
    }

    kill() { // use only with cloned commands
        this.off('pointerdown', this.pickUp, this)
        this.off('pointerup', this.pickDown, this)
        this.off('pointerupoutside', this.pickDown, this)
        if (this.type === COMMANDS.loop) this.countArea.off('pointerdown', () => loopShell.open(this), this)

        if (this.type === COMMANDS.start || this.type === COMMANDS.startMessage) {
            this.dragContainer.startCommandRemoved()
        }
        this.dragContainer.sortStackCommands()

        this.destroy()
    }
}