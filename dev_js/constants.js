export const CEIL_SIZE = 100
export const CEIL_HALF_SIZE = Math.round(CEIL_SIZE * 0.5)

export const FOX = {
    speed: 0.12,
    state: {
        idle: 'idle',
        go: 'go',
        lose: 'lose',
        win: 'win'
    }
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
}