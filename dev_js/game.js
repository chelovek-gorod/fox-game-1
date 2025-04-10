import { Container } from "pixi.js"
import { EventHub, events, setBearCommands, setFoxCommands } from './engine/events'
import { getAppScreen, sceneAdd } from "./engine/application"
import { CEIL_SIZE, CEIL_HALF_SIZE, ACTION, BUTTON, CP, COMMANDS }  from "./constants"
import Background from "./game/Background"
import Ceil from './game/Ceil'
import Hero from './game/Hero'
import Button from './game/Button'
import Flower from "./game/Flower"
import Butterfly from "./game/Butterfly"
import TargetNumber from "./game/TargetNumber"
import TargetItem from "./game/TargetItem"
import ControlPanel from "./commandsStack/ControlPanel"

let game = null

export function gameWin() {
    if (game.fox) game.fox.win()
    if (game.bear) game.bear.win()
}

export function checkUseMessageFrom(hero) {
    let foxCommands = null
    let bearCommands = null

    // from 'fox' to 'bear'
    if (hero === 'fox' && 'bearStack' in game.UIContainer) {
        bearCommands = game.UIContainer.bearStack.getCommandsList(true)
        if (bearCommands) {
            setBearCommands(bearCommands)
            return true
        }
    }

    // from 'bear' to 'fox'
    if(hero === 'bear' && 'foxStack' in game.UIContainer) {
        foxCommands = game.UIContainer.foxStack.getCommandsList(true)
        if (foxCommands) {
            setFoxCommands(foxCommands)
            return true
        }
    }

    return false
}

export function getTargetsCount() {
    return (game.numbers.length + game.items.length)
}

export function collectTargetObject( target ) {
    if('number' in target) {
        if (target.number !== game.numbers[game.numbers.length - 1])  return false

        target.collected()
        game.numbers.pop()
        return true
    }

    if('item' in target) {
        const itemIndex = game.items.indexOf(target.item)
        if (itemIndex === -1) return console.error(`${target.item} in game.items is not found! ${game.items}`)

        target.collected()
        game.items.splice(itemIndex, 1)
        return true
    }

    return false
}

const flowerListCounter = [false, true, false]
const flowerCountSize = flowerListCounter.length
let flowerCountIndex = 0 // Math.floor(Math.random() * flowerCountSize)
let isFlowerToLeft = Math.random() < 0.5 ? true : false
function checkFlowerInPoint() {
    flowerCountIndex++
    if (flowerCountIndex === flowerCountSize) flowerCountIndex = 0
    if (flowerListCounter[flowerCountIndex]) isFlowerToLeft = !isFlowerToLeft
    return flowerListCounter[flowerCountIndex]
}

const bfColorsList = ['blue', 'purple', 'white', 'yellow']

EventHub.on(events.restart, () => game.restart() )

export default function startGame(gameData) {
    if (game) game.restart()
    else game = new Game(gameData)
}

class Game {
    constructor(gameData) {
        this.bg = new Background()
        sceneAdd(this.bg)

        this.isCommandsAsButtons = gameData.commands.length === 0

        this.fox = null
        this.Bear = null

        this.numbers = []
        this.items = []

        this.worldContainer = new Container()
        sceneAdd(this.worldContainer)

        this.ceilContainer = new Container()
        this.flowersContainer = new Container()
        this.flowersContainer.position.set(CEIL_HALF_SIZE, CEIL_HALF_SIZE)
        this.targetContainer = new Container()
        this.targetContainer.position.set(CEIL_HALF_SIZE, CEIL_HALF_SIZE)
        this.unitContainer = new Container()
        this.unitContainer.position.set(CEIL_HALF_SIZE, CEIL_HALF_SIZE)
        this.starContainer = new Container()
        this.starContainer.position.set(CEIL_HALF_SIZE, CEIL_HALF_SIZE)
        this.skyContainer = new Container()
        this.skyContainer.position.set(CEIL_HALF_SIZE, CEIL_HALF_SIZE)
        this.worldContainer.addChild(
            this.ceilContainer,
            this.flowersContainer,
            this.targetContainer,
            this.unitContainer,
            this.starContainer, 
            this.skyContainer
        )

        this.fillWorld(gameData)

        let bfCount = this.flowersContainer.children.length || 1
        if (bfCount > 4) bfCount = 4
        for(var bf = 0; bf < bfCount; bf++) {
            this.skyContainer.addChild(
                new Butterfly(
                    this.width,
                    this.height,
                    bfColorsList[ bf % bfColorsList.length ],
                    this.flowersContainer.children,
                    this.skyContainer
                )
            )
        }

        if (this.isCommandsAsButtons) {
            this.UIContainer = new Container()
            this.fillUI()
        } else {
            this.UIContainer = new ControlPanel(gameData.fox, gameData.bear, gameData.commands)
        }
        sceneAdd(this.UIContainer)

        EventHub.on( events.screenResize, this.screenResize, this )

        this.screenResize( getAppScreen() )
    }

