import { EventEmitter } from "pixi.js"

export const EventHub = new EventEmitter()

export const events = {
    screenResize: 'screenResize',

    getButtonClick: 'getButtonClick',
    useButton: 'useButton',
    resetAllButtons: 'resetAllButtons',

    setLevel: 'setLevel',
    setCommands: 'setCommands',
    restart: 'restart',
}

export function screenResize( data ) {
    EventHub.emit( events.screenResize, data )
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

export function setCommands( data ) {
    EventHub.emit( events.setCommands, data )
}
export function setLevel( data ) {
    EventHub.emit( events.setLevel, data )
}
export function restart( ) {
    EventHub.emit( events.restart )
}