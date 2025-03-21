import { Container } from "pixi.js"
import { EventHub, events } from './engine/events'
import { getAppScreen, sceneAdd } from "./engine/application"
import { CEIL_SIZE, CEIL_HALF_SIZE, DIRECTION, BUTTON }  from "./constants"
import Background from "./game/Background"
import Ceil from './game/Ceil'
import Fox from './game/Fox'
import Button from './game/Button'
import Flower from "./game/Flower"
import Butterfly from "./game/Butterfly"
import TargetNumber from "./game/TargetNumber"

let game = null

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

export default function startGame(gameData) {
    if (game) game.reset(gameData)
    else game = new Game(gameData)
}

class Game {
    constructor(gameData) {
        this.bg = new Background()
        sceneAdd(this.bg)

        this.fox = null

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

        for(var bf = 0; bf < 4; bf++) {
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

        this.UIContainer = new Container()
        this.fillUI(gameData)
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

        const buttonsScale = quarterScreenHeight > BUTTON.size * 2 ? 1 : quarterScreenHeight / (BUTTON.size * 2)
        const offsetButtonsX = (screenData.width - BUTTON.size * 3 * buttonsScale) * 0.5
        this.UIContainer.scale.set(buttonsScale)
        this.UIContainer.position.set(offsetButtonsX, quarterScreenHeight + halfScreenHeight - halfCeilScaled * 0.5)
    }

    fillUI(gameData) {
        if (gameData.commands.length === 0) {
            this.controlWidth = BUTTON.size * 3
            this.controlHeight = BUTTON.size * 2

            this.btnUp = new Button(BUTTON.size * 1.5, BUTTON.size * 0.5, DIRECTION.up)
            this.btnDown = new Button(BUTTON.size * 1.5, BUTTON.size * 1.5, DIRECTION.down)
            this.btnLeft = new Button(BUTTON.size * 0.5, BUTTON.size * 1, DIRECTION.left)
            this.btnRight = new Button(BUTTON.size * 2.5, BUTTON.size * 1, DIRECTION.right)
            this.UIContainer.addChild(this.btnUp, this.btnDown, this.btnLeft, this.btnRight)
        }
        else alert('Game.fillControl(gameData) - Не заполнено поведение на различные команды')
    }

    fillWorld(gameData) {
        
        this.height = gameData.map.length * CEIL_SIZE
        this.width = gameData.map[0].length * CEIL_SIZE

        const numbers = []

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
                    case 'f' :
                        this.fox = new Fox(
                            x, y,
                            this.ceilContainer.children,
                            this.targetContainer.children,
                            gameData.magicLevel,
                            this.starContainer
                            )
                        this.unitContainer.addChild(this.fox)
                    break

                    case '1':
                    case '2':
                    case '3':
                    case '4':
                    case '5':
                    case '6':
                    case '7':
                    case '8':
                    case '8':
                        numbers.push(+ceilChar)
                        this.targetContainer.addChild(
                            new TargetNumber( x, y, +ceilChar, this.skyContainer, bfColorsList )
                        )
                    break
                }
            }
        }

        if (this.fox && numbers.length) this.fox.setTargetNumbers(numbers, this.targetContainer)
    }
}

document.addEventListener('keyup', getKeyUp)
function getKeyUp(event) {
    console.log('keyup event:', event)
}