import initApp from './engine/application'
import startGame from './game'

const gameContainer = document.querySelector('div')

export let defaultGameData = {
    map: [
        [' ', ' ', ' ', '2', ' ', ' ', ' ',],
        ['F', '*', '*', '*', '*', '*', '4',],
        [' ', ' ', '3', ' ', '1', ' ', ' ',],
    ],
    commands: [
        /* if empty - use arrows as joystick */
    ],
    magicLevel : 3
}

initApp( gameContainer, () => startGame(defaultGameData) )