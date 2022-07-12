//* Utilities 🧩

/**
 * Simplifies {@link Vector2} creation.
 */
const vec2 = (x: number, y?: number): Vector2 => new Vector2(x, y ?? x)

/**
 * Defines two-dimentional vector with x and y coordinates.
 */
class Vector2 {
    x: number
    y: number

    constructor(x = 0, y = 0) {
        this.x = x
        this.y = y
    }

    /**
     * Calculates the sum of all given vectors and this.
     * 
     * _If no vectors were given, just returnes this._
     */
    sum(...v: Vector2[]) {
        const ret = vec2(this.x, this.y)
        for (const vec of v) {
            ret.x += vec.x
            ret.y += vec.y
        }
        return ret
    }

    /**
     * Calculates the multiplication of all given vectors and this.
     * 
     * *If no vectors were given, just returnes this.*
     */
    mult(...v: Vector2[]) {
        const ret = vec2(this.x, this.y)
        for (const vec of v) {
            ret.x *= vec.x
            ret.y *= vec.y
        }
        return ret
    }

    /**
     * Calculates the division of this by given vector.
     */
    div(v: Vector2) {
        return vec2(this.x / v.x, this.y / v.y)
    }

    /**
     * Calculates the dot product of this and given vector.
     */
    dot(v: Vector2) {
        return this.x * v.x + this.y * v.y
    }

    /**
     * Returns vector, perpendicular to this facing right.
     */
    get right() {
        return vec2(this.y, -this.x)
    }

    /**
     * Returns vector, perpendicular to this facing left.
     */
    get left() {
        return vec2(-this.y, this.x)
    }

    /**
     * Returns this vector but it's x and y are absolute.
     */
    get abs() {
        return vec2(Math.abs(this.x), Math.abs(this.y))
    }

    /**
     * Return this vector's length.
     */
    get length() {
        return Math.hypot(this.x, this.y)
    }

    /**
     * Returns a vector negative to this.
     */
    get neg() {
        return vec2(-this.x, -this.y)
    }
}




//* Colliders 🧱

/**
 * Defines the most basic version of collider.
 * 
 * It represents a dot in space.
 */
class Collider {
    pos: Vector2
    color: string
    rotate: number
    intersects = false

    constructor({
        x = 0,
        y = 0,
        rotate = 0,
        color
    }: {
        x?: number
        y?: number
        rotate?: number
        color: string
    }) {
        this.pos = vec2(x, y)
        this.rotate = rotate
        this.color = color
    }

    draw(ctx: CanvasRenderingContext2D) {}
}

/**
 * Ellipse shaped collider, defined by two radiuses.
 */
class Ellipse extends Collider {
    radius: Vector2

    constructor({
        x,
        y,
        rotate,
        color,
        radiusX = 100,
        radiusY = 100
    }: {
        x?: number
        y?: number
        rotate?: number
        color: string
        radiusX?: number
        radiusY?: number
    }) {
        super({ x, y, rotate, color })

        this.radius = vec2(radiusX, radiusY)
    }

    /**
     * Draws this collider on the canvas.
     */
    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.intersects ? 'lime' : this.color
        ctx.beginPath()
        ctx.ellipse(center.x + this.pos.x, center.y + this.pos.y, this.radius.x, this.radius.y, this.rotate, 0, PI2)
        ctx.fill()
        ctx.stroke()
    }
}

/**
 * Circle shaped collider, defined by it's radius.
 */
class Circle extends Ellipse {
    constructor({
        x,
        y,
        rotate,
        color,
        radius = 100
    }: {
        x?: number
        y?: number
        rotate?: number
        color: string
        radius?: number
    }) {
        super({ x, y, rotate, color, radiusX: radius, radiusY: radius })
    }
}

/**
 * Polygon shaped collider, built from relatively positioned vertices.
 * 
 * **Must be convex.**
 */
class Polygon extends Collider {
    verts: Vector2[] = []

    constructor({
        x,
        y,
        rotate,
        color,
        verts
    }: {
        x?: number
        y?: number
        rotate?: number
        color: string
        verts: Vector2[]
    }) {
        super({ x, y, rotate, color })

        if (verts.length < 3) throw new Error('Polygon must contain at least 3 vertices')

        const clockwise = verts[1].sum(verts[0]).right.dot(verts[2].sum(verts[0])) > 0

        for (let i = 0; i < verts.length; i++) {
            const a = verts[i == 0 ? verts.length - 1 : i - 1]
            const b = verts[i]
            const c = verts[i == verts.length - 1 ? 0 : i + 1]

            const b_neg = b.neg

            const ba = a.sum(b_neg)
            const bc = c.sum(b_neg)

            const normal = clockwise ? bc.right : bc.left

            if (normal.dot(ba) <= 0) throw new Error('The polygon must be convex')
        }

        this.verts = verts
    }
}

//TODO: Regular polygon



//* Constants 👓

const PI2 = Math.PI * 2
const center = vec2(500)



//* Colliders List 🚀

const colliders = [
    new Circle({
        x: -200,
        color: 'aquamarine'
    }),
    new Circle({
        x: 200,
        color: 'cadetblue'
    })
]



//* Program Start 🟢

window.addEventListener('load', () => {

    //* Getting elements from the page 🖼️

    const display = <HTMLCanvasElement>document.getElementById('display')
    const ctx = display.getContext('2d')



    //* Variables 👓

    let dragging = -1



    //* Event Listeners 👂

    window.addEventListener('pointerdown', (e: PointerEvent) => {
        dragging = -1
        colliders.forEach((shape, i) => {
            if (Math.hypot(center.x + shape.pos.x - e.pageX, center.y - shape.pos.y - e.pageY) <= shape.radius.x) dragging = i
        })
    })

    window.addEventListener('pointermove', (e: PointerEvent) => {
        if (e.buttons && dragging != -1) {
            colliders[dragging].pos.x += e.movementX
            colliders[dragging].pos.y -= e.movementY
        }
    })



    //* Main Loop 🔄

    /**
     * Fires every frame, detects collisions and redraws onscreen objects.
     */
    const draw = () => {
        ctx.clearRect(0, 0, display.width, display.height)

        colliders.forEach(v => {
            v.intersects = false
        })

        colliders.forEach(v => v.draw(ctx))

        requestAnimationFrame(draw)
    }

    draw()
})