import { TextStyle } from "pixi.js"
import { fonts } from "./loader"

// https://pixijs.io/pixi-text-style/

export let textStyles = null

export function initFontStyles() {
    // add font family, after update font values in loader
    textStyles = {
        loading: new TextStyle({
            fontFamily: fonts.normal,
            fontSize: 50,
            fill: '#ffffff',
        
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 12,
            dropShadowAngle: 0,
            dropShadowDistance: 0,
        }),
        
        loop: new TextStyle({
            fontFamily: fonts.normal,
            fontSize: 32,
            fill: '#ffffff',
        }),
    }
}