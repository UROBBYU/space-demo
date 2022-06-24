type KeyCallback = (e: KeyboardEvent) => void

type KeyEvents = { [name: string]: KeyCallback }

/**
 * Sets common key and mouse event listeners.
 */
export default class Controls {
    readonly key: { [name: string]: boolean } = {}

    readonly keyDownEvents: KeyEvents = {}
    readonly keyUpEvents: KeyEvents = {}

    constructor(target: EventTarget) {
        target.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.code in this.key) this.key[e.code] = true
            if (e.code in this.keyDownEvents) this.keyDownEvents[e.code](e)
        })

        target.addEventListener('keyup', (e: KeyboardEvent) => {
            if (e.code in this.key) this.key[e.code] = false
            if (e.code in this.keyUpEvents) this.keyUpEvents[e.code](e)
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
}