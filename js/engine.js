export const vec2 = (x, y) => new Vector2(x, y ?? x);
export class Vector2 {
    x;
    y;
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    sum(...v) {
        const ret = vec2(this.x, this.y);
        for (const vec of v) {
            ret.x += vec.x;
            ret.y += vec.y;
        }
        return ret;
    }
    mult(...v) {
        const ret = vec2(this.x, this.y);
        for (const vec of v) {
            ret.x *= vec.x;
            ret.y *= vec.y;
        }
        return ret;
    }
    div(v) {
        return vec2(this.x / v.x, this.y / v.y);
    }
    get abs() {
        return vec2(Math.abs(this.x), Math.abs(this.y));
    }
    get length() {
        return Math.hypot(this.x, this.y);
    }
    get neg() {
        return vec2(-this.x, -this.y);
    }
}
export class Entity {
    #oldPos;
    pos;
    acceleration;
    dumper;
    scale;
    rotate;
    anchor;
    hidden;
    timeOfLife;
    constructor({ x = 0, y = 0, scale = vec2(1), rotate = 0, dumper = vec2(1), acceleration = vec2(0), anchor = vec2(0), hidden = false, timeOfLife = Infinity } = {}) {
        this.pos = vec2(x, y);
        this.#oldPos = this.pos;
        this.scale = scale;
        this.rotate = rotate;
        this.dumper = dumper;
        this.acceleration = acceleration;
        this.anchor = anchor;
        this.hidden = hidden;
        this.timeOfLife = timeOfLife;
    }
    accelerate(x = 0, y = 0) {
        this.acceleration = this.acceleration.sum(vec2(x, y));
    }
    updatePosition(dt) {
        // Verlet equation:
        // xₙ₊₁ = 2xₙ - xₙ₋₁ + aₙ∆t² = xₙ + vₙ + aₙ*∆t*∆t
        const vdt2 = vec2(dt * dt);
        let velocity = this.velocity;
        velocity = velocity.sum(velocity.neg.mult(this.dumper));
        this.#oldPos = this.pos;
        this.pos = this.pos.sum(velocity, this.acceleration.mult(vdt2));
        this.acceleration = vec2(0);
    }
    drawVector(ctx) {
        ctx.strokeStyle = 'lime';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.pos.x, this.pos.y);
        ctx.lineTo(this.pos.x + this.velocity.x * 10, this.pos.y + this.velocity.y * 10);
        ctx.stroke();
    }
    drawCenter(ctx) {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.ellipse(this.pos.x, this.pos.y, 5, 5, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    draw(ctx) { }
    get velocity() {
        return this.pos.sum(this.#oldPos.neg);
    }
}
export class Shape extends Entity {
    verts;
    fillColor;
    strokeColor;
    lineWidth;
    lineCap;
    lineJoin;
    strokeOver;
    constructor({ x, y, scale, rotate, dumper, acceleration, anchor, hidden, timeOfLife, verts }) {
        super({ x, y, scale, rotate, dumper, acceleration, anchor, hidden, timeOfLife });
        this.setShape(verts);
        this.setStyle({ fillColor: 'white' });
    }
    draw(ctx) {
        ctx.fillStyle = this.fillColor;
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.lineWidth;
        ctx.lineCap = this.lineCap;
        ctx.lineJoin = this.lineJoin;
        ctx.beginPath();
        ctx.moveTo(this.pos.x + this.verts[0].x, this.pos.y + this.verts[0].y);
        for (let i = 1; i < this.verts.length; i++) {
            const vert = this.verts[i];
            ctx.lineTo(this.pos.x + vert.x, this.pos.y + vert.y);
        }
        ctx.closePath();
        if (!this.strokeOver)
            ctx.stroke();
        ctx.fill();
        if (this.strokeOver)
            ctx.stroke();
    }
    setShape(verts) {
        if (verts.length < 3)
            throw new Error('At least 3 vertices are needed to build a shape');
        this.verts = verts;
        return this;
    }
    setStyle({ fillColor = this.fillColor, strokeColor = this.strokeColor || 'black', lineWidth = this.lineWidth || 0, lineCap = this.lineCap || 'butt', lineJoin = this.lineJoin || 'bevel', strokeOver = this.strokeOver || true }) {
        this.fillColor = fillColor;
        this.strokeColor = strokeColor;
        this.lineWidth = lineWidth;
        this.lineCap = lineCap;
        this.lineJoin = lineJoin;
        this.strokeOver = strokeOver;
        return this;
    }
}
export class Sprite extends Entity {
    image = new Image();
    imageSmoothing;
    constructor({ x, y, scale, rotate, dumper, acceleration, anchor, hidden, timeOfLife, img, flipY = false, imageSmoothing = false }) {
        super({ x, y, scale, rotate, dumper, acceleration, anchor, hidden, timeOfLife });
        this.imageSmoothing = imageSmoothing;
        this.anchor = anchor ?? vec2(+img.width / 2, +img.height / 2);
        this.setImage({ img, flipY });
    }
    draw(ctx) {
        const sT = ctx.getTransform();
        const rot = vec2(Math.cos(this.rotate), Math.sin(this.rotate));
        const center = this.pos;
        const a = this.scale.x * rot.x;
        const b = this.scale.x * rot.y;
        const c = -this.scale.y * rot.y;
        const d = this.scale.y * rot.x;
        const e = center.x - center.x * a - center.y * c;
        const f = center.y - center.y * d - center.x * b;
        ctx.transform(a, b, c, d, e, f);
        ctx.imageSmoothingEnabled = this.imageSmoothing;
        ctx.drawImage(this.image, this.pos.x - this.anchor.x, this.pos.y - this.anchor.y);
        ctx.setTransform(sT);
    }
    setImage({ img, flipY = false }) {
        const promise = createImageBitmap(img, {
            imageOrientation: flipY ? 'flipY' : 'none'
        });
        promise.then(v => {
            this.image = v;
        });
        return promise;
    }
}
export class Scene {
    entities = [];
    camera = new Entity();
    ctx;
    showDebug = false;
    constructor(ctx) {
        this.ctx = ctx;
    }
    updatePosition(dt) {
        this.entities.forEach(ent => {
            ent.updatePosition(dt);
        });
    }
    draw(dt) {
        this.ctx.setTransform(1, 0, 0, 1, this.ctx.canvas.width / 2 - this.camera.pos.x, this.ctx.canvas.height / 2 - this.camera.pos.y);
        this.entities.forEach(ent => {
            if (!ent.hidden) {
                ent.draw(this.ctx);
                if (this.showDebug) {
                    ent.drawVector(this.ctx);
                    ent.drawCenter(this.ctx);
                }
            }
        });
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
}
