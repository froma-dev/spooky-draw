import "@styles/Layers.css"
import {Eye, PlusIcon, TrashFilled, CameraIcon, loadImage} from "@icons/Icon.ts";

export interface ImageDisplayParams {
    image: {
        src: string,
        $el: HTMLImageElement
    }
}

export default class Layers {
    $el: HTMLElement
    $imageLayer: HTMLElement
    $transformations: HTMLElement
    $original: HTMLElement
    $cameraButton: HTMLElement
    dragging: boolean = false

    constructor() {
        this.$el = document.createElement('div')
        this.$el.classList.add('layers')

        this.$transformations = document.createElement('section')
        this.$original = document.createElement('section')
        this.$transformations.classList.add('transformations')
        this.$original.classList.add('original')

        this.$original.innerHTML = `
            <div class="layer --add --image">
                    <span class="__icons">
                        <button class="icon" id="img-upload">
                            <label for="image_upload">
                            ${loadImage}
                            <input 
                            type="file" 
                            id="image_upload" 
                            name="image_upload" 
                            accept=".jpg, .jpeg, .png, .webp, .svg" 
                            class="input-file"
                            />
                            </label>
                        </button>
                        <button class="icon" id="camera">
                            ${CameraIcon}
                        </button>
                    </span>
            </div>
        `
        this.$el.appendChild(this.$original)
        this.$el.appendChild(this.$transformations)

        this.$imageLayer = this.$el.querySelector('.layer')!
        this.$cameraButton = this.$el.querySelector('#camera')!


        document.body.addEventListener('dragover', (ev: DragEvent) => {
            ev.preventDefault()
            this.dragging = true
            this.$imageLayer.classList.add('dragging')
        })
        document.body.addEventListener('dragend', (ev: DragEvent) => {
            ev.preventDefault()
            this.$imageLayer.classList.remove('dragging')
            this.dragging = false
        })
        this.$imageLayer.addEventListener('drop', (ev: DragEvent) => {
            ev.preventDefault()
            this.$imageLayer.classList.remove('dragging')
            this.dragging = false

            const files = ev.dataTransfer?.files

            if (files && files.length) {
                document.dispatchEvent(new CustomEvent('file-drop', {detail: files[0]}))
            }
        })

        this.$cameraButton.addEventListener('click', (ev: MouseEvent) => {
            ev.stopPropagation()
            document.dispatchEvent(new CustomEvent('trigger-camera'))
        })
    }

    setImageLayer(src: string) {
        const $image = document.createElement('img')
        $image.classList.add('thumbnail-image')

        $image.addEventListener('load', () => this.onImageDisplayLoad())
        $image.src = src

        this.$imageLayer?.appendChild($image)
    }

    onImageDisplayLoad() {
        this.$imageLayer.classList.remove('--add')
        this.$imageLayer.classList.add('--change')
        const $text = this.$imageLayer.querySelector('.text')

        if ($text) {
            $text.innerHTML = 'Change image'
        }
    }

    setEmptyCanvasLayer() {
        const layer = document.createElement('div')
        layer.classList.add('layer', '--add')
        layer.innerHTML = `
                <div class="layer --add">
                    <div>
                        <span class="__icons">
                        <span class="icon">${PlusIcon}</span>
                        <span class="text">Add canvas</span>
                    </div>
                </div>
        `

        this.$transformations.appendChild(layer)
    }

    setCanvasDisplay({selected = false}: { selected: boolean }) {
        const layer = document.createElement('div')
        layer.classList.add('layer', '--canvas', selected ? 'selected' : '')
        layer.innerHTML = `
                <img class="__background" src="/skull.svg" alt="canvas background" crossorigin/>
                <div>
                    <span class="__icons">
                        <span class="icon">${TrashFilled}</span>
                        <span class="icon">${Eye}</span>
                    </span>
                </div>
        `

        this.$transformations.appendChild(layer)
    }

    updateThumbnail(src: string) {
        const changeImage: HTMLElement | null = this.$el.querySelector('.--change')
        if (!changeImage) return

        const $image: HTMLImageElement | null = changeImage.querySelector('.thumbnail-image')
        if (!$image) return
        $image.crossOrigin = 'anonymous'
        $image.src = src
    }

    get el() {
        return this.$el
    }
}