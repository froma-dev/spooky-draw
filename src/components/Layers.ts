import "@styles/Layers.css"
import {Eye, PlusIcon, TrashFilled} from "@icons/Icon.ts";

export interface ImageDisplayParams {
    image: {
        src: string,
        $el: HTMLImageElement
    }
}

export default class Layers {
    $el: HTMLElement
    $imageLayer: HTMLElement
    $fileInput: HTMLInputElement
    $transformations: HTMLElement
    $original: HTMLElement

    constructor() {
        this.$el = document.createElement('div')
        this.$el.classList.add('layers')

        this.$fileInput = document.createElement('input')
        this.$fileInput.setAttribute('type', 'file')
        this.$fileInput.setAttribute('id', 'image_upload')
        this.$fileInput.setAttribute('name', 'image_upload')
        this.$fileInput.setAttribute('accept', '.jpg, .jpeg, .png, .webp, .svg')
        this.$fileInput.classList.add('input-file')
        this.$transformations = document.createElement('section')
        this.$original = document.createElement('section')
        this.$transformations.classList.add('transformations')
        this.$original.classList.add('original')

        this.$original.innerHTML = `
            <h3>Original</h3>
                <div class="layer --add --image">
                    <label for="image_upload">
                        <span class="__icon">${PlusIcon}</span>
                        <span class="text">Choose image</span>
                    </label>
            </div>
        `
        this.$transformations.innerHTML = `<h3>Transformations</h3>`
        this.$el.appendChild(this.$original)
        this.$el.appendChild(this.$transformations)

        this.$imageLayer = this.$el.querySelector('.layer')!
        this.$imageLayer?.appendChild(this.$fileInput)
    }

    setImageDisplay ({image}: ImageDisplayParams) {
        const imageLayer = this.$el.querySelector('.--image')
        const {src, $el: $image} = image

        $image.addEventListener('load', () => this.onImageDisplayLoad())
        $image.src = src

        imageLayer?.appendChild($image)
    }

    onImageDisplayLoad () {
        this.$imageLayer.classList.remove('--add')
        this.$imageLayer.classList.add('--change')
        const $text = this.$imageLayer.querySelector('.text')

        if ($text) {
            $text.innerHTML = 'Change image'
        }
    }

    setEmptyCanvasLayer () {
        const layer = document.createElement('div')
        layer.classList.add('layer', '--add')
        layer.innerHTML = `
                <div class="layer --add">
                    <div>
                        <span class="__icon">${PlusIcon}</span>
                        <span class="text">Add canvas</span>
                    </div>
                </div>
        `

        this.$transformations.appendChild(layer)
    }

    setCanvasDisplay ({selected = false}: { selected: boolean }) {
        const layer = document.createElement('div')
        layer.classList.add('layer', '--canvas', selected ? 'selected' : '')
        layer.innerHTML = `
                <img class="__background" src="/skull.svg" alt="canvas background" crossorigin/>
                <div>
                    <span class="__icon">${TrashFilled}${Eye}</span>
                </div>
        `

        this.$transformations.appendChild(layer)
    }

    updateCanvasDisplay (canvas: HTMLCanvasElement) {
        const backgroundImage: HTMLImageElement | null = this.$el.querySelector('.__background')

        if (!backgroundImage) return

        backgroundImage.crossOrigin = 'anonymous'
        backgroundImage.src = canvas.toDataURL("image/png", 1.0)
    }

    get el() {
        return this.$el
    }
}