import {getImageBlob} from "@utils/utils.ts";

export default class Canvas {
    $el: HTMLElement
    $imageCanvas: HTMLImageElement | null = null

    constructor() {
        this.$el = document.createElement('div')
        this.$el.classList.add('canvas-container')
    }

    appendChild<T extends HTMLElement>(child: T) {
        this.$el.appendChild(child)
    }

    removeChild<T extends HTMLElement>(child: T) {
        this.$el.removeChild<T>(child)
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

    async getImageBlob() {
        return getImageBlob(this.$imageCanvas!)
    }

    removeImageCanvas() {
        if (this.$imageCanvas !== null) this.removeChild(this.$imageCanvas)
    }

    hideImageCanvas() {
        if (this.$imageCanvas !== null) this.$imageCanvas.classList.add('hidden')
    }

    showImageCanvas() {
        if (this.$imageCanvas !== null) this.$imageCanvas.classList.remove('hidden')
    }

    get hasImageCanvas(){
        return this.$imageCanvas !== null
    }

    get el() {
        return this.$el
    }
}