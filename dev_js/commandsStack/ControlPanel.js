import { Container, Graphics, Sprite } from "pixi.js"
import { DropShadowFilter } from 'pixi-filters'
import { CP, COMMANDS } from "../constants"
import { sprites } from "../engine/loader"
import { setCursorPointer } from "../functions"
import Command from "./Command"
import Stack from "./Stack"
import { EventHub, events, restart, setBearCommands, setFoxCommands } from "../engine/events"

export default class ControlPanel extends Container {
    constructor(fox, bear, commands) {
        super()

        this.isFoxActive = fox.isActive

        this.dropShadowFilter = new DropShadowFilter()
        this.dropShadowFilter.color = 0x000000
        this.dropShadowFilter.alpha = 0.5
        this.dropShadowFilter.offsetY = - 6
        //this.dropShadowFilter.blur = 6
        this.filters = [this.dropShadowFilter]

        this.isOnPlay = false

        // main board
        this.board = new Graphics()
        this.board.roundRect(0, CP.iconSize, CP.width, CP.height, CP.boardBorderRadius)
        this.board.fill(CP.boardBGColor)
        this.board.stroke({width: CP.boardBorderWidth, color: CP.boardBorderColor})

        if (fox.isActive) this.foxStack = new Stack(fox.helpCommandsCount, fox.startCommands)
        if (bear.isActive) this.bearStack = new Stack(bear.helpCommandsCount, bear.startCommands)

        if (fox.isActive && bear.isActive) {
            this.foxIcon = new Sprite(sprites.buttons.textures.fox_icon)
            this.foxIcon.anchor.set(0, 1)
            this.foxIcon.scale.set(1)
            this.foxIcon.position.set(CP.width - CP.boardBorderRadius - (bear.isActive ? CP.iconSize * 2 : 0) , CP.iconSize)
            setCursorPointer(this.foxIcon)
            this.foxIcon.on('pointerdown', () => this.changeHero('fox'), this)
            this.addChild(this.foxIcon)

            this.bearIcon = new Sprite(sprites.buttons.textures[ fox.isActive ? 'bear_icon_off' : 'bear_icon'])
            this.bearIcon.anchor.set(1, 1)
            this.bearIcon.scale.set(fox.isActive ? 0.9 : 1)
            this.bearIcon.position.set(CP.width - CP.boardBorderRadius, CP.iconSize)
            setCursorPointer(this.bearIcon)
            this.bearIcon.on('pointerdown', () => this.changeHero('bear'), this)
            this.addChild(this.bearIcon)
        }

        // start / stop buttons
        this.playPanel = new Graphics()
        this.playPanel.roundRect(CP.playPanelX, CP.playPanelY, CP.playPanelWidth, CP.playPanelHeight, CP.playPaneBorderRadius)
        this.playPanel.fill(CP.playPanelBGColor)
        this.playPanel.stroke({width: CP.boardBorderWidth, color: CP.boardBGColor})
        this.addChild(this.playPanel)

        this.startButton = new Sprite(sprites.buttons.textures.start_button)
        this.startButton.position.set(CP.playPanelPlayBtnLeft, CP.playPanelButtonTop)
        this.addChild(this.startButton)
        setCursorPointer(this.startButton)
        this.startButton.on('pointerdown', this.startCommands, this)

        this.stopButton = new Sprite(sprites.buttons.textures.stop_button_off)
        this.stopButton.anchor.set(1, 0)
        this.stopButton.position.set(CP.playPanelStopBtnRight, CP.playPanelButtonTop)
        this.addChild(this.stopButton)
        setCursorPointer(this.stopButton)
        this.stopButton.on('pointerdown', this.stopCommands, this)

        // add bg and stack
        this.addChild(this.board)
        this.addChild( fox.isActive ? this.foxStack : this.bearStack)

        // commands
        let lastCommandX = CP.startCommandX
        commands.forEach( cmd => {
            const command = new Command(cmd, lastCommandX, CP.startCommandY, true)
            this.addChild(command)

            lastCommandX += (cmd === COMMANDS.start || cmd === COMMANDS.startMessage)
            ? CP.runCommandWidth : cmd === COMMANDS.loop ? CP.loopCommandWidth : CP.otherCommandWidth
        })

        EventHub.on( events.restart, this.restart, this )
    }

    // SWITCH 
    changeHero(hero) {
        if (this.isFoxActive) {
            if (hero === 'fox') return

            this.removeChild(this.foxStack)
            this.addChild(this.bearStack)

            this.foxIcon.texture = sprites.buttons.textures.fox_icon_off
            this.bearIcon.texture = sprites.buttons.textures.bear_icon
            this.foxIcon.scale.set(0.9)
            this.bearIcon.scale.set(1)
        } else {
            if (hero === 'bear') return

            this.removeChild(this.bearStack)
            this.addChild(this.foxStack)

            this.foxIcon.texture = sprites.buttons.textures.fox_icon
            this.bearIcon.texture = sprites.buttons.textures.bear_icon_off
            this.foxIcon.scale.set(1)
            this.bearIcon.scale.set(0.9)
        }

        this.isFoxActive = !this.isFoxActive
    }

    // RUN
    startCommands() {
        if (this.isOnPlay) return

        if ('foxStack' in this
        && this.foxStack.commandsList.length > 1
        && this.foxStack.commandsList[0] === COMMANDS.start) {
            setFoxCommands( this.foxStack.commandsList )
            this.isOnPlay = true
        }

        if ('bearStack' in this
        && this.bearStack.commandsList.length > 1
        && this.bearStack.commandsList[0] === COMMANDS.start) {
            setBearCommands( this.bearStack.commandsList )
            this.isOnPlay = true
        }

        if (this.isOnPlay) {
            this.startButton.texture = sprites.buttons.textures.start_button_off
            this.stopButton.texture = sprites.buttons.textures.stop_button
        }
    }

    // STOP
    stopCommands() {
        if (!this.isOnPlay) return

        restart() // call even for all objects
    }
    restart() {
        this.startButton.texture = sprites.buttons.textures.start_button
        this.stopButton.texture = sprites.buttons.textures.stop_button_off
        this.isOnPlay = false

    }
}