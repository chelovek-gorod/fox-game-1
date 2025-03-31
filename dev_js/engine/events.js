import { EventEmitter } from "pixi.js"

export const EventHub = new EventEmitter()

export const events = {
    screenResize: 'screenResize',
    changeFocus: 'changeFocus',

    getButtonClick: 'getButtonClick',
    useButton: 'useButton',
    resetAllButtons: 'resetAllButtons',

    setFoxCommands: 'setFoxCommands',
    setBearCommands: 'setBearCommands',

    setLevel: 'setLevel',
    restart: 'restart',
}

export function screenResize( data ) {
    EventHub.emit( events.screenResize, data )
}
export function changeFocus( isOnFocus ) {
    EventHub.emit( events.changeFocus, isOnFocus )
}

export function getButtonClick( direction ) {
    EventHub.emit( events.getButtonClick, direction )
}
export function useButton( data ) {
    EventHub.emit( events.useButton, data )
}
export function resetAllButtons() {
    EventHub.emit( events.resetAllButtons )
}

export function setFoxCommands( data ) {
    EventHub.emit( events.setFoxCommands, data )
}
export function setBearCommands( data ) {
    EventHub.emit( events.setBearCommands, data )
}

export function setLevel( data ) {
    EventHub.emit( events.setLevel, data )
}
export function restart( ) {
    EventHub.emit( events.restart )
}