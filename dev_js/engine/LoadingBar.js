import { Container, Graphics, Text, Sprite } from 'pixi.js'
import { textStyles } from './fonts'
import { getAppScreen, sceneAdd, sceneRemove, tickerAdd, tickerRemove } from './application'
import { EventHub, events } from './events'
import { sprites } from './loader'

const settings = {
    x: -210,
    y: 0,
    width: 420,
    height: 50,
    borderLineWidth: 10,
    progressOffset: 10,
    color: 0xffffff,
    borderRadius: 25,
    progressRadius: 15,
}

class LoadingBar extends Container {
    constructor() {
        super()

        this.bg = new Sprite(sprites.loadBG)
        this.bg.anchor.set(0.5)
        this.bg.alpha = 0
        this.bg.alphaStep = 0.002
        this.bgWidth = this.bg.width
        this.bgHeight = this.bg.height
        this.addChild(this.bg)

        this.progressBar = new Graphics()
        this.drawProgress(0)
        this.addChild(this.progressBar)

        this.text = new Text({
            text:'Загрузка: 0%',
            style:textStyles.loading
        })
        this.text.anchor.set(0.5)
        this.addChild(this.text)

        this.screenResize( getAppScreen() )
        EventHub.on( events.screenResize, this.screenResize, this )

        sceneAdd(this)
        tickerAdd(this)
    }

    delete() {
        tickerRemove(this)
        EventHub.off( events.screenResize, this.screenResize, this )
        this.removeAllListeners()
        sceneRemove(this)
        this.destroy()
    }

    screenResize(screenData) {
        this.position.set(screenData.centerX, screenData.centerY)

        const scaleX = screenData.width / this.bgWidth
        const scaleY = screenData.height / this.bgHeight
        const scale = scaleX > scaleY ? scaleX : scaleY
        this.bg.scale.set(scale)

        this.progressBar.position.set(0.5, screenData.centerY - 200)
        this.text.position.set(0.5, screenData.centerY - 250)
    }

    update(progress) {
        const range = Math.round(progress)
        this.text.text = 'Загрузка: ' + range + '%'
        this.drawProgress(range)
    }
    drawProgress(range) {
        this.progressBar.clear()

        this.progressBar.roundRect(settings.x, settings.y, settings.width, settings.height, settings.borderRadius)
        this.progressBar.stroke({width: settings.borderLineWidth, color: settings.color})

        const width = 4 * range
        if (width < settings.progressRadius) return
        
        this.progressBar.roundRect(
            settings.x + settings.progressOffset,
            settings.y + settings.progressOffset,
            width,
            settings.height - settings.progressOffset * 2,
            settings.progressRadius
        )
        this.progressBar.fill(settings.color)
    }

    tick(time) {
        if (this.bg.alphaStep >= 1) return tickerRemove(this)

        this.bg.alpha += this.bg.alphaStep * time.elapsedMS
    }
}

export default LoadingBar