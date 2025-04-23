import { Application } from 'pixi.js'
import { changeFocus, screenResize } from './events'
import { preloadFonts, preloadLoaderBG } from './loader'

let app = null
let appContainer = null
let startCallback = null

let appPointer = null

const appSettings = {
    // background: 0x67bd00,
    background: 0xffffff,
    antialias: true, // сглаживание
    resolution: 1,
    resizeTo: null
}

export default function initApp(container, callback) {
    if (app) return

    app = new Application()
    appContainer = container
    startCallback = callback

    appSettings.resizeTo = appContainer
    Promise.all( [app.init( appSettings )] ).then( appReady )
}

function appReady() {
    app.ticker.add( time => tick(time) )
    appContainer.append( app.canvas )

    app.canvas.oncontextmenu = (event) => event.preventDefault()

    resize()

    app.stage.eventMode = 'static'
    app.stage.on('pointermove', (event) => appPointer = event.data)

    preloadFonts( startCallback )
}

let tickerArr = []

const appScreen = {}

function resize() {
    appScreen.width = app.screen.width
    appScreen.height = app.screen.height
    appScreen.centerX = app.screen.width * 0.5
    appScreen.centerY = app.screen.height * 0.5
    appScreen.isLandscape = app.screen.width > app.screen.height

    screenResize( appScreen )
}

export function getAppScreen() {
    return appScreen
}

export function getAppPointer(target) {
    return appPointer.getLocalPosition(target)
}

export function sceneAdd(...elements) {
    elements.forEach( element => app.stage.addChild( element ) )
}

export function sceneRemove(element) {
    app.stage.removeChild( element )
}

export function sceneClear() {
    while (app.stage.children.length) app.stage.children[0].destroy(true)
}

let orientation = window.matchMedia("(orientation: portrait)");
orientation.addEventListener("change", () => setTimeout(resize, 0))
window.addEventListener('resize', () => setTimeout(resize, 0))

window.addEventListener('focus', () => tickerStateChange(true))
window.addEventListener('blur', () => tickerStateChange(false))
if ('hidden' in document) document.addEventListener('visibilitychange', visibilityOnChange)
function visibilityOnChange( ) {
    const isHidden = document.hidden || document.visibilityState !== 'visible'
    tickerStateChange( isHidden )
}

function tickerStateChange( isOn ) {
    if (app === null || !('ticker' in app)) return

    if (isOn) app.ticker.start()
    else app.ticker.stop()
    changeFocus(isOn)
}

function tick(time) {
    // if (delta = 1) -> FPS = 60 (16.66ms per frame)
    tickerArr.forEach( element => element.tick(time) )
    // time.elapsedMS - in milliseconds
    // time.deltaMS   - ???
    // time.deltaTime - in frame
}

export function tickerAdd( element ) {
    if ('tick' in element) tickerArr.push( element )
    else console.warn( 'TRY TO ADD ELEMENT IN TICKER WITHOUT .tick() METHOD:', element)
}

export function tickerRemove( element ) {
    tickerArr = tickerArr.filter( e => e !== element )
}