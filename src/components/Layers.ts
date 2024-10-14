import "@styles/Layers.css"
import {PlusIcon} from "@icons/Icon.ts";

const fileTypes = [
    "image/jpg",
    "image/jpeg",
    "image/png",
    "image/svg+xml",
    "image/webp",
]

export class Layers {
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
        this.$fileInput.setAttribute('accept', '.jpg .jpeg .png .webp .svg')
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

        this.$fileInput.addEventListener('change', () => {
            const imageLayer = this.$el.querySelector('.--image')

            let [file] = this.$fileInput?.files ?? []

            if (!this.isValidFileType(file?.type)) {
                console.error(`File ${file?.type} is invalid.`)
                return
            }

            const src = URL.createObjectURL(file)
            const img = new Image()
            img.addEventListener('load', () => {
                this.$imageLayer.classList.remove('--add')
                this.$imageLayer.classList.add('--change')
                const $text = this.$imageLayer.querySelector('.text')

                if ($text) {
                    $text.innerHTML = 'Change image'
                }
            })
            img.src = src

            imageLayer?.appendChild(img)
        })
    }

    updateImageDisplay () {
        console.log('updateImageDisplay')
    }

    setEmptyCanvasLayer () {
        const layer = document.createElement('div')
        layer.classList.add('layer', '--add')
        layer.innerHTML = `
                <label for="image_upload">
                    <span class="__icon">${PlusIcon}</span>
                    <span class="text">Add canvas</span>
                </label>
        `

        this.$el.appendChild(layer)
    }

    isValidFileType (fileType: string) {
        return fileTypes.includes(fileType)
    }

    get el() {
        return this.$el
    }
}