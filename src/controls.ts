type KeyCallback = (e: KeyboardEvent) => void

type KeyEvents = { [name: string]: KeyCallback }

type MouseCallback = (e: MouseEvent) => void

type MouseEvents = { [name: string]: MouseCallback }

/**
 * Sets common key and mouse event listeners.
 */
export default class Controls {
    readonly key: { [name: string]: boolean } = {}
    readonly mouse: { [button: number]: boolean } = {}

    readonly keyDownEvents: KeyEvents = {}
    readonly keyUpEvents: KeyEvents = {}

    mouseMoveEvent: MouseCallback
    readonly mouseDownEvents: MouseEvents = {}
    readonly mouseUpEvents: MouseEvents = {}

    constructor(target: EventTarget) {
        target.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.code in this.key) this.key[e.code] = true
            if (e.code in this.keyDownEvents) this.keyDownEvents[e.code](e)
        })

        target.addEventListener('keyup', (e: KeyboardEvent) => {
            if (e.code in this.key) this.key[e.code] = false
            if (e.code in this.keyUpEvents) this.keyUpEvents[e.code](e)
        })

        target.addEventListener('mousemove', (e: MouseEvent) => {
            this.mouseMoveEvent?.(e)
        })

        target.addEventListener('mousedown', (e: MouseEvent) => {
            if (e.button in this.mouse) this.key[e.button] = true
            if (e.button in this.mouseDownEvents) this.mouseDownEvents[e.button](e)
        })

        target.addEventListener('mouseup', (e: MouseEvent) => {
            if (e.button in this.mouse) this.key[e.button] = false
            if (e.button in this.mouseUpEvents) this.mouseUpEvents[e.button](e)
        })
    }

    /**
     * Sets 'keydown' event for given key.
     */
    keyDown(name: string, callback: KeyCallback) {
        this.keyDownEvents[name] = callback
    }

    /**
     * Sets 'keyup' event for given key.
     */
    keyUp(name: string, callback: KeyCallback) {
        this.keyUpEvents[name] = callback
    }

    /**
     * Enables key state watching.
     * 
     * Key state can be get from {@link key key map}.
     */
    keyWatch(...names: string[]) {
        names.forEach(name => {
            this.key[name] ??= false
        })
    }

    /**
     * Sets 'mousemove' event
     */
    mouseMove(callback: MouseCallback) {
        this.mouseMoveEvent = callback
    }

    /**
     * Sets 'mousedown' event for given button.
     */
    mouseDown(button: number, callback: MouseCallback) {
        this.mouseDownEvents[button] = callback
    }

    /**
     * Sets 'mouseup' event for given button.
     */
    mouseUp(button: number, callback: MouseCallback) {
        this.mouseUpEvents[button] = callback
    }

    /**
     * Enables button state watching.
     * 
     * button state can be get from {@link mouse mouse map}.
     */
    mouseWatch(...buttons: number[]) {
        buttons.forEach(button => {
            this.mouse[button] ??= false
        })
    }
}