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
     * Calculates the difference between gien vector and this.
     */
    dif(v: Vector2) {
        return vec2(this.x - v.x, this.y - v.y)
    }

    /**
     * Calculates the multiplication of all given vectors and this.
     * _If no vectors were given, just returnes this._
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
     * 
     * _A/B_
     */
    div(v: Vector2) {
        return vec2(this.x / v.x, this.y / v.y)
    }

    /**
     * Calculates the multiplication of given number and this.
     * 
     * _n•A_
     */
    scale(n: number) {
        return vec2(this.x * n, this.y * n)
    }

    /**
     * Calculates the dot product of this and given vector.
     * 
     * _A•B_
     */
    dot(v: Vector2) {
        return this.x * v.x + this.y * v.y
    }

    /**
     * Calculates the triple product of this and given vector.
     * 
     * _(A×B)×A_
     */
    triProd(v: Vector2) {
        const crossZ = this.x * v.y - this.y * v.x
        return vec2(this.y * crossZ, -this.x * crossZ)
    }

    /**
     * Returns vector, perpendicular to this facing right.
     * 
     * ↱
     */
    get right() {
        return vec2(this.y, -this.x)
    }

    /**
     * Returns vector, perpendicular to this facing left.
     * 
     * ↰
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
     * 
     * _|A|_
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


    /**
     * Returns this vector but with length equal to 1.
     */
    get norm() {
        return this.scale(1 / this.length)
    }

    /**
     * Return this vector's rotation.
     */
    get rotation() {
        return Math.atan2(this.y, this.x)
    }

    /**
     * Creates a vector from length and rotation.
     */
    static fromDegree(length: number, degree: number) {
        return vec2(length * Math.cos(degree), length * Math.sin(degree))
    }
}

const furthestInDir = (s1: Collider, s2: Collider, rot: Vector2) => {
    const v1 = s1.support(rot).sum(s1.position)
    const v2 = s2.support(rot.neg).sum(s1.position)
    return v1.sum(v2.neg)
}




//* Colliders 🧱

/**
 * Defines the most basic version of collider.
 * 
 * It represents a dot in space.
 */
class Collider {
    #rotate: number

    position: Vector2
    color: string
    intersects = false
    shadeIntersects = false

    shade: [Vector2, Vector2]

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
        this.position = vec2(x, y)
        this.rotate = rotate
        this.color = color

        this.setShade()
    }

    setShade(shade: [Vector2, Vector2] = [vec2(0), vec2(0)]) {
        this.shade = shade
    }

    draw(ctx: CanvasRenderingContext2D) {}

    drawShade(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.shadeIntersects ? 'green' : 'grey'
        const size = this.shade[1].sum(this.shade[0].neg)
        ctx.fillRect(
            this.globalPosition.x + this.shade[0].x,
            this.globalPosition.y + this.shade[0].y,
            size.x,
            size.y,
        )
    }

    support(direction: Vector2) { return vec2(0) }

    shadeIntersect(s: Collider) {
        const s1_min = this.globalPosition.sum(this.shade[0])
        const s1_max = this.globalPosition.sum(this.shade[1])
        const s2_min = s.globalPosition.sum(s.shade[0])
        const s2_max = s.globalPosition.sum(s.shade[1])

        if (s1_min.x < s2_max.x &&
            s2_min.x < s1_max.x &&
            s1_min.y < s2_max.y &&
            s2_min.y < s1_max.y
        ) return true
    }

    intersect(s: Collider): boolean {
        if (!this.shadeIntersect(s)) false

        // Get first p1

        let dir = s.position.sum(this.position.neg)

        let p1 = furthestInDir(this, s, dir)

        // Get p2 as farthest point towards the origin

        dir = p1.neg

        let p2 = furthestInDir(this, s, dir)

        // Check if p2 is beyond the origin

        if (p2.dot(dir) < 0) return false

        // Get p3 from normal p1-2 to origin

        const p12 = p2.sum(dir)
        dir = p12.triProd(p1)

        let p3 = furthestInDir(this, s, dir)

        const check = (iter: number) => {
            if (iter <= 0) return false

            // Check if p3 is beyond the origin

            if (p3.dot(dir) < 0) return false

            // Check if triangle contains the origin

            const p3_neg = p3.neg
    
            const p32 = p2.dif(p3)
            const p31 = p1.dif(p3)

            dir = p32.triProd(p31)

            const c = p3_neg.dot(dir)

            if (Math.abs(c) < 0.001) return false

            if (c > 0) { // BC
                p1 = p3

                p3 = furthestInDir(this, s, dir)

                return check(iter - 1)
            } else { // AC + Tri
                dir = p31.triProd(p32)

                const c = p3_neg.dot(dir)

                if (Math.abs(c) < 0.001) return false

                if (c > 0) { // AC
                    p2 = p3

                    p3 = furthestInDir(this, s, dir)

                    return check(iter - 1)
                } else return true // Tri
            }
        }

        return check(30)
    }

    get globalPosition() {
        return center.sum(this.position)
    }

    get rotate() {
        return this.#rotate
    }
    set rotate(v) {
        this.#rotate = v
        this.setShade()
    }
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

        this.shade = [
            this.radius.neg,
            this.radius
        ]
    }

    /**
     * Draws this collider on the canvas.
     */
    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.intersects ? 'lime' : this.color
        ctx.beginPath()
        ctx.ellipse(this.globalPosition.x, this.globalPosition.y, this.radius.x, this.radius.y, this.rotate, 0, PI2)
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

    support(direction: Vector2) {
        const rot = Math.atan2(direction.y, direction.x)

        return Vector2.fromDegree(this.radius.x, rot).sum(this.position)
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
        verts,
        chk = true
    }: {
        x?: number
        y?: number
        rotate?: number
        color: string
        verts: Vector2[]
        chk?: boolean
    }) {
        super({ x, y, rotate, color })

        if (verts.length < 3) throw new Error('Polygon must contain at least 3 vertices')

        const v0_neg = verts[0].neg
        const clockwise = verts[1].sum(v0_neg).right.dot(verts[2].sum(v0_neg)) > 0

        for (let i = 0; i < verts.length; i++) {
            const a = verts[i == 0 ? verts.length - 1 : i - 1]
            const b = verts[i]
            const c = verts[i == verts.length - 1 ? 0 : i + 1]

            const b_neg = b.neg

            const ba = a.sum(b_neg)
            const bc = c.sum(b_neg)

            const normal = clockwise ? bc.right : bc.left

            if (chk && normal.dot(ba) <= 0) throw new Error('The polygon must be convex')
        }

        this.verts = verts

        this.setShade()
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.intersects ? 'lime' : this.color

        const cos = Math.cos(this.rotate)
        const sin = Math.sin(this.rotate)

        ctx.beginPath()
        ctx.moveTo(this.globalPosition.x + this.verts[0].x * cos - this.verts[0].y * sin, this.globalPosition.y + this.verts[0].x * sin + this.verts[0].y * cos)
        for (let i = 1; i < this.verts.length; i++) {
            const vert = this.verts[i]
            ctx.lineTo(this.globalPosition.x + vert.x * cos - vert.y * sin, this.globalPosition.y + vert.x * sin + vert.y * cos)
        }
        ctx.closePath()

        ctx.fill()
        ctx.stroke()
    }

    setShade() {
        const min = vec2(Infinity, Infinity)
        const max = vec2(-Infinity, -Infinity)

        const cos = Math.cos(this.rotate)
        const sin = Math.sin(this.rotate)

        this.verts?.forEach(v => {
            v = vec2(v.x * cos - v.y * sin, v.x * sin + v.y * cos)

            if (v.x < min.x) min.x = v.x
            if (v.x > max.x) max.x = v.x
            if (v.y < min.y) min.y = v.y
            if (v.y > max.y) max.y = v.y
        })

        super.setShade([min, max])
    }

    //TODO: Support function
}

class Regular extends Polygon {
    vertices: number
    radius: number

    constructor({
        x,
        y,
        rotate,
        color,
        radius = 100,
        vertices
    }: {
        x?: number
        y?: number
        rotate?: number
        color: string
        radius?: number
        vertices: number,
    }) {
        const verts: Vector2[] = []
        const dAng = PI2 / vertices
        const ang = vertices % 2 ? PI_2 : (Math.PI - dAng) * .5
        verts.push(vertices % 2 ? vec2(0, radius) : Vector2.fromDegree(radius, ang))

        const maxAng = PI2 + ang - 0.0001
        for (let i = ang + dAng; i < maxAng; i += dAng) verts.push(Vector2.fromDegree(radius, i))

        super({ x, y, rotate, color, verts })

        this.radius = radius
        this.vertices = vertices
    }

    support(direction: Vector2) {
        const ang = PI2 / this.vertices
        const stRot = this.vertices % 2 ? PI_2 : PI_2 - ang / 2
        const rot = direction.rotation - stRot

        let i = Math.round(rot / ang)
        if (i < 0) i += this.vertices
        if (i >= this.vertices) i -= this.vertices

        return this.verts[i].sum(this.position)
    }
}



//* Constants 👓

const PI2 = Math.PI * 2
const PI_2 = Math.PI * .5
const center = vec2(500)



//* Colliders List 🚀

const colliders: Collider[] = [
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
        y: -200,
        color: 'aquamarine',
        vertices: 5
    }),
    new Regular({
        y: 200,
        color: 'cadetblue',
        vertices: 3
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
            if (Math.hypot(center.x + shape.position.x - e.pageX, center.y - shape.position.y - e.pageY) <= 50) dragging = i
        })
    })

    window.addEventListener('pointermove', (e: PointerEvent) => {
        if (e.buttons && dragging != -1) {
            colliders[dragging].position.x += e.movementX
            colliders[dragging].position.y -= e.movementY
        }
    })



    //* Main Loop 🔄

    /**
     * Fires every frame, detects collisions and redraws onscreen objects.
     */
    const draw = () => {
        ctx.clearRect(0, 0, display.width, display.height)

        colliders.forEach(v => {
            v.shadeIntersects = false
            v.intersects = false
        })

        colliders.forEach((s1, i) => {
            for (let j = i + 1; j < colliders.length; j++) {
                const s2 = colliders[j]
                
                if (s1.shadeIntersect(s2)) {
                    s1.shadeIntersects = s2.shadeIntersects = true

                    if (s1.intersect(s2)) s1.intersects = s2.intersects = true
                }
            }

            s1.drawShade(ctx)
        })

        ctx.strokeStyle = 'black'
        ctx.beginPath()
        ctx.moveTo(500, 0)
        ctx.lineTo(500, 1000)
        ctx.moveTo(0, 500)
        ctx.lineTo(1000, 500)
        ctx.stroke()

        colliders.forEach(v => v.draw(ctx))

        requestAnimationFrame(draw)
    }

    draw()
})