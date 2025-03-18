import initApp from './engine/application'
import startGame from './game'

const gameContainer = document.querySelector('div')

export let defaultGameData = {
    map: [
        [' ', ' ', ' ', '2', ' ', ' ', ' ',],
        ['F', '*', '*', '*', '*', '*', 'X',],
        [' ', ' ', '3', ' ', '1', ' ', ' ',],
    ],
    commands: [
        /* if empty - use arrows as joystick */
    ]
}

initApp( gameContainer, () => startGame(defaultGameData) )