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
    keyDown(name, callback) {
        this.keyDownEvents[name] = callback;
    }
    keyUp(name, callback) {
        this.keyUpEvents[name] = callback;
    }
    keyWatch(...names) {
        names.forEach(name => {
            if (!(name in this.key))
                this.key[name] = false;
        });
    }
}
