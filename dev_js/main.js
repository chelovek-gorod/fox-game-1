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

let gameData = localStorage.getItem('gameData')
if (gameData) defaultGameData = JSON.parse(gameData)

initApp( gameContainer, () => startGame(defaultGameData) )