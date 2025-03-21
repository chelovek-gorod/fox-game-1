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

let gameDataFox = localStorage.getItem('gameDataFox')
if (gameDataFox) defaultGameData = JSON.parse(gameDataFox)

initApp( gameContainer, () => startGame(defaultGameData) )