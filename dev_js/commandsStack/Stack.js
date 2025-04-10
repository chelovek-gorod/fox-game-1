import { Container, Graphics, Sprite } from "pixi.js"
import { sprites } from "../engine/loader"
import { setCursorPointer } from "../functions"
import { CP, COMMANDS, CMD_BLOCK } from "../constants"
import Command from "./Command"

export default class Stack extends Container {
    constructor(helps, commands, dragContainer) {
        super()

        this.bg = new Graphics()
        this.bg.roundRect(CP.stackOffsetX, CP.stackOffsetY, CP.stackWidth, CP.stackHeight, CP.stackBorderRadius)
        this.bg.fill(CP.stackBGColor)
        this.bg.stroke({width: CP.boardBorderWidth, color: CP.stackBorderColor})
        this.addChild(this.bg)

        this.helps = new Container()
        this.commands = new Container()

        this.scrollMask = new Graphics()
        this.scrollMask.roundRect(
            CP.stackOffsetX + CP.boardBorderWidth, CP.stackOffsetY + CP.boardBorderWidth,
            CP.stackWidth - CP.boardBorderWidth * 2, CP.stackHeight - CP.boardBorderWidth * 2,
            CP.stackBorderRadius
        )
        this.scrollMask.fill(0x000000)
        this.addChild(this.scrollMask)
        this.commands.mask = this.scrollMask
        this.helps.mask = this.scrollMask

        this.scrollX = 0

        this.scrollLeft = new Sprite(sprites.buttons.textures.scroll_button)
        this.scrollLeft.anchor.set(0.5)
        this.scrollLeft.scale.set(-1, 1)
        this.scrollLeft.position.set(CP.stackOffsetX, CP.stackOffsetY + CP.stackHeight * 0.5)
        setCursorPointer(this.scrollLeft)
        this.scrollLeft.on('pointerdown', this.scrollToLeft, this)

        this.scrollRight = new Sprite(sprites.buttons.textures.scroll_button)
        this.scrollRight.anchor.set(0.5)
        this.scrollRight.position.set(CP.stackOffsetX + CP.stackWidth, CP.stackOffsetY + CP.stackHeight * 0.5)
        setCursorPointer(this.scrollRight)
        this.scrollRight.on('pointerdown', this.scrollToRight, this)

        // fill helps
        commands.forEach( (help, i) => {
            const x = i === 0 ? CMD_BLOCK.offsetX : CMD_BLOCK.offsetX + CMD_BLOCK.start + (i - 1) * CMD_BLOCK.action
            const helpBlock = new Sprite(sprites.commands.textures['gray_' + help])
            helpBlock.anchor.set(0, 1)
            helpBlock.position.set(x, CMD_BLOCK.offsetY)
            this.helps.addChild(helpBlock)
        })

        // fill commands
        const readyCommands = commands.slice(0, commands.length - helps)
        readyCommands.forEach( (cmd, i) => {
            const point_x = CMD_BLOCK.offsetX + CMD_BLOCK.start + i * CMD_BLOCK.action
            this.addCommand( new Command(cmd, point_x, 0, dragContainer) )
        })

        this.addChild(this.helps, this.commands, this.scrollLeft, this.scrollRight)
    }

    addCommand( command ) {
        command.position.x -= this.scrollX

        if (this.commands.children.length === 0) {
            if (command.type !== COMMANDS.start && command.type !== COMMANDS.startMessage) return command.kill()
            
            command.position.set(CMD_BLOCK.offsetX, CMD_BLOCK.offsetY)
            this.commands.addChild(command)
        } else {
            if (command.type === COMMANDS.start || command.type === COMMANDS.startMessage) return command.kill()

            command.position.y = CMD_BLOCK.offsetY
            // move to right from start command, if it is necessary
            if (command.x <= CMD_BLOCK.offsetX) command.position.x = CMD_BLOCK.offsetX + 5

            this.commands.addChild(command)
            this.sortCommands()
        }
    }

