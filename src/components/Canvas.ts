export default class Canvas {
    $el: HTMLElement
    $imageCanvas: HTMLImageElement | null = null

    constructor() {
        this.$el = document.createElement('div')
        this.$el.classList.add('canvas-container')

        this.setListeners()
    }

    setListeners() {
        document.addEventListener('click', (ev: Event) => {
            const target = ev.target as HTMLElement

            if (target.id === 'take-photo') this.triggerCamera()
        })
    }

    appendChild<T extends HTMLElement>(child: T) {
        this.$el.appendChild(child)
    }

    removeChild<T extends HTMLElement>(child: T) {
        this.$el.removeChild<T>(child)
    }

    triggerCamera() {
        console.log('trigger camera!')
    }

    setImageCanvas(src: string) {
        const img = this.$imageCanvas = new Image()
        img.classList.add('image-canvas')
        img.src = src

        this.appendChild(img)
    }

    updateImageCanvas(src: string) {
        if (this.$imageCanvas !== null) {
            this.$imageCanvas.src = src
        }
    }

    removeImageCanvas() {
        if (this.$imageCanvas !== null) this.removeChild(this.$imageCanvas)
    }

    get hasImageCanvas(){
        return this.$imageCanvas !== null
    }

    get el() {
        return this.$el
    }
}