import { Assets } from 'pixi.js'
import { initFontStyles } from './fonts'
import LoadingBar from './LoadingBar'

const paths = {
    sprites : './sprites/',
    fonts : './fonts/',
}

export const loadBG = 'loadBG'

export const sprites = {
    [loadBG]: 'load_bg.jpg',

    tile_bg_top: 'tile_bg_top.png',
    tile_bg_bottom: 'tile_bg_bottom.png',

    ceil: 'ceil.png',
    hole: 'hole.png',

    fox: 'fox_all.json',
    bear: 'bear.json',
    star_blue: 'star_blue.png',
    star_purple: 'star_purple.png',
    star_yellow: 'star_yellow.png',
    star_white: 'star_white.png',
    star_green: 'star_green.png',

    target_1: 'target_1.png',
    target_2: 'target_2.png',
    target_3: 'target_3.png',
    target_4: 'target_4.png',
    target_5: 'target_5.png',
    target_6: 'target_6.png',
    target_7: 'target_7.png',
    target_8: 'target_8.png',
    target_9: 'target_9.png',

    magic_items: 'magic_items2.json',

    blockage_1: 'blockage_1_top.png',
    blockage_2: 'blockage_2_middle.png',
    blockage_3: 'blockage_3_middle.png',
    blockage_4: 'blockage_4_middle.png',
    blockage_5: 'blockage_5_middle.png',
    blockage_6: 'blockage_6_bottom.png',
    blockage_shadow: 'blockage_shadow.png',

    flower: 'flower.png',
    bf_yellow: 'butterfly_yellow.json',
    bf_white: 'butterfly_white.json',
    bf_purple: 'butterfly_purple.json',
    bf_blue: 'butterfly_blue.json',

    button: 'wood_button.png',
    button_arrow: 'wood_arrow.png',
    blue_arrow: 'blue_arrow.png',
    red_arrow: 'red_arrow.png',
    button_use: 'wood_use.png',
    blue_use: 'blue_use.png',
    red_use: 'red_use.png',

    buttons: 'buttons.json',
    commands: 'commands2.json',
}
const spritesNumber = Object.keys(sprites).length
for (let sprite in sprites) sprites[sprite] = paths.sprites + sprites[sprite]

export const fonts = {
    normal: 'Rubik-Medium.ttf',
}
for (let font in fonts) fonts[font] = paths.fonts + fonts[font]

///////////////////////////////////////////////////////////////////

export function preloadFonts( callback ) {
    Assets.addBundle('fonts', fonts)
    Assets.loadBundle('fonts').then( fontsData => {
        // update font values by font family
        for(let key in fontsData) fonts[key] = fontsData[key].family
        initFontStyles()
        preloadLoaderBG( callback )
        console.log('fonts loaded')
    })
}


export function preloadLoaderBG( callback ) {
    Assets.add( {alias: loadBG, src: sprites.loadBG} )
    Assets.load( loadBG ).then(data => {
        sprites.loadBG = data
        uploadAssets( callback )
        console.log('BG loaded')
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
        if (sprite === loadBG) {
            loading()
            continue
        }

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