    sortCommands() {
        if (this.commands.children.length === 0) return

        this.commands.children.sort((a, b) => a.position.x - b.position.x)
        
        let offsetX = CMD_BLOCK.offsetX

        let loopEndX = 0 // (_(x). end point of last loop command
        let loop = null

        this.commands.children.forEach( cmd => {
            if (cmd.type === COMMANDS.start || cmd.type === COMMANDS.startMessage) {
                // START COMMAND
                cmd.position.x = offsetX
                offsetX += CMD_BLOCK.start
            } else if (cmd.type === COMMANDS.loop) {
                // LOOP COMMAND
                // if previous command is loop too -> add loopEnd offset
                if (loop) offsetX += CMD_BLOCK.loopEnd + (loop.commandsInLoopCount === 0 ? CMD_BLOCK.loopEmptyOffset : 0)

                loop = cmd
                loop.resetLoopSize()
                loopEndX = loop.position.x + CMD_BLOCK.loop

                cmd.position.x = offsetX
                offsetX += CMD_BLOCK.loopStart
            } else {
                // ACTION COMMAND
                if (loop) {
                    if (cmd.position.x < loopEndX) {
                    // add action in loop
                        loop.addLoopCommandsCount()
                        loop.updateLoopSize()
                        loopEndX += CMD_BLOCK.action
                    } else {
                    // add action after loop
                        offsetX += CMD_BLOCK.loopEnd + (loop.commandsInLoopCount === 0 ? CMD_BLOCK.loopEmptyOffset : 0)
                        loopEndX = 0
                        loop = null
                    }
                }
                
                cmd.position.x = offsetX
                offsetX += CMD_BLOCK.action
            }
        })
        if (loop) loop.updateLoopSize()
    }

    commandReplaced(command) {
        command.position.x -= this.scrollX
        this.commands.addChild(command)

        if (command.type === COMMANDS.start || command.type === COMMANDS.startMessage) {
            command.position.set(CMD_BLOCK.offsetX, CMD_BLOCK.offsetY)
            return
        }

        if (command.type === COMMANDS.loop) command.resetLoopSize()

        command.position.y = CMD_BLOCK.offsetY
        // move to right from start command, if it is necessary
        if (command.x <= CMD_BLOCK.offsetX) command.position.x = CMD_BLOCK.offsetX + 5

        this.sortCommands()
    }

    startCommandRemoved() {
        let isStartCommandInStack = this.commands.children.find( cmd => cmd.type === COMMANDS.start || cmd.type === COMMANDS.startMessage )
        if (!isStartCommandInStack) this.clearStack()
    }

    clearStack() {
        while (this.commands.children.length > 0) {
            const cmd = this.commands.children[0]
            cmd.kill()
            this.commands.removeChild(cmd)
        }
    }

    scrollToLeft() {
        if (this.commands.getBounds().right < CMD_BLOCK.scrollSize) return

        this.scrollX -= CMD_BLOCK.scrollStep
        this.updateScroll()
    }

    scrollToRight() {
        if (this.scrollX === 0) return

        this.scrollX += CMD_BLOCK.scrollStep
        this.updateScroll()
    }

    updateScroll() {
        this.helps.position.x = this.scrollX
        this.commands.position.x = this.scrollX
    }

    getCommandsList( isMessage = false ) {
        if (this.commands.children.length < 2) return null
        if (this.commands.children[0].type !== (isMessage ? COMMANDS.startMessage : COMMANDS.start)) return null

        const commands = []
        let loopCommands = []
        let loopCount = 0
        let loopIndex = 0
        let loopIterations = 0
        let isGetEmptyLoop = false
        this.commands.children.forEach( cmd => {
            if (cmd.type === COMMANDS.start) return
            if (cmd.type === COMMANDS.startMessage) return
            if (cmd.type === COMMANDS.loop) {
                if (cmd.commandsInLoopCount === 0) {
                    isGetEmptyLoop = true
                    return
                }
                loopIndex = 0
                loopCount = cmd.commandsInLoopCount
                loopIterations = cmd.loopIterations
                return
            }

            // add loop commands
            if (loopCount) {
                loopCommands.push(cmd.type)

                loopIndex++
                if (loopIndex === loopCount) {
                    while (loopIterations > 0) {
                        loopIterations--
                        commands.push(...loopCommands)
                    }
                    loopIndex = 0
                    loopCount = 0
                    loopCommands.length = 0
                }
                return
            }

            // add action command
            commands.push(cmd.type)
        })

        if (isGetEmptyLoop) return null
        if (commands.length === 0) return null
        
        return commands.reverse()
    }
}