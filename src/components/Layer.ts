export interface LayerParams {
    type?: string
}

export default class Layer {
    $el: HTMLCanvasElement

    constructor({type}: LayerParams) {
        const canvas = this.$el = document.createElement('canvas')
        canvas.classList.add(`--${type}`)
        canvas.width = 1128
        canvas.height = 799
    }

    get el () {
        return this.$el
    }
}

