import '@styles/Workspace.css'
import Layers from "@components/Layers.ts";
import Layer from "@components/Layer.ts";
import {isValidImgFileType} from "@utils/utils.ts";
import ImageLayer from "@components/ImageLayer.ts";

export class Workspace {
    $el: HTMLElement
    $content: HTMLElement
    $canvasContainer: HTMLElement
    layers: Layers
    canvasLayers: Layer[]
    mergedCanvas: Layer | null = null

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

        this.setImageLayer(src)
        this.setCanvasLayer()
    }

    setImageLayer(src: string) {
        const img = new Image()
        const image = {
            src,
            $el: img
        }
        const imageLayer = new ImageLayer({
            type: 'image',
            image
        })

        this.layers.setImageDisplay({image})
        this.$canvasContainer.appendChild(imageLayer.el)
        this.canvasLayers.push(imageLayer)
    }

    setCanvasLayer() {
        const canvasLayer = new Layer({type: 'canvas'})

        // Empty canvas
        canvasLayer.setCanvasSize(this.$canvasContainer.clientWidth, this.$canvasContainer.clientHeight)
        this.layers.setCanvasDisplay()
        this.$canvasContainer.appendChild(canvasLayer.el)
        this.canvasLayers.push(canvasLayer)

        // New canvas
        this.layers.setEmptyCanvasLayer()
    }

    updateImageDisplay(target: HTMLInputElement) {
        const {imageEl} = this.canvasLayers[0] as ImageLayer
        const src = this.retrieveSrc(target)

        if (!src) return
        imageEl.src = src
    }

    mergeCanvasLayers() {
        let mergedCanvasLayers = this.mergedCanvas = new Layer({type: 'canvas'})
        const ctxMergedCanvasLayers = mergedCanvasLayers.el.getContext('2d')
        mergedCanvasLayers.setCanvasSize(this.$canvasContainer.clientWidth, this.$canvasContainer.clientHeight)

        this.canvasLayers.forEach(canvasLayer => {
            ctxMergedCanvasLayers?.drawImage(canvasLayer.el, 0, 0)
        })
    }

    saveCanvas() {
        const $canvas = this.mergedCanvas?.el

        $canvas?.toBlob((blob) => {
            if (!blob) return

            const blobUrl = URL.createObjectURL(blob)
            const downloadLink = document.createElement('a')

            downloadLink.href = blobUrl
            downloadLink.download = 'masterpiece.webp'
            downloadLink.click()

            URL.revokeObjectURL(blobUrl)
        }, 'image/webp')
    }

    get el() {
        return this.$el
    }
}