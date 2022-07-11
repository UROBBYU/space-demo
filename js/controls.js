/**
 * Sets common key and mouse event listeners.
 */
export default class Controls {
    key = {};
    mouse = {};
    keyDownEvents = {};
    keyUpEvents = {};
    mouseMoveEvent;
    mouseDownEvents = {};
    mouseUpEvents = {};
    constructor(target) {
        target.addEventListener('keydown', (e) => {
            if (e.code in this.key)
                this.key[e.code] = true;
            if (e.code in this.keyDownEvents)
                this.keyDownEvents[e.code](e);
        });
        target.addEventListener('keyup', (e) => {
            if (e.code in this.key)
                this.key[e.code] = false;
            if (e.code in this.keyUpEvents)
                this.keyUpEvents[e.code](e);
        });
        target.addEventListener('mousemove', (e) => {
            this.mouseMoveEvent?.(e);
        });
        target.addEventListener('mousedown', (e) => {
            if (e.button in this.mouse)
                this.key[e.button] = true;
            if (e.button in this.mouseDownEvents)
                this.mouseDownEvents[e.button](e);
        });
        target.addEventListener('mouseup', (e) => {
            if (e.button in this.mouse)
                this.key[e.button] = false;
            if (e.button in this.mouseUpEvents)
                this.mouseUpEvents[e.button](e);
        });
    }
    /**
     * Sets 'keydown' event for given key.
     */
    keyDown(name, callback) {
        this.keyDownEvents[name] = callback;
    }
    /**
     * Sets 'keyup' event for given key.
     */
    keyUp(name, callback) {
        this.keyUpEvents[name] = callback;
    }
    /**
     * Enables key state watching.
     *
     * Key state can be get from {@link key key map}.
     */
    keyWatch(...names) {
        names.forEach(name => {
            this.key[name] ??= false;
        });
    }
    /**
     * Sets 'mousemove' event
     */
    mouseMove(callback) {
        this.mouseMoveEvent = callback;
    }
    /**
     * Sets 'mousedown' event for given button.
     */
    mouseDown(button, callback) {
        this.mouseDownEvents[button] = callback;
    }
    /**
     * Sets 'mouseup' event for given button.
     */
    mouseUp(button, callback) {
        this.mouseUpEvents[button] = callback;
    }
    /**
     * Enables button state watching.
     *
     * button state can be get from {@link mouse mouse map}.
     */
    mouseWatch(...buttons) {
        buttons.forEach(button => {
            this.mouse[button] ??= false;
        });
    }
}
