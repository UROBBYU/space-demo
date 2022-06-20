type KeyCallback = (e: KeyboardEvent) => void

type KeyEvents = { [name: string]: KeyCallback }

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

    keyDown(name: string, callback: KeyCallback) {
        this.keyDownEvents[name] = callback
    }

    keyUp(name: string, callback: KeyCallback) {
        this.keyUpEvents[name] = callback
    }

    keyWatch(...names: string[]) {
        names.forEach(name => {
            if (!(name in this.key)) this.key[name] = false
        })
    }
}