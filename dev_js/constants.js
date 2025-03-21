export const _2PI = Math.PI * 2

export const CEIL_SIZE = 100
export const CEIL_HALF_SIZE = Math.round(CEIL_SIZE * 0.5)

export const FOX = {
    speed: 0.07,
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
    scaleStep: 0.001,
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

export const NUMBER = {
    step: 0.0005,
    speedY: 0.01
}