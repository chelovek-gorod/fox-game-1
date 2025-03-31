import { Container, Graphics, Sprite } from "pixi.js"
import { sprites } from "../engine/loader"
import { setCursorPointer } from "../functions"
import { CP, COMMANDS, CMD_BLOCK } from "../constants"
import Command from "./Command"

export default class Stack extends Container {
    constructor(helps, commands) {
        super()

        this.commandsList = commands.slice(0, commands.length - helps)

        this.bg = new Graphics()
        this.bg.roundRect(CP.stackOffsetX, CP.stackOffsetY, CP.stackWidth, CP.stackHeight, CP.stackBorderRadius)
        this.bg.fill(CP.stackBGColor)
        this.bg.stroke({width: CP.boardBorderWidth, color: CP.stackBorderColor})
        this.addChild(this.bg)

        this.commands = new Container()

        this.scrollLeft = new Sprite(sprites.buttons.textures.scroll_button)
        this.scrollLeft.anchor.set(0.5)
        this.scrollLeft.scale.set(-1, 1)
        this.scrollLeft.position.set(CP.stackOffsetX, CP.stackOffsetY + CP.stackHeight * 0.5)
        this.addChild(this.scrollLeft)
        setCursorPointer(this.scrollLeft)

        this.scrollRight = new Sprite(sprites.buttons.textures.scroll_button)
        this.scrollRight.anchor.set(0.5)
        this.scrollRight.position.set(CP.stackOffsetX + CP.stackWidth, CP.stackOffsetY + CP.stackHeight * 0.5)
        this.addChild(this.scrollRight)
        setCursorPointer(this.scrollRight)

        // fill helps
        commands.forEach( (help, i) => {
            const x = i === 0 ? CMD_BLOCK.offsetX : CMD_BLOCK.offsetX + CMD_BLOCK.start + (i - 1) * CMD_BLOCK.action
            const helpBlock = new Sprite(sprites.commands.textures['gray_' + help])
            helpBlock.anchor.set(0, 1)
            helpBlock.position.set(x, CMD_BLOCK.offsetY)
            this.addChild(helpBlock)
        })

        // fill commands
        this.commandsList.forEach( (cmd, i) => {
            const x = i === 0 ? CMD_BLOCK.offsetX : CMD_BLOCK.offsetX + CMD_BLOCK.start + (i - 1) * CMD_BLOCK.action
            const command = new Command(cmd, x, CMD_BLOCK.offsetY)
            this.commands.addChild(command)
        })

        this.addChild(this.commands)
    }

    addCommand( command ) {
        // ... временно не обрабатываем циклы ...
        if (command.type === COMMANDS.loop) return command.kill()
        // -- //

        if (this.commands.children.length === 0) {
            if (command.type !== COMMANDS.start && command.type !== COMMANDS.startMessage) return command.kill()
            
            command.position.set(CMD_BLOCK.offsetX, CMD_BLOCK.offsetY)
            this.commands.addChild(command)
            this.commandsList = [command.type]
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
        this.commands.children.sort((a, b) => a.position.x - b.position.x)
        this.commandsList.length = 0
        this.commands.children.forEach( (cmd, i) => {
            cmd.position.x = i === 0 ? CMD_BLOCK.offsetX : CMD_BLOCK.offsetX + CMD_BLOCK.start + (i - 1) * CMD_BLOCK.action
            this.commandsList.push(cmd.type)
        })
    }

    commandReplaced(command) {
        if (command.type === COMMANDS.start || command.type === COMMANDS.startMessage) {
            command.position.set(CMD_BLOCK.offsetX, CMD_BLOCK.offsetY)
            return
        }

        command.position.y = CMD_BLOCK.offsetY
        // move to right from start command, if it is necessary
        if (command.x <= CMD_BLOCK.offsetX) command.position.x = CMD_BLOCK.offsetX + 5

        this.sortCommands()
    }

    clearStack() {
        while (this.commands.children.length > 0) {
            const cmd = this.commands.children[0]
            cmd.kill
            this.commands.removeChild(cmd)
        }
        this.commandsList.length = 0
        console.log('clearStack', this.commandsList)
    }
}