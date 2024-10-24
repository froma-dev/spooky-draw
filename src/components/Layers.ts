import "@styles/Layers.css"
import {Eye, PlusIcon, TrashFilled, CameraIcon} from "@icons/Icon.ts";

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

    constructor() {
        this.$el = document.createElement('div')
        this.$el.classList.add('layers')

        this.$transformations = document.createElement('section')
        this.$original = document.createElement('section')
        this.$transformations.classList.add('transformations')
        this.$original.classList.add('original')

        this.$original.innerHTML = `
            <h3>Original</h3>
            <div class="layer --add --image">
                    <span class="__icons">
                        <button class="icon" id="img-upload">
                            <label for="image_upload">
                            ${PlusIcon}
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
        this.$transformations.innerHTML = `<h3>Transformations</h3>`
        this.$el.appendChild(this.$original)
        this.$el.appendChild(this.$transformations)

        this.$imageLayer = this.$el.querySelector('.layer')!
        this.$cameraButton = this.$el.querySelector('#camera')!


        document.body.addEventListener('dragover', (ev: DragEvent) => {
            ev.preventDefault()
        })
        this.$imageLayer.addEventListener('drop', (ev: DragEvent) => {
            ev.preventDefault()
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

    setImageDisplay({image}: ImageDisplayParams) {
        const imageLayer = this.$el.querySelector('.--image')
        const {src, $el: $image} = image

        $image.addEventListener('load', () => this.onImageDisplayLoad())
        $image.src = src

        console.log('setImageDisplay = ', imageLayer, $image)

        imageLayer?.appendChild($image)
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

    updateCanvasDisplay(canvas: HTMLCanvasElement) {
        const backgroundImage: HTMLImageElement | null = this.$el.querySelector('.__background')

        if (!backgroundImage) return

        backgroundImage.crossOrigin = 'anonymous'
        backgroundImage.src = canvas.toDataURL("image/png", 1.0)
    }

    get el() {
        return this.$el
    }
}