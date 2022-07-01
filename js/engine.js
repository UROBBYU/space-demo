/**
 * Simplifies {@link Vector2} creation.
 */
export const vec2 = (x, y) => new Vector2(x, y ?? x);
/**
 * Defines two-dimentional vector with x and y coordinates.
 */
export class Vector2 {
    x;
    y;
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    /**
     * Calculates the sum of all given vectors and this.
     *
     * _If no vectors were given, just returnes this._
     */
    sum(...v) {
        const ret = vec2(this.x, this.y);
        for (const vec of v) {
            ret.x += vec.x;
            ret.y += vec.y;
        }
        return ret;
    }
    /**
     * Calculates the multiplication of all given vectors and this.
     *
     * *If no vectors were given, just returnes this.*
     */
    mult(...v) {
        const ret = vec2(this.x, this.y);
        for (const vec of v) {
            ret.x *= vec.x;
            ret.y *= vec.y;
        }
        return ret;
    }
    /**
     * Calculates the division of this by given vector.
     */
    div(v) {
        return vec2(this.x / v.x, this.y / v.y);
    }
    /**
     * Returns this vector but it's x and y are absolute.
     */
    get abs() {
        return vec2(Math.abs(this.x), Math.abs(this.y));
    }
    /**
     * Return this vector's length.
     */
    get length() {
        return Math.hypot(this.x, this.y);
    }
    /**
     * Returns a vector negative to this.
     */
    get neg() {
        return vec2(-this.x, -this.y);
    }
}
/**
 * Defines the most basic version of engine's object.
 *
 * It has no body, but physics can be applied to this.
 */
