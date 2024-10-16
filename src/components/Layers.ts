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

    constructor() {
        this.$el = document.createElement('div')
        this.$el.classList.add('layers')

        this.$fileInput = document.createElement('input')
        this.$fileInput.setAttribute('type', 'file')
        this.$fileInput.setAttribute('id', 'image_upload')
        this.$fileInput.setAttribute('name', 'image_upload')
        this.$fileInput.setAttribute('accept', '.jpg, .jpeg, .png, .webp, .svg')
        this.$fileInput.classList.add('input-file')

        this.$el.innerHTML = `
            <div class="layer --add --image">
                    <label for="image_upload">
                        <span class="__icon">${PlusIcon}</span>
                        <span class="text">Choose image</span>
                    </label>
            </div>
        `

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
                <div>
                    <span class="__icon">${PlusIcon}</span>
                    <span class="text">Add canvas</span>
                </div>
        `

        this.$el.appendChild(layer)
    }

    setCanvasDisplay () {
        const layer = document.createElement('div')
        layer.classList.add('layer', '--canvas')
        layer.innerHTML = `
                <img class="__background" src="/skull.svg" alt="canvas background"/>
                <div>
                    <span class="__icon">${TrashFilled}${Eye}</span>
                </div>
        `

        this.$el.appendChild(layer)
    }

    updateCanvasDisplay (canvas: HTMLCanvasElement) {
        const backgroundImage: HTMLImageElement | null = this.$el.querySelector('.__background')

        if (!backgroundImage) return

        backgroundImage.src = canvas.toDataURL("image/png", 1.0)
    }

    get el() {
        return this.$el
    }
}