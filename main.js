const vec2 = (x, y) => new Vector2(x, y ?? x);
class Vector2 {
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
    get length() {
        return Math.hypot(this.x, this.y);
    }
    get neg() {
        return vec2(-this.x, -this.y);
    }
}
const speed = 0.002;
class Entity {
    #oldPos;
    pos;
    acceleration = vec2(0);
    dumper = vec2(0.14);
    fillColor = 'red';
    constructor(x = 0, y = 0) {
        this.pos = vec2(x, y);
        this.#oldPos = this.pos;
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
    draw(ctx) {
        ctx.fillStyle = this.fillColor;
        ctx.beginPath();
        ctx.ellipse(this.pos.x, this.pos.y, 5, 5, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    setStyle({ fillColor }) {
        this.fillColor = fillColor;
        return this;
    }
    get velocity() {
        return this.pos.sum(this.#oldPos.neg);
    }
}
class Shape extends Entity {
    verts;
    strokeColor;
    lineWidth;
    lineCap;
    lineJoin;
    strokeOver;
    constructor(x = 0, y = 0, verts) {
        super(x, y);
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
    drawVectors(ctx) {
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
    setShape(verts) {
        if (verts.length < 3)
            throw new Error('At least 3 vertices are needed to build a shape');
        this.verts = verts;
        return this;
    }
    setStyle({ fillColor = this.fillColor, strokeColor = this.strokeColor || 'black', lineWidth = this.lineWidth || 0, lineCap = this.lineCap || 'butt', lineJoin = this.lineJoin || 'bevel', strokeOver = this.strokeOver || true }) {
        super.setStyle({ fillColor });
        this.strokeColor = strokeColor;
        this.lineWidth = lineWidth;
        this.lineCap = lineCap;
        this.lineJoin = lineJoin;
        this.strokeOver = strokeOver;
        return this;
    }
}
const ship = new Shape(300, 300, [
    vec2(-20, -30),
    vec2(20, -30),
    vec2(0, 30)
]).setStyle({
    lineWidth: 10,
    lineJoin: 'round',
    strokeColor: 'white',
    fillColor: 'white'
});
window.addEventListener('load', () => {
    const valX = document.getElementById('x');
    const valY = document.getElementById('y');
    const accX = document.getElementById('acc-x');
    const accY = document.getElementById('acc-y');
    const speedX = document.getElementById('speed-x');
    const speedY = document.getElementById('speed-y');
    const valFPS = document.getElementById('fps');
    const display = document.getElementById('display');
    const ctx = display.getContext('2d');
    const resize = () => {
        const bounds = display.getBoundingClientRect();
        display.width = bounds.width;
        display.height = bounds.height;
    };
    const round = (num, dig) => Math.floor(num * Math.pow(10, dig)) / Math.pow(10, dig);
    const updateStats = (ent, dt) => {
        valX.innerText = round(ent.pos.x, 2).toString();
        valY.innerText = round(ent.pos.y, 2).toString();
        accX.innerText = round(ent.acceleration.x, 5).toString();
        accY.innerText = round(ent.acceleration.y, 5).toString();
        speedX.innerText = round(ent.velocity.x, 2).toString();
        speedY.innerText = round(ent.velocity.y, 2).toString();
        valFPS.innerText = Math.round(1000 / dt).toString();
    };
    let lastTime = 0;
    let keyW = false;
    let keyS = false;
    let keyA = false;
    let keyD = false;
    window.addEventListener('resize', resize);
    window.addEventListener('keydown', e => {
        if (e.key == 'w')
            keyW = true;
        else if (e.key == 's')
            keyS = true;
        else if (e.key == 'a')
            keyA = true;
        else if (e.key == 'd')
            keyD = true;
    });
    window.addEventListener('keyup', e => {
        if (e.key == 'w')
            keyW = false;
        else if (e.key == 's')
            keyS = false;
        else if (e.key == 'a')
            keyA = false;
        else if (e.key == 'd')
            keyD = false;
    });
    const draw = (time) => {
        const dt = time - lastTime;
        ctx.clearRect(0, 0, display.width, display.height);
        if (keyW)
            ship.accelerate(0, speed);
        if (keyS)
            ship.accelerate(0, -speed);
        if (keyA)
            ship.accelerate(-speed, 0);
        if (keyD)
            ship.accelerate(speed, 0);
        updateStats(ship, dt);
        ship.updatePosition(dt);
        ship.draw(ctx);
        ship.drawVectors(ctx);
        ship.drawCenter(ctx);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        lastTime = time;
        requestAnimationFrame(draw);
    };
    resize();
    draw(0);
});
