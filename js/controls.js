/**
 * Sets common key and mouse event listeners.
 */
export default class Controls {
    key = {};
    keyDownEvents = {};
    keyUpEvents = {};
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
}
