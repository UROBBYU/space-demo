import props from './propLoader.js'
import Controls from './controls.js'
import { Entity, Shape, vec2, Scene, Sprite, Slides, Link } from "./engine.js"
import type { Howl, HowlOptions } from './howler'

window.addEventListener('load', () => {

    //* Getting elements from the page 🖼️

    const menu = document.getElementById('menu')
    const playBtn = document.getElementById('main-play')
    const settingsBtn = document.getElementById('main-settings')
    const aboutBtn = document.getElementById('main-about')
    const exitBtn = document.getElementById('main-exit')

    const stats = document.getElementById('stats')
    const valX = document.getElementById('x')
    const valY = document.getElementById('y')
    const accX = document.getElementById('acc-x')
    const accY = document.getElementById('acc-y')
    const speedX = document.getElementById('speed-x')
    const speedY = document.getElementById('speed-y')
    const valFPS = document.getElementById('fps')

    const audioElem = stats.getElementsByTagName('audio')[0]

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

        halfScreen = vec2(display.width / 2, display.height / 2)
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

    /**
     * Forward animation for crosshair.
     */
    const crosshairAnimNext = () => {
        clearTimeout(crosshairAnimTimeout)

        if (crosshair.slide.x < crosshair.slides.x - 1) {
            crosshair.next()
            crosshairAnimTimeout = setTimeout(crosshairAnimNext, 20)
        }
    }

    /**
     * Backward animation for crosshair.
     */
    const crosshairAnimPreviuos = () => {
        clearTimeout(crosshairAnimTimeout)

        if (crosshair.slide.x > 0) {
            crosshair.previous()
            crosshairAnimTimeout = setTimeout(crosshairAnimPreviuos, 20)
        }
    }

    /**
     * Moves focus on buttons in main menu up.
     */
    const moveFocusUp = () => {
        if (!document.pointerLockElement) {
            const buttons = <HTMLButtonElement[]>[...menu.querySelectorAll('.menu-button')]
            const activeButton = <HTMLButtonElement>document.activeElement

            if (activeButton == buttons[0] || !buttons.includes(activeButton))
                buttons.at(-1).focus()
            else (<HTMLButtonElement>activeButton.previousElementSibling).focus()
        }
    }

    /**
     * Moves focus on buttons in main menu down.
     */
    const moveFocusDown = () => {
        if (!document.pointerLockElement) {
            const buttons = <HTMLButtonElement[]>[...menu.querySelectorAll('.menu-button')]
            const activeButton = <HTMLButtonElement>document.activeElement

            if (activeButton == buttons.at(-1) || !buttons.includes(activeButton))
                buttons[0].focus()
            else (<HTMLButtonElement>activeButton.nextElementSibling).focus()
        }
    }



    //* Variables & Constants 👓

    let pause = true

    let lastTime = 0

    const mousePos = vec2(0, 200)

    let halfScreen = vec2(display.width / 2, display.height / 2)

    let crosshairAnimTimeout = -1
    let shootInterval = -1

    let lastAcc = false
    let accelerating = false

    const shootSound: Howl = new globalThis.Howl({
        src: ['assets/sound/shoot.mp3'],
        volume: 0.05
    } as HowlOptions)

    globalThis.speed = 3000

    audioElem.currentTime = 55.7



    //* Controls 🕹️

    const controls = globalThis.controls = new Controls(window)

    controls.keyWatch('KeyW', 'KeyS', 'KeyA', 'KeyD')

    controls.keyDown('ArrowUp', moveFocusUp)
    controls.keyDown('KeyW', moveFocusUp)

    controls.keyDown('ArrowDown', moveFocusDown)
    controls.keyDown('KeyS', moveFocusDown)

    controls.keyUp('BracketLeft', () => {
        stats.hidden = !stats.hidden
    })

    controls.keyUp('BracketRight', () => {
        scene.showDebug = !scene.showDebug
    })

    controls.mouseMove(e => {
        if (document.pointerLockElement) {
            mousePos.x += e.movementX
            mousePos.y -= e.movementY

            if (Math.abs(mousePos.x) > halfScreen.x) mousePos.x = Math.sign(mousePos.x) * halfScreen.x
            if (Math.abs(mousePos.y) > halfScreen.y) mousePos.y = Math.sign(mousePos.y) * halfScreen.y

            ship.rotate = Math.atan2(mousePos.y, mousePos.x) - 1.57
        }
    })

    controls.mouseDown(0, () => {
        if (document.pointerLockElement) {
            crosshairAnimNext()

            let shootLeft = true

            shootInterval = setInterval(() => {
                const shipDir = vec2(Math.cos(ship.rotate + 1.57), Math.sin(ship.rotate + 1.57))
                const shootPos = vec2(Math.cos(ship.rotate + 0.7 + 1.74 * +shootLeft), Math.sin(ship.rotate + 0.7 + 1.74 * +shootLeft)).mult(vec2(22)).sum(ship.position)

                const proj = new Shape({
                    x: shootPos.x,
                    y: shootPos.y,
                    verts: [
                        vec2(0),
                        vec2(0, 10)
                    ],
                    dumper: vec2(0),
                    rotate: ship.rotate,
                    acceleration: vec2(shipDir.x * 80000, shipDir.y * 80000),
                    timeOfLife: 2
                }).setStyle({
                    fillColor: 'none',
                    strokeColor: 'cyan',
                    lineJoin: 'round',
                    lineWidth: 6
                })

                scene.entities.push(proj)

                shootSound.play()

                shootLeft = !shootLeft
            }, 40)
        }
    })

    controls.mouseUp(0, () => {
        if (document.pointerLockElement) {
            crosshairAnimPreviuos()
            
            clearInterval(shootInterval)
        }
    })



    //* Event Listeners 👂

    window.addEventListener('resize', resize)

    playBtn.addEventListener('click', () => {
        menu.hidden = true
        display.classList.remove('unfocus')
        display.requestPointerLock()
        pause = false
        crosshair.hidden = false

        audioElem.volume = 0.1
        if (audioElem.paused) audioElem.play()
    })

    settingsBtn.addEventListener('click', () => {
        stats.hidden = !stats.hidden
    })

    aboutBtn.addEventListener('click', () => {
        location.assign('https://github.com/UROBBYU/space-demo')
    })

    exitBtn.addEventListener('click', () => {
        location.reload()
    })

    document.addEventListener('pointerlockchange', () => {
        if (!document.pointerLockElement) {
            crosshair.hidden = true
            pause = true;
            menu.hidden = false
            display.classList.add('unfocus')

            audioElem.volume = 0.05
        }
    })



    //* Scene & Objects 🚀

    const scene = globalThis.scene = new Scene(ctx)

    const ship = globalThis.ship = new Sprite({
        img: props.img.ship,
        dumper: vec2(0.06)
    })

    const invader1 = new Slides({
        x: -300,
        y: 300,
        img: props.img.invader1,
        scale: vec2(5),
        slides: vec2(1, 5)
    })
    const invader2 = new Slides({
        x: 300,
        y: -300,
        img: props.img.invader2,
        scale: vec2(5),
        slides: vec2(1, 5)
    })
    const invader3 = new Slides({
        x: 300,
        y: 300,
        img: props.img.invader3,
        scale: vec2(5),
        slides: vec2(1, 5)
    })
    const fireIdle = new Slides({
        x: 0,
        y: -15.5,
        img: props.img.fireIdle,
        slides: vec2(4, 1),
        hidden: true
    })
    const fireStart = new Slides({
        x: 0,
        y: -15.5,
        img: props.img.fireStart,
        slides: vec2(2, 1),
        hidden: true
    })
    const crosshair = new Slides({
        x: 0,
        y: 200,
        img: props.img.crosshair,
        scale: vec2(0.35),
        slides: vec2(3, 1),
        gap: 0,
        hidden: true,
        imageSmoothing: true
    })
    const asteroidBase = new Slides({
        x: -300,
        y: -300,
        img: props.img.asteroid,
        slides: vec2(9, 1),
        slide: vec2(2, 0),
        gap: 2
    })
    const asteroidResource = new Slides({
        x: -300,
        y: -300.01,
        img: props.img.asteroid,
        slides: vec2(9, 1),
        slide: vec2(4, 0),
        gap: 2
    })

    scene.links.push(
        new Link({
            parent: ship,
            child: fireIdle
        }),
        new Link({
            parent: ship,
            child: fireStart
        }),
        new Link({
            parent: ship,
            child: invader1,
            lockAngle: false,
            lockRotation: false,
            lockScale: false,
            scaleDistance: false
        }),
        new Link({
            parent: ship,
            child: invader2,
            lockAngle: false,
            lockRotation: false,
            lockScale: false,
            scaleDistance: false
        }),
        new Link({
            parent: ship,
            child: invader3,
            lockAngle: false,
            lockRotation: false,
            lockScale: false,
            scaleDistance: false
        }),
        new Link({
            parent: asteroidBase,
            child: asteroidResource
        })
    )

    scene.entities.push(asteroidBase, asteroidResource, invader1, invader2, invader3, ship, fireIdle, fireStart, crosshair)
    scene.camera = ship

    ship.scale = vec2(3)
    asteroidBase.scale = vec2(4)

    setInterval(() => fireIdle.next(), 400)
    
    setInterval(() => {
        [invader1, invader2, invader3].forEach(invader => {
            const absVel = invader.velocity.abs

            if (Math.max(absVel.x, absVel.y) < 5) {
                invader.slide.y = 3
                return
            }

            const xMax = absVel.x > absVel.y
            const maxSign = Math.sign(xMax ? invader.velocity.x : invader.velocity.y)

            if (xMax && maxSign == -1) invader.slide.y = 4
            else if (xMax && maxSign == 1) invader.slide.y = 0
            else if (!xMax && maxSign == -1) invader.slide.y = 1
            else if (!xMax && maxSign == 1) invader.slide.y = 2
        })
    }, 100)



    //* Main Loop 🔄

    /**
     * Fires every frame, recalculates physics and redraws onscreen objects.
     */
    const draw = (time: number) => {
        const dt = (time - lastTime) / 1000

        ctx.clearRect(0, 0, display.width, display.height)

        if (!pause) {
            if (controls.key.KeyW) ship.accelerate(0, globalThis.speed)
            if (controls.key.KeyS) ship.accelerate(0, -globalThis.speed)
            if (controls.key.KeyA) ship.accelerate(-globalThis.speed, 0)
            if (controls.key.KeyD) ship.accelerate(globalThis.speed, 0)

            if (ship.acceleration.length) {
                if (!lastAcc && !accelerating) {
                    accelerating = true
    
                    setTimeout(() => {
                        fireIdle.hidden = true
                        fireStart.hidden = false
                        fireStart.slide.x = 0
                    }, 50)
                    setTimeout(() => {
                        fireStart.slide.x = 1
                    }, 100)
                    setTimeout(() => {
                        fireStart.hidden = true
                        fireIdle.hidden = false
                        accelerating = false
                    }, 150)
                }
                lastAcc = true
            } else {
                if (lastAcc) {
                    setTimeout(() => {
                        fireIdle.hidden = true
                        fireStart.hidden = false
                        fireStart.slide.x = 1
                    }, 50)
                    setTimeout(() => {
                        fireStart.slide.x = 0
                    }, 100)
                    setTimeout(() => {
                        fireStart.hidden = true
                    }, 150)
                }
                lastAcc = false
            }
            
            updateStats(ship, dt)

            scene.updatePositions(dt)

            crosshair.position = scene.camera.position.sum(mousePos)
        }

        scene.draw(dt)

        document.body.style.setProperty('--background-pos', `${-ship.position.x / 20 - 500}px ${ship.position.y / 20 - 500}px`)

        lastTime = time
        
        requestAnimationFrame(draw)
    }



    //* Program Start 🟢

    resize()
    draw(0)
})