export class Entity {
    #oldPos;
    #oldAcceleration;
    position;
    acceleration;
    dumper; // amount of counter-acceleration.
    scale;
    rotate; // clockwise rotation in radians.
    anchor; // relative position of entity's origin.
    hidden;
    timeOfLife; // defines how much seconds this entity has to live.
    constructor({ x = 0, y = 0, scale = vec2(1), rotate = 0, dumper = vec2(1), acceleration = vec2(0), anchor = vec2(0), hidden = false, timeOfLife = Infinity } = {}) {
        this.position = vec2(x, y);
        this.#oldPos = this.position;
        this.scale = scale;
        this.rotate = rotate;
        this.dumper = dumper;
        this.acceleration = acceleration;
        this.anchor = anchor;
        this.hidden = hidden;
        this.timeOfLife = timeOfLife;
    }
    /**
     * Accelerates this entity in given direction.
     */
    accelerate(x = 0, y = 0) {
        this.acceleration = this.acceleration.sum(vec2(x, y));
    }
    /**
     * Applies verlet physics to this entity and recalculates it's position.
     */
    updatePosition(dt) {
        // Verlet equation:
        // xₙ₊₁ = 2xₙ - xₙ₋₁ + aₙ∆t² = xₙ + vₙ + aₙ*∆t*∆t
        const vdt2 = vec2(dt * dt);
        let velocity = this.velocity;
        velocity = velocity.sum(velocity.neg.mult(this.dumper));
        this.#oldPos = this.position;
        this.position = this.position.sum(velocity, this.acceleration.mult(vdt2));
        this.#oldAcceleration = this.acceleration;
        this.acceleration = vec2(0);
    }
    /**
     * Applies transformation matrix to this entity.
     */
    transform(ctx) {
        const rot = vec2(Math.cos(this.rotate), Math.sin(this.rotate));
        const center = this.position;
        const a = this.scale.x * rot.x;
        const b = this.scale.x * rot.y;
        const c = -this.scale.y * rot.y;
        const d = this.scale.y * rot.x;
        const e = center.x - center.x * a - center.y * c;
        const f = center.y - center.y * d - center.x * b;
        ctx.transform(a, b, c, d, e, f);
    }
    draw(ctx) { }
    /**
     * Draws acceleration and speed vectors.
     */
    drawVectors(ctx) {
        ctx.strokeStyle = 'lime';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo(this.position.x + this.velocity.x * 10, this.position.y + this.velocity.y * 10);
        ctx.stroke();
        ctx.strokeStyle = 'orange';
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo(this.position.x + this.#oldAcceleration.x / 50, this.position.y + this.#oldAcceleration.y / 50);
        ctx.stroke();
    }
    /**
     * Draws red dot at the center of this entity.
     */
    drawCenter(ctx) {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.ellipse(this.position.x, this.position.y, 5, 5, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    /**
     * This entity's velocity.
     */
    get velocity() {
        return this.position.sum(this.#oldPos.neg);
    }
}
/**
 * Basic shape built from relatively positioned vertices.
 */
export class Shape extends Entity {
    verts; // vertices
    fillColor;
    strokeColor;
    lineWidth;
    lineCap;
    lineJoin;
    strokeOver; // should this shape's stroke be drawn over filling?
    constructor({ x, y, scale, rotate, dumper, acceleration, anchor, hidden, timeOfLife, verts }) {
        super({ x, y, scale, rotate, dumper, acceleration, anchor, hidden, timeOfLife });
        this.setShape(verts);
        this.setStyle({ fillColor: 'white' });
    }
    /**
     * Draws this entity on the canvas.
     */
    draw(ctx) {
        ctx.fillStyle = this.fillColor;
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.lineWidth;
        ctx.lineCap = this.lineCap;
        ctx.lineJoin = this.lineJoin;
        const sT = ctx.getTransform();
        this.transform(ctx);
        ctx.beginPath();
        ctx.moveTo(this.position.x - this.anchor.x + this.verts[0].x, this.position.y - this.anchor.y + this.verts[0].y);
        for (let i = 1; i < this.verts.length; i++) {
            const vert = this.verts[i];
            ctx.lineTo(this.position.x - this.anchor.x + vert.x, this.position.y - this.anchor.y + vert.y);
        }
        ctx.closePath();
        if (!this.strokeOver)
            ctx.stroke();
        ctx.fill();
        if (this.strokeOver)
            ctx.stroke();
        ctx.setTransform(sT);
    }
    /**
     * Changes this entity's shape.
     *
     * _At least 2 vertices must be provided._
     */
    setShape(verts) {
        if (verts.length < 2)
            throw new Error('At least 2 vertices are needed to build a shape');
        this.verts = verts;
        return this;
    }
    /**
     * Changes this entity's looks.
     */
    setStyle({ fillColor = this.fillColor || 'black', strokeColor = this.strokeColor || 'transparent', lineWidth = this.lineWidth || 0, lineCap = this.lineCap || 'butt', lineJoin = this.lineJoin || 'bevel', strokeOver = this.strokeOver || true }) {
        this.fillColor = fillColor;
        this.strokeColor = strokeColor;
        this.lineWidth = lineWidth;
        this.lineCap = lineCap;
        this.lineJoin = lineJoin;
        this.strokeOver = strokeOver;
        return this;
    }
}
/**
 * Sprite entity.
 */
export class Sprite extends Entity {
    image = new Image();
    imageSmoothing;
    offset;
    crop;
    constructor({ x, y, scale, rotate, dumper, acceleration, anchor, hidden, timeOfLife, img, flipY = true, imageSmoothing = false, offset = vec2(0), crop = vec2(+img.width, +img.height) }) {
        super({ x, y, scale, rotate, dumper, acceleration, anchor, hidden, timeOfLife });
        this.imageSmoothing = imageSmoothing;
        this.anchor = anchor ?? vec2(+img.width / 2, +img.height / 2);
        this.offset = offset;
        this.crop = crop;
        this.setImage({ img, flipY });
    }
    /**
     * Draws this entity on the canvas.
     */
    draw(ctx, offset, crop) {
        const sT = ctx.getTransform();
        this.transform(ctx);
        ctx.imageSmoothingEnabled = this.imageSmoothing;
        ctx.drawImage(this.image, offset?.x ?? this.offset.x, offset?.y ?? this.offset.y, crop?.x ?? this.crop.x, crop?.y ?? this.crop.y, this.position.x - this.anchor.x, this.position.y - this.anchor.y, crop?.x ?? this.crop.x, crop?.y ?? this.crop.y);
        ctx.setTransform(sT);
    }
    /**
     * Sets this sprite's source image.
     */
    setImage({ img, flipY = true }) {
        const promise = createImageBitmap(img, {
            imageOrientation: flipY ? 'flipY' : 'none'
        });
        promise.then(v => {
            this.image = v;
        });
        return promise;
    }
}
export class Slides extends Sprite {
    slide;
    slides;
    gap;
    constructor({ x, y, scale, rotate, dumper, acceleration, anchor, hidden, timeOfLife, img, flipY, slides = vec2(1), slide = vec2(0), gap = 1, imageSmoothing }) {
        super({ x, y, scale, rotate, dumper, acceleration, anchor: vec2(0, 0), hidden, timeOfLife, img, flipY, imageSmoothing });
        if ((+img.width - gap * (slides.x - 1)) % slides.x)
            throw new Error(`Image width (${+img.width - gap * (slides.x - 1)}) cannot be evenly separated into ${+slides.x} pieces`);
        if ((+img.height - gap * (slides.y - 1)) % slides.y)
            throw new Error(`Image height (${+img.height - gap * (slides.y - 1)}) cannot be evenly separated into ${+slides.y} pieces`);
        this.slides = slides;
        this.slide = slide;
        this.gap = gap;
        this.anchor = anchor ?? vec2((+img.width - gap * (slides.x - 1)) / slides.x / 2, (+img.height - gap * (slides.y - 1)) / slides.y / 2);
    }
    next() {
        if (++this.slide.x >= this.slides.x)
            this.slide.x = 0;
    }
    previous() {
        if (--this.slide.x < 0)
            this.slide.x = this.slides.x - 1;
    }
    draw(ctx) {
        const offset = this.slideSize.sum(vec2(this.gap)).mult(this.slide);
        super.draw(ctx, offset, this.slideSize);
    }
    get slidesCount() {
        return this.slides.x * this.slides.y;
    }
    get slideSize() {
        return vec2((this.image.width - this.gap * (this.slides.x - 1)) / this.slides.x, (this.image.height - this.gap * (this.slides.y - 1)) / this.slides.y);
    }
}
/**
 * Scene where all the {@link Entity Entities} are contained.
 */
export class Scene {
    entities = [];
    camera = new Entity();
    ctx;
    showDebug = false;
    constructor(ctx) {
        this.ctx = ctx;
    }
    /**
     * {@link Entity.updatePosition Applies physics} to all contained entities.
     */
    updatePositions(dt) {
        this.entities.forEach(ent => {
            ent.updatePosition(dt);
        });
    }
    /**
     * Draws all contained entities on canvas.
     */
    draw(dt) {
        this.ctx.setTransform(1, 0, 0, 1, this.ctx.canvas.width / 2 - this.camera.position.x, this.ctx.canvas.height / 2 - this.camera.position.y);
        this.entities.forEach(ent => {
            if (!ent.hidden) {
                ent.draw(this.ctx);
                if (this.showDebug) {
                    ent.drawVectors(this.ctx);
                    ent.drawCenter(this.ctx);
                }
            }
        });
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
}