    screenResize(screenData) {
        const halfScreenHeight = Math.floor(screenData.centerY)
        const quarterScreenHeight = Math.floor(halfScreenHeight * 0.5)

        this.bg.screenResize(screenData, halfScreenHeight)

        const gameWidth = (this.width + CEIL_SIZE)
        const gameHeight = (this.height + CEIL_SIZE)

        const scaleX = screenData.width / gameWidth
        const scaleY = halfScreenHeight / gameHeight
        let scale = scaleX < scaleY ? scaleX : scaleY
        if (scale > 1) scale = 1

        this.worldContainer.scale.set( scale )

        const gameScaledWidth = gameWidth * scale
        const offsetX = (screenData.width - gameScaledWidth) * 0.5
        const halfCeilScaled = CEIL_HALF_SIZE * scale
        this.worldContainer.position.set(offsetX + halfCeilScaled, quarterScreenHeight + halfCeilScaled)

        if (this.isCommandsAsButtons) {
            const buttonsScale = quarterScreenHeight > BUTTON.size * 2 ? 1 : quarterScreenHeight / (BUTTON.size * 2)
            const offsetButtonsX = (screenData.width - BUTTON.size * 5 * buttonsScale) * 0.5
            this.UIContainer.scale.set(buttonsScale)
            this.UIContainer.position.set(offsetButtonsX, quarterScreenHeight + halfScreenHeight - halfCeilScaled * 0.5)
        } else {
            let CPScale = quarterScreenHeight > CP.height ? 1 : quarterScreenHeight / (CP.height + CP.bottomOffset + CP.iconSize * 0.5)
            const CPWidth = (CP.width + CP.bottomOffset * 2)
            if ((CPScale * CPWidth) > screenData.width) CPScale = screenData.width / CPWidth
            this.UIContainer.scale.set(CPScale)
            const UIx = (screenData.width - (CPScale * CP.width)) * 0.5
            const UIy = screenData.height - (CP.height + CP.bottomOffset + CP.iconSize) * CPScale
            this.UIContainer.position.set( UIx, UIy )
        }
    }

    fillUI() {
        this.controlWidth = BUTTON.size * 3
        this.controlHeight = BUTTON.size * 2

        this.btnUp = new Button(BUTTON.size * 1.5, BUTTON.size * 0.5, ACTION.up)
        this.btnDown = new Button(BUTTON.size * 1.5, BUTTON.size * 1.5, ACTION.down)
        this.btnLeft = new Button(BUTTON.size * 0.5, BUTTON.size * 1, ACTION.left)
        this.btnRight = new Button(BUTTON.size * 2.5, BUTTON.size * 1, ACTION.right)
        this.btnUse = new Button(BUTTON.size * 4.5, BUTTON.size * 1, ACTION.use)
        this.UIContainer.addChild(this.btnUp, this.btnDown, this.btnLeft, this.btnRight, this.btnUse)
    }

    fillWorld(gameData) {
        
        this.height = gameData.map.length * CEIL_SIZE
        this.width = gameData.map[0].length * CEIL_SIZE

        for(var stepY = 0;  stepY < gameData.map.length; stepY++) {

            const y = stepY * CEIL_SIZE

            for(var stepX = 0;  stepX < gameData.map[stepY].length; stepX++) {
                const x = stepX * CEIL_SIZE

                const ceilChar = gameData.map[stepY][stepX]

                if (ceilChar === ' ') {
                    if (checkFlowerInPoint()) {
                        this.flowersContainer.addChild( new Flower(x, y, isFlowerToLeft) )
                    }
                    continue
                }
                
                const ceil = new Ceil(x, y)
                this.ceilContainer.addChild( ceil )

                switch(ceilChar) {
                    case 'F' :
                    case 'B' :
                        const hero = new Hero(
                            ceilChar === 'F', // isFox
                            x, y,
                            this.ceilContainer.children,
                            this.targetContainer.children,
                            gameData.magicLevel,
                            this.starContainer,
                            this.isCommandsAsButtons,
                            )
                        this.unitContainer.addChild(hero)
                        if (ceilChar === 'F') this.fox = hero
                        else this.bear = hero
                    break

                    case '1':
                    case '2':
                    case '3':
                    case '4':
                    case '5':
                    case '6':
                    case '7':
                    case '8':
                    case '9':
                        this.numbers.push(+ceilChar)
                        this.targetContainer.addChild(
                            new TargetNumber( x, y, +ceilChar, this.skyContainer, bfColorsList )
                        )
                    break

                    case 's': // 'broom'
                    case 'b': // 'book'
                    case 'h': // 'hat'
                    case 'w': // 'wand'
                    case 'p': // 'potion'
                        let item = 'broom'
                        if (ceilChar === 'b') item = 'book'
                        else if (ceilChar === 'h') item = 'hat'
                        else if (ceilChar === 'w') item = 'wand'
                        else if (ceilChar === 'p') item = 'potion'
                        this.items.push(item)
                        this.targetContainer.addChild(
                            new TargetItem( x, y, item, this.starContainer, this.skyContainer, bfColorsList )
                        )
                    break
                }
            }
        }

        this.numbers.sort((a, b) => b - a)
        
        this.startNumbers = [...this.numbers]
        this.startItems = [...this.items]
    }

    restart() {
        this.numbers = [...this.startNumbers]
        this.items = [...this.startItems]
    }
}

document.addEventListener('keyup', getKeyUp)
function getKeyUp(event) {
    console.log('keyup event:', event)
}