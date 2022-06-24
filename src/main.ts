import Controls from './controls.js'
import { Entity, Shape, vec2, Scene, Sprite } from "./engine.js"

window.addEventListener('load', () => {

    //* Getting elements from the page 🖼️

    const valX = document.getElementById('x')
    const valY = document.getElementById('y')
    const accX = document.getElementById('acc-x')
    const accY = document.getElementById('acc-y')
    const speedX = document.getElementById('speed-x')
    const speedY = document.getElementById('speed-y')
    const valFPS = document.getElementById('fps')

    const display = <HTMLCanvasElement>document.getElementById('display')
    const ctx = display.getContext('2d')


    
    //* Utility Functions 🧩

    /**
     * Adjustes display size when window is resized.
     */
    const resize = () => {
        const bounds = display.getBoundingClientRect()

        display.width = bounds.width
        display.height = bounds.height
    }

    /**
     * Updates upper left corner stats.
     */
    const updateStats = (ent: Entity, dt: number) => {
        valX.innerText = Math.round(ent.position.x).toString()
        valY.innerText = Math.round(ent.position.y).toString()
        accX.innerText = Math.round(ent.acceleration.x).toString()
        accY.innerText = Math.round(ent.acceleration.y).toString()
        speedX.innerText = Math.round(ent.velocity.x / dt).toString()
        speedY.innerText = Math.round(ent.velocity.y / dt).toString()
        valFPS.innerText = Math.round(1 / dt).toString()
    }



    //* Variables & Constants 👓

    let lastTime = 0

    globalThis.speed = 3000



    //* Controls 🕹️

    const controls = globalThis.controls = new Controls(window)

    controls.keyWatch('KeyW', 'KeyS', 'KeyA', 'KeyD')



    //* Event Listeners 👂

    window.addEventListener('resize', resize)



    //* Scene & Objects 🚀

    const scene = globalThis.scene = new Scene(ctx)

    const ship = globalThis.ship = new Sprite({
        x: 300,
        y: 300,
        img: <HTMLImageElement>document.querySelector('#props img'),
        dumper: vec2(0.06),
        scale: vec2(3),
        flipY: true
    })
    const square = new Shape({
        x: -300,
        y: 300,
        verts: [
            vec2(-20, -20),
            vec2(20, -20),
            vec2(20, 20),
            vec2(-20, 20)
        ]
    }).setStyle({
        fillColor: 'lime'
    })

    scene.entities.push(square, ship)
    scene.camera = ship
    scene.showDebug = true



    //* Main Loop 🔄

    /**
     * Fires every frame, recalculates physics and redraws onscreen objects.
     */
    const draw = (time: number) => {
        const dt = (time - lastTime) / 1000

        ctx.clearRect(0, 0, display.width, display.height)

        if (controls.key.KeyW) ship.accelerate(0, globalThis.speed)
        if (controls.key.KeyS) ship.accelerate(0, -globalThis.speed)
        if (controls.key.KeyA) ship.accelerate(-globalThis.speed, 0)
        if (controls.key.KeyD) ship.accelerate(globalThis.speed, 0)
        
        updateStats(ship, dt)

        scene.updatePositions(dt)

        scene.draw(dt)

        document.body.style.setProperty('--background-pos', `${-ship.position.x / 20 - 500}px ${ship.position.y / 20 - 500}px`)

        lastTime = time
        
        requestAnimationFrame(draw)
    }



    //* Program Start 🟢

    resize()
    draw(0)
})