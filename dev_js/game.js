import { Container, TilingSprite, Text, Sprite } from "pixi.js"
import { EventHub, events } from './engine/events'
import { getAppScreen, sceneAdd } from "./engine/application"
import { sprites } from "./engine/loader"
import { CEIL_SIZE, CEIL_HALF_SIZE, DIRECTION, BUTTON }  from "./constants"
import Background from "./game/Background"
import Ceil from './game/Ceil'
import Fox from './game/Fox'
import Button from './game/Button'

let game = null

export default function startGame(gameData) {
    if (game) game.reset(gameData)
    else game = new Game(gameData)
}

class Game {
    constructor(gameData) {
        this.bg = new Background()
        sceneAdd(this.bg)

        this.ceilContainer = new Container()
        this.unitContainer = new Container()
        this.fillCeils(gameData)
        sceneAdd(this.ceilContainer, this.unitContainer)

        this.controlContainer = new Container()
        this.fillControl(gameData)
        sceneAdd(this.controlContainer)

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

        const gameScaledWidth = gameWidth * scale

        this.ceilContainer.scale.set( scale )
        this.unitContainer.scale.set( scale )

        const offsetX = (screenData.width - gameScaledWidth) * 0.5
        const halfCeilScaled = CEIL_HALF_SIZE * scale
        this.ceilContainer.position.set(offsetX + halfCeilScaled, quarterScreenHeight + halfCeilScaled)
        this.unitContainer.position.set(offsetX + halfCeilScaled * 2, quarterScreenHeight + halfCeilScaled * 2)

        const buttonsScale = quarterScreenHeight > BUTTON.size * 2 ? 1 : quarterScreenHeight / (BUTTON.size * 2)
        const offsetButtonsX = (screenData.width - BUTTON.size * 3 * buttonsScale) * 0.5
        this.controlContainer.scale.set(buttonsScale)
        this.controlContainer.position.set(offsetButtonsX, quarterScreenHeight + halfScreenHeight - halfCeilScaled * 0.5)
    }

    fillControl(gameData) {
        if (gameData.commands.length === 0) {
            this.controlWidth = BUTTON.size * 3
            this.controlHeight = BUTTON.size * 2

            this.btnUp = new Button(BUTTON.size * 1.5, BUTTON.size * 0.5, DIRECTION.up)
            this.btnDown = new Button(BUTTON.size * 1.5, BUTTON.size * 1.5, DIRECTION.down)
            this.btnLeft = new Button(BUTTON.size * 0.5, BUTTON.size * 1, DIRECTION.left)
            this.btnRight = new Button(BUTTON.size * 2.5, BUTTON.size * 1, DIRECTION.right)
            this.controlContainer.addChild(this.btnUp, this.btnDown, this.btnLeft, this.btnRight)
        }
        else alert('Game.fillControl(gameData) - Не заполнено поведение на различные команды')
    }

    fillCeils(gameData) {
        
        this.height = gameData.map.length * CEIL_SIZE
        this.width = gameData.map[0].length * CEIL_SIZE

        for(var stepY = 0;  stepY < gameData.map.length; stepY++) {

            const y = stepY * CEIL_SIZE

            for(var stepX = 0;  stepX < gameData.map[stepY].length; stepX++) {
                const ceilChar = gameData.map[stepY][stepX]
                if (ceilChar === ' ') continue

                const x = stepX * CEIL_SIZE
                
                const ceil = new Ceil(x, y)
                this.ceilContainer.addChild( ceil )

                switch(ceilChar) {
                    case 'F' :
                    case 'f' :
                        this.fox = new Fox(x, y, this.ceilContainer.children)
                        this.unitContainer.addChild(this.fox)
                    break
                }
            }
        }
    }
}

document.addEventListener('keyup', getKeyUp)
function getKeyUp(event) {
    console.log('keyup event:', event)
}