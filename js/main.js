import props from './propLoader.js';
import Controls from './controls.js';
import { vec2, Scene, Sprite, Slides } from "./engine.js";
window.addEventListener('load', () => {
    //* Getting elements from the page 🖼️
    const menu = document.getElementById('menu');
    const playBtn = document.getElementById('main-play');
    const settingsBtn = document.getElementById('main-settings');
    const aboutBtn = document.getElementById('main-about');
    const exitBtn = document.getElementById('main-exit');
    const valX = document.getElementById('x');
    const valY = document.getElementById('y');
    const accX = document.getElementById('acc-x');
    const accY = document.getElementById('acc-y');
    const speedX = document.getElementById('speed-x');
    const speedY = document.getElementById('speed-y');
    const valFPS = document.getElementById('fps');
    const display = document.getElementById('display');
    const ctx = display.getContext('2d');
    //* Utility Functions 🧩
    /**
     * Adjustes display size when window is resized.
     */
    const resize = () => {
        const bounds = display.getBoundingClientRect();
        display.width = bounds.width;
        display.height = bounds.height;
    };
    /**
     * Updates upper left corner stats.
     */
    const updateStats = (ent, dt) => {
        valX.innerText = Math.round(ent.position.x).toString();
        valY.innerText = Math.round(ent.position.y).toString();
        accX.innerText = Math.round(ent.acceleration.x).toString();
        accY.innerText = Math.round(ent.acceleration.y).toString();
        speedX.innerText = Math.round(ent.velocity.x / dt).toString();
        speedY.innerText = Math.round(ent.velocity.y / dt).toString();
        valFPS.innerText = Math.round(1 / dt).toString();
    };
    //* Variables & Constants 👓
    let lastTime = 0;
    globalThis.speed = 3000;
    //* Controls 🕹️
    const controls = globalThis.controls = new Controls(window);
    controls.keyWatch('KeyW', 'KeyS', 'KeyA', 'KeyD');
    //* Event Listeners 👂
    window.addEventListener('resize', resize);
    playBtn.addEventListener('click', () => {
        menu.style.display = 'none';
        display.requestPointerLock();
    });
    document.addEventListener('pointerlockchange', () => {
        if (!document.pointerLockElement) {
            menu.style.display = '';
        }
    });
    //* Scene & Objects 🚀
    const scene = globalThis.scene = new Scene(ctx);
    const ship = globalThis.ship = new Sprite({
        img: props.img.ship,
        dumper: vec2(0.06),
        scale: vec2(3)
    });
    const invader1 = new Slides({
        x: -300,
        y: 300,
        img: props.img.invader1,
        scale: vec2(5),
        slides: vec2(1, 5)
    });
    const invader2 = new Slides({
        x: 300,
        y: -300,
        img: props.img.invader2,
        scale: vec2(5),
        slides: vec2(1, 5)
    });
    const invader3 = new Slides({
        x: 300,
        y: 300,
        img: props.img.invader3,
        scale: vec2(5),
        slides: vec2(1, 5)
    });
    const fireIdle = new Slides({
        x: 0,
        y: -300,
        img: props.img.fireIdle,
        scale: vec2(3),
        slides: vec2(4, 1)
    });
    const crosshair = new Slides({
        x: 0,
        y: 200,
        img: props.img.crosshair,
        scale: vec2(0.35),
        slides: vec2(3, 1),
        gap: 0
    });
    scene.entities.push(invader1, invader2, invader3, ship, fireIdle, crosshair);
    scene.camera = ship;
    // scene.showDebug = true
    setInterval(() => {
        fireIdle.next();
    }, 400);
    controls.mouseMove(e => {
        if (document.pointerLockElement) {
            crosshair.position.x += e.movementX;
            crosshair.position.y -= e.movementY;
        }
    });
    //* Main Loop 🔄
    /**
     * Fires every frame, recalculates physics and redraws onscreen objects.
     */
    const draw = (time) => {
        const dt = (time - lastTime) / 1000;
        ctx.clearRect(0, 0, display.width, display.height);
        if (controls.key.KeyW)
            ship.accelerate(0, globalThis.speed);
        if (controls.key.KeyS)
            ship.accelerate(0, -globalThis.speed);
        if (controls.key.KeyA)
            ship.accelerate(-globalThis.speed, 0);
        if (controls.key.KeyD)
            ship.accelerate(globalThis.speed, 0);
        updateStats(ship, dt);
        scene.updatePositions(dt);
        scene.draw(dt);
        document.body.style.setProperty('--background-pos', `${-ship.position.x / 20 - 500}px ${ship.position.y / 20 - 500}px`);
        lastTime = time;
        requestAnimationFrame(draw);
    };
    //* Program Start 🟢
    resize();
    draw(0);
});
