import '@styles/Workspace.css'
import {Layers} from "@components/Layers.ts";
import Layer from "@components/Layer.ts";
import {isValidImgFileType} from "@utils/utils.ts";
import ImageLayer from "@components/ImageLayer.ts";

export class Workspace {
    $el: HTMLElement
    $content: HTMLElement
    $canvasContainer: HTMLElement
    layers: Layers
    canvasLayers: Layer[] | ImageLayer[]

    constructor() {
        this.$el = document.createElement('section')
        this.$content = document.createElement('div')
        this.$content.classList.add('__content')
        this.$el.classList.add('workspace')
        this.$el.innerHTML = `
            <h2>Workspace</h2>
        `

        this.$canvasContainer = document.createElement('div')//new Layer({type: 'image'})
        this.$canvasContainer.classList.add('canvas-container')
        this.layers = new Layers()
        this.canvasLayers = []

        this.$content.appendChild(this.layers.el)
        this.$content.appendChild(this.$canvasContainer)

        this.$el.addEventListener("change", (ev: Event) => this.onFileInputChange(ev));

        this.$el.appendChild(this.$content)
    }

    onFileInputChange(ev: Event) {
        const target = ev.target as HTMLInputElement

        if (this.canvasLayers.length === 0) {
            this.setImageDisplay(target)
        } else {
            this.updateImageDisplay(target)
        }
    }

    retrieveSrc($input: HTMLInputElement) {
        let [file] = $input?.files ?? []

        const src = URL.createObjectURL(file)

        if (!isValidImgFileType(file?.type)) {
            console.error(`File ${file?.type} is invalid.`)
            return ''
        }

        return src
    }

    setImageDisplay(target: HTMLInputElement) {
        const src = this.retrieveSrc(target)
        if (!src) return

        const img = new Image()
        this.layers.setImageDisplay({
            image: {
                src,
                $el: img
            }
        })

        const imageLayer = new ImageLayer({
            type: 'image',
            image: {
                src,
                $el: img
            }
        })

        this.$canvasContainer.appendChild(imageLayer.el)
        this.canvasLayers.push(imageLayer)
        this.layers.setEmptyCanvasLayer()
    }

    updateImageDisplay(target: HTMLInputElement) {
        const {imageEl} = this.canvasLayers[0] as ImageLayer
        const src = this.retrieveSrc(target)

        if (!src) return
        imageEl.src = src
    }

    get el() {
        return this.$el
    }
}