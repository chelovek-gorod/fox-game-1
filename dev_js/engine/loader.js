import { Assets } from 'pixi.js'
import { initFontStyles } from './fonts'
import LoadingBar from './LoadingBar'

const paths = {
    sprites : './sprites/',
    fonts : './fonts/',
}

export const sprites = {
    tile_bg_top: 'tile_bg_top.png',
    tile_bg_bottom: 'tile_bg_bottom.png',

    ceil: 'ceil_.png',

    fox: 'fox.png',

    button: 'wood_button.png',
    button_arrow: 'wood_arrow.png',
    blue_arrow: 'blue_arrow.png',
    red_arrow: 'red_arrow.png',
}
const spritesNumber = Object.keys(sprites).length
for (let sprite in sprites) sprites[sprite] = paths.sprites + sprites[sprite]

export const fonts = {
    normal: 'Onest-Regular.ttf',
}
for (let font in fonts) fonts[font] = paths.fonts + fonts[font]

///////////////////////////////////////////////////////////////////

export function preloadFonts( callback ) {
    Assets.addBundle('fonts', fonts)
    Assets.loadBundle('fonts').then( fontsData => {
        // update font values by font family
        for(let key in fontsData) fonts[key] = fontsData[key].family
        initFontStyles()
        uploadAssets( callback )
    })
}

function uploadAssets( loadingDoneCallback ) {
    const assetsNumber = spritesNumber // + soundsNumber + voicesNumber
    let loadedAssets = 0
    let progressPerAsset = 100 / assetsNumber

    const loadingBar = new LoadingBar()

    const multiPacksMap = new Map()
    function updateMultiPackAnimations(sprite, animationsList) {
        // update all textures in all animations at MultiPack atlas
        for(let animationName in sprites[sprite].animations) {
            sprites[sprite].animations[animationName].forEach( (frame, index) => {
                if (!!frame) return // texture is already loaded, go to next frame
                const texture = Assets.cache.get(animationsList[animationName][index])
                sprites[sprite].animations[animationName][index] = texture
            })
        }
    }

    const loading = () => {
        loadedAssets++
        loadingBar.update(progressPerAsset * loadedAssets)
        if (loadedAssets === assetsNumber) {
            multiPacksMap.forEach( (animations, sprite) => updateMultiPackAnimations(sprite, animations) )
            multiPacksMap.clear()
            loadingBar.delete()
            loadingDoneCallback()
        }
    }

    for (let sprite in sprites) {
        Assets.add( {alias: sprite, src: sprites[sprite]} )
        Assets.load( sprite ).then(data => {
            if ('data' in data && 'related_multi_packs' in data.data.meta && 'animations' in data.data) {
                multiPacksMap.set(sprite, data.data.animations)
            }
            sprites[sprite] = data
            loading()
        })
    }
}