interface params {
    type?: string
}

export default class Layer {
    $el: HTMLElement
    constructor({type}: params) {
        const canvas = this.$el = document.createElement('canvas')
        canvas.classList.add(`--${type}`)
        canvas.width = 1128
        canvas.height = 799
    }

    get el () {
        return this.$el
    }
}

