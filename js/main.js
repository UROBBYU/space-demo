import { Shape, vec2, Scene, Sprite } from "./engine.js";
import Controls from './controls.js';
const speed = 0.003;
/* const ship = new Shape({
    x: 300,
    y: 300,
    verts: [
        vec2(-20, -30),
        vec2(20, -30),
        vec2(0, 30)
    ]
}).setStyle({
    lineWidth: 10,
    lineJoin: 'round',
    strokeColor: 'white',
    fillColor: 'white'
}) */
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
    const controls = globalThis.controls = new Controls(window);
    const ship = globalThis.ship = new Sprite({
        x: 300,
        y: 300,
        img: document.querySelector('#props img'),
        dumper: vec2(0.06),
        scale: vec2(3),
        flipY: true
    });
    const cube = new Shape({
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
    });
    const scene = globalThis.scene = new Scene(ctx);
    scene.entities.push(cube, ship);
    scene.camera = ship;
    scene.showDebug = true;
    window.addEventListener('resize', resize);
    controls.keyWatch('KeyW', 'KeyS', 'KeyA', 'KeyD');
    const draw = (time) => {
        const dt = time - lastTime;
        ctx.clearRect(0, 0, display.width, display.height);
        if (controls.key.KeyW)
            ship.accelerate(0, speed);
        if (controls.key.KeyS)
            ship.accelerate(0, -speed);
        if (controls.key.KeyA)
            ship.accelerate(-speed, 0);
        if (controls.key.KeyD)
            ship.accelerate(speed, 0);
        updateStats(ship, dt);
        scene.updatePosition(dt);
        scene.draw(dt);
        document.body.style.setProperty('--background-pos', `${-ship.pos.x / 20}px ${ship.pos.y / 20}px`);
        lastTime = time;
        requestAnimationFrame(draw);
    };
    resize();
    draw(0);
});
