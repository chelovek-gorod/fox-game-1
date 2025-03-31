export function setCursorPointer(target) {
    target.eventMode = 'static'
    target.on('pointerover', () => document.body.style.cursor = 'pointer')
    target.on('pointerout', () => document.body.style.cursor = 'auto')
}

const _2PI = Math.PI * 2

export function getDistance(sprite, target) {
    let dx = target.x - sprite.x;
    let dy = target.y - sprite.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export function moveSprite(sprite, pathSize) {
    sprite.x += Math.cos(sprite.rotation) * pathSize;
    sprite.y += Math.sin(sprite.rotation) * pathSize;
}

export function turnSpriteToTarget(sprite, target, turnAngle) {
    let pointDirection = Math.atan2(target.y - sprite.y, target.x - sprite.x);
    let deflection = (pointDirection - sprite.rotation) % _2PI;
    if (!deflection) return true;

    if (deflection < -Math.PI) deflection += _2PI;
    if (deflection >  Math.PI) deflection -= _2PI;

    if (Math.abs(deflection) <= turnAngle) sprite.rotation = pointDirection;
    else sprite.rotation += (deflection <  0) ? -turnAngle : turnAngle;
    return false;
}