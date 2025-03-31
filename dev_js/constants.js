export const _2PI = Math.PI * 2

export const CEIL_SIZE = 100
export const CEIL_HALF_SIZE = Math.round(CEIL_SIZE * 0.5)

export const HERO = {
    speed: 0.12,
    beforeIdleTimeout: 2400,
}

export const DIRECTION = {
    left: 'left',
    right: 'right',
    up: 'up',
    down: 'down'
}
export const CEIL_OFFSET = {
    [DIRECTION.left]: { dx: -CEIL_SIZE, dy: 0 },
    [DIRECTION.right]: { dx: CEIL_SIZE, dy: 0 },
    [DIRECTION.up]: { dx: 0, dy: -CEIL_SIZE },
    [DIRECTION.down]: { dx: 0, dy: CEIL_SIZE },
}

export const ACTION = {
    left: 'left',
    right: 'right',
    up: 'up',
    down: 'down',

    forward: 'forward',
    turnLeft: 'turnLeft',
    turnRight: 'turnRight',

    use: 'use',
    message: 'message'
}

export const COMMANDS = {
    start: 'start',
    startMessage: 'startMessage',

    left: 'left',
    right: 'right',
    up: 'up',
    down: 'down',

    forward: 'forward',
    turnLeft: 'turnLeft',
    turnRight: 'turnRight',

    loop: 'loop',
    use: 'use',
    message: 'message'
}

export const BG = {
    topHeight: 640
}

export const BUTTON = {
    size: 180,
    lightScale: 0.6,
    step: 0.001,

    state: {
        idle : 'idle',
        sizeIn : 'sizeIn',
        redOut : 'redOut',
    }
}

export const BUTTERFLY = {
    flySpeed: 0.2,
    landingSpeed: 0.1,
    turnSpeed: 0.005,
    landingTurnSpeed: 0.01,
    flyAnimationSpeed: 2.5,
    idleAnimationSpeed: 0.5,
    scaleStep: 0.0003,
    scaleMin: 0.4,
    scaleMax: 0.6,
    landingTimeoutMin: 3000,
    landingTimeoutMax: 6000,
    landingTimeoutDelta: 0,
}
BUTTERFLY.landingTimeoutDelta = BUTTERFLY.landingTimeoutMax - BUTTERFLY.landingTimeoutMin

export const STAR = {
    alphaStep: 0.001,
    alphaMax: 0.7,
    scaleMin: 0.1,
    scaleMax: 0.5,
    scaleStep: 0,
    speedY: 0.05,
    speedX: 0.01,
    lifeTimeMin: 2400,
    lifeTimeMax: 3600,
    lifeTimeDelta: 0,
}
STAR.scaleStep = (STAR.scaleMax - STAR.scaleMin) / (STAR.alphaMax / STAR.alphaStep)
STAR.lifeTimeDelta = STAR.lifeTimeMax - STAR.lifeTimeMin

// move items and numbers after collect
export const NUMBER = {
    step: 0.0005,
    speedY: 0.01
}

// control panel UI (commands and stack)
export const CP = {
    bottomOffset: 20,

    width: 1480,
    height: 260,
    boardBGColor: 0x6c5e16,
    boardBorderColor: 0x594d12,
    boardBorderRadius: 32,
    boardBorderWidth: 6,

    playPanelWidth: 240,
    playPanelHeight: 132,
    playPanelX: 0,
    playPanelY: 0,
    playPaneBorderRadius: 24,
    playPanelBGColor: 0xffc005,
    playPanelButtonsOffset: 16,
    playPanelButtonTop: 0,
    playPanelPlayBtnLeft: 0,
    playPanelStopBtnRight: 0,

    iconSize: 128,

    stackBGColor: 0x999999,
    stackBorderColor: 0x706e65,
    stackBorderRadius: 26,
    stackWidth: 0,
    stackHeight: 120,
    stackOffsetX: 36,
    stackOffsetY: 256,

    stackButtonOffsetY: 120, // в теке команды ниже чем в линии доступных команд на 120 пикселей (тестил)

    startCommandX: 32,
    startCommandY: 240,

    runCommandWidth: 120,
    loopCommandWidth: 150,
    otherCommandWidth: 115,
}
CP.playPanelX = CP.boardBorderRadius
CP.playPanelY = CP.iconSize - (CP.playPanelHeight - CP.playPaneBorderRadius)
CP.playPanelButtonTop = CP.playPanelY + CP.playPanelButtonsOffset
CP.playPanelPlayBtnLeft = CP.boardBorderRadius + CP.playPanelButtonsOffset
CP.playPanelStopBtnRight = CP.boardBorderRadius + CP.playPanelWidth - CP.playPanelButtonsOffset
CP.stackWidth = CP.width - CP.stackOffsetX * 2

export const CMD_BLOCK = {
    offsetX: 70,
    offsetY: 360,

    start: 105, // 120
    action: 100, // 115
    loopStart: 20, // 35
    loopTop: 5,
    loopEnd: 100, // 115
}