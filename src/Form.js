import {ArcEvents} from "arc-lib";

class Form {
    #form = {};
    #modifiers = {};
    #validChecks = {};

    constructor() {
        ArcEvents.mixin(this);
    }

    removeField(_name) {
        delete this.#form[_name];
        delete this.#modifiers[_name];
        delete this.#validChecks[_name];
    }

    initField(_name, _value, _modifier, _isValid=true) {
        this.#form[_name] = _value;
        this.#modifiers[_name] = _modifier;
        this.#validChecks[_name] = _isValid;
    }

    getField(_name) {
        return this.#form[_name];
    }

    updateField(_name, _value, _isValid) {
        this.#form[_name] = _value;
        this.#validChecks[_name] = _isValid;
        this.emit('change', [this]);
        this.emit(_name, [_value, _isValid, this]);
    }

    modifyField(_name, _value) {
        this.#modifiers[_name](_value);
    }

    getData(){
       return this.#form;
    }

    isValid() {
        let isValid = true;
        Object.keys(this.#validChecks).forEach((_key) => {
            if(!this.#validChecks[_key]){
                isValid = false;
            }
        })
        return isValid;
    }
}

export default Form;
