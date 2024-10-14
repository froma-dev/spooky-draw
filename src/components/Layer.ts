interface params {
    type?: string
    src?: string
}

export default class Layer {
    $el: HTMLElement

    constructor({type, src}: params) {
        const canvas = this.$el = document.createElement('canvas')
        canvas.classList.add(`--${type}`)
        canvas.width = 1128
        canvas.height = 799

        if (src) {
            const ctx = canvas.getContext('2d')
            const image = new Image()

            image.addEventListener('load', () => {
                ctx?.drawImage(image, 0, 0, canvas.width, canvas.height)
            })

            image.src = src
        }
    }

    get el () {
        return this.$el
    }
}

