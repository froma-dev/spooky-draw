import '@styles/Workspace.css'
import Layers from "@components/Layers.ts";
import Layer from "@components/Layer.ts";
import {isValidImgFileType, getCanvasBlob} from "@utils/utils.ts";
import ImageLayer from "@components/ImageLayer.ts";
import WorkspaceToolBar from "@components/WorkspaceToolBar.ts";
import {cloud} from "@services/Cloud.ts";

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
        document.addEventListener("drawchange", ((ev: CustomEvent) => this.updateCanvasDisplay(ev)) as EventListener);

        const workspaceToolbar = new WorkspaceToolBar()
        const $workspaceToolbar = workspaceToolbar.el
        $workspaceToolbar.addEventListener("click", (ev: Event) => this.submitPrompt(ev))

        this.$el.appendChild(this.$content)
        this.$el.appendChild($workspaceToolbar)
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
        // this.layers.setEmptyCanvasLayer()
    }

    updateImageDisplay(target: HTMLInputElement) {
        const {imageEl} = this.canvasLayers[0] as ImageLayer
        const src = this.retrieveSrc(target)

        if (!src) return
        imageEl.src = src
    }

    updateCanvasDisplay(ev: CustomEvent) {
        console.log('will update canvas display', ev.detail)
        this.layers.updateCanvasDisplay(ev.detail)
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
        if (!$canvas) return

        getCanvasBlob($canvas).then(blob => {
            const blobUrl = URL.createObjectURL(blob)
            const downloadLink = document.createElement('a')

            downloadLink.href = blobUrl
            downloadLink.download = 'masterpiece.webp'
            downloadLink.click()

            URL.revokeObjectURL(blobUrl)
        })
    }

    submitPrompt(ev: Event) {
        const $target = ev.target as HTMLElement

        if ($target?.id === 'submit-prompt') this.uploadFile()
    }

    uploadFile() {
        this.mergeCanvasLayers()

        if (this.mergedCanvas) {
            getCanvasBlob(this.mergedCanvas.el)
                .then(blob => {
                    const formData = new FormData()
                    formData.append('image', blob, 'randomfile.jpg')

                    return formData
                })
                .then((formData: FormData) => {
                    return cloud.uploadFile(formData)
                })
                .then(uploadResult => {
                    console.log('received upload result', uploadResult)
                })
        }
    }

    get el() {
        return this.$el
    }
}