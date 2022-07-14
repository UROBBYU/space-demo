//* Utilities 🧩
/**
 * Simplifies {@link Vector2} creation.
 */
const vec2 = (x, y) => new Vector2(x, y ?? x);
/**
 * Defines two-dimentional vector with x and y coordinates.
 */
class Vector2 {
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
     * Calculates the dot product of this and given vector.
     */
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
    /**
     * Returns vector, perpendicular to this facing right.
     */
    get right() {
        return vec2(this.y, -this.x);
    }
    /**
     * Returns vector, perpendicular to this facing left.
     */
    get left() {
        return vec2(-this.y, this.x);
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
    get rotation() {
        return Math.atan2(this.y, this.x);
    }
    static fromDegree(radius, degree) {
        return vec2(radius * Math.cos(degree), radius * Math.sin(degree));
    }
}
const minkowskiSum = (s1, s2) => {
    const verts = [];
    const iter = 30;
    for (let i = 0; i < PI2; i += PI2 / iter) {
        const rot = Vector2.fromDegree(1, i);
        const v = s1.support(rot).sum(s2.support(rot));
        if (verts.length > 0 && v.sum(verts.at(-1).neg).length < 0.0001)
            continue;
        verts.push(v);
    }
    if (verts.length > 0 && verts[0].sum(verts.at(-1).neg).length < 0.0001)
        verts.pop();
    return new Polygon({
        x: s1.position.x + s2.position.x,
        y: s1.position.y + s2.position.y,
        color: 'red',
        verts
    });
};
//* Colliders 🧱
/**
 * Defines the most basic version of collider.
 *
 * It represents a dot in space.
 */
class Collider {
    position;
    color;
    rotate;
    intersects = false;
    shadeIntersects = false;
    shade = [vec2(0), vec2(0)];
    constructor({ x = 0, y = 0, rotate = 0, color }) {
        this.position = vec2(x, y);
        this.rotate = rotate;
        this.color = color;
    }
    draw(ctx) { }
    drawShade(ctx) {
        ctx.fillStyle = this.shadeIntersects ? 'green' : 'grey';
        const size = this.shade[1].sum(this.shade[0].neg);
        ctx.fillRect(this.globalPosition.x + this.shade[0].x, this.globalPosition.y + this.shade[0].y, size.x, size.y);
    }
    support(direction) { return vec2(0); }
    get globalPosition() {
        return center.sum(this.position);
    }
}
/**
 * Ellipse shaped collider, defined by two radiuses.
 */
class Ellipse extends Collider {
    radius;
    constructor({ x, y, rotate, color, radiusX = 100, radiusY = 100 }) {
        super({ x, y, rotate, color });
        this.radius = vec2(radiusX, radiusY);
        this.shade = [
            this.radius.neg,
            this.radius
        ];
    }
    /**
     * Draws this collider on the canvas.
     */
    draw(ctx) {
        ctx.fillStyle = this.intersects ? 'lime' : this.color;
        ctx.beginPath();
        ctx.ellipse(this.globalPosition.x, this.globalPosition.y, this.radius.x, this.radius.y, this.rotate, 0, PI2);
        ctx.fill();
        ctx.stroke();
    }
}
/**
 * Circle shaped collider, defined by it's radius.
 */
class Circle extends Ellipse {
    constructor({ x, y, rotate, color, radius = 100 }) {
        super({ x, y, rotate, color, radiusX: radius, radiusY: radius });
    }
    support(direction) {
        const rot = Math.atan2(direction.y, direction.x);
        return Vector2.fromDegree(this.radius.x, rot);
    }
}
/**
 * Polygon shaped collider, built from relatively positioned vertices.
 *
 * **Must be convex.**
 */
class Polygon extends Collider {
    verts = [];
    constructor({ x, y, rotate, color, verts }) {
        super({ x, y, rotate, color });
        if (verts.length < 3)
            throw new Error('Polygon must contain at least 3 vertices');
        const v0_neg = verts[0].neg;
        const clockwise = verts[1].sum(v0_neg).right.dot(verts[2].sum(v0_neg)) > 0;
        for (let i = 0; i < verts.length; i++) {
            const a = verts[i == 0 ? verts.length - 1 : i - 1];
            const b = verts[i];
            const c = verts[i == verts.length - 1 ? 0 : i + 1];
            const b_neg = b.neg;
            const ba = a.sum(b_neg);
            const bc = c.sum(b_neg);
            const normal = clockwise ? bc.right : bc.left;
            if (normal.dot(ba) <= 0)
                throw new Error('The polygon must be convex');
        }
        this.verts = verts;
        const min = vec2(Infinity, Infinity);
        const max = vec2(-Infinity, -Infinity);
        verts.forEach(v => {
            if (v.x < min.x)
                min.x = v.x;
            if (v.x > max.x)
                max.x = v.x;
            if (v.y < min.y)
                min.y = v.y;
            if (v.y > max.y)
                max.y = v.y;
        });
        this.shade = [min, max];
    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.globalPosition.x + this.verts[0].x, this.globalPosition.y + this.verts[0].y);
        for (let i = 1; i < this.verts.length; i++) {
            const vert = this.verts[i];
            ctx.lineTo(this.globalPosition.x + vert.x, this.globalPosition.y + vert.y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}
class Regular extends Polygon {
    vertices;
    radius;
    constructor({ x, y, rotate, color, radius = 100, vertices }) {
        const verts = [];
        const dAng = PI2 / vertices;
        const ang = vertices % 2 ? PI_2 : (Math.PI - dAng) * .5;
        verts.push(vertices % 2 ? vec2(0, radius) : Vector2.fromDegree(radius, ang));
        const maxAng = PI2 + ang - 0.0001;
        for (let i = ang + dAng; i < maxAng; i += dAng)
            verts.push(Vector2.fromDegree(radius, i));
        super({ x, y, rotate, color, verts });
        this.radius = radius;
        this.vertices = vertices;
    }
    support(direction) {
        const ang = PI2 / this.vertices;
        const stRot = this.vertices % 2 ? PI_2 : PI_2 - ang / 2;
        const rot = direction.rotation - stRot;
        let i = Math.round(rot / ang);
        if (i < 0)
            i += this.vertices;
        if (i >= this.vertices)
            i -= this.vertices;
        return this.verts[i];
    }
}
//* Constants 👓
const PI2 = Math.PI * 2;
const PI_2 = Math.PI * .5;
const center = vec2(500);
//* Colliders List 🚀
const colliders = [
    new Circle({
        x: -200,
        color: 'aquamarine'
    }),
    new Circle({
        x: 200,
        radius: 150,
        color: 'cadetblue'
    }),
    new Regular({
        x: -200,
        color: 'aquamarine',
        vertices: 5
    }),
    new Regular({
        x: 200,
        color: 'cadetblue',
        vertices: 3
    })
];
//* Program Start 🟢
window.addEventListener('load', () => {
    //* Getting elements from the page 🖼️
    const display = document.getElementById('display');
    const ctx = display.getContext('2d');
    //* Variables 👓
    let dragging = -1;
    //* Event Listeners 👂
    window.addEventListener('pointerdown', (e) => {
        dragging = -1;
        colliders.forEach((shape, i) => {
            if (Math.hypot(center.x + shape.position.x - e.pageX, center.y - shape.position.y - e.pageY) <= 50)
                dragging = i;
        });
    });
    window.addEventListener('pointermove', (e) => {
        if (e.buttons && dragging != -1) {
            colliders[dragging].position.x += e.movementX;
            colliders[dragging].position.y -= e.movementY;
        }
    });
    //* Main Loop 🔄
    /**
     * Fires every frame, detects collisions and redraws onscreen objects.
     */
    const draw = () => {
        ctx.clearRect(0, 0, display.width, display.height);
        colliders.forEach(v => {
            v.intersects = false;
            v.shadeIntersects = false;
        });
        colliders.forEach((s1, i) => {
            for (let j = i + 1; j < colliders.length; j++) {
                const s2 = colliders[j];
                const s1_min = s1.globalPosition.sum(s1.shade[0]);
                const s1_max = s1.globalPosition.sum(s1.shade[1]);
                const s2_min = s2.globalPosition.sum(s2.shade[0]);
                const s2_max = s2.globalPosition.sum(s2.shade[1]);
                if (s1_min.x < s2_max.x &&
                    s2_min.x < s1_max.x &&
                    s1_min.y < s2_max.y &&
                    s2_min.y < s1_max.y)
                    s1.shadeIntersects = s2.shadeIntersects = true;
            }
            s1.drawShade(ctx);
        });
        minkowskiSum(colliders[0], colliders[2]).draw(ctx);
        colliders.forEach(v => v.draw(ctx));
        requestAnimationFrame(draw);
    };
    draw();
});
