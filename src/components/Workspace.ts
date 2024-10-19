import '@styles/Workspace.css'
import Layers from "@components/Layers.ts";
import Layer from "@components/Layer.ts";
import {isValidImgFileType, getCanvasBlob} from "@utils/utils.ts";
import ImageLayer from "@components/ImageLayer.ts";
import WorkspaceToolBar from "@components/WorkspaceToolBar.ts";
import {cloud, SuccessfulData as ImageData} from "@services/Cloud.ts";
import {storage} from "@services/LocalStorage.ts";

export class Workspace {
    $el: HTMLElement
    $canvasContainer: HTMLElement
    layers: Layers
    canvasLayers: Layer[]
    mergedCanvas: Layer | null = null
    workspaceToolbar: WorkspaceToolBar

    constructor() {
        this.$el = document.createElement('section')
        this.$el.classList.add('workspace', 'stacked')
        this.$el.innerHTML = `
            <h2>Workspace</h2>
        `

        this.$canvasContainer = document.createElement('div')
        this.$canvasContainer.classList.add('canvas-container')
        this.layers = new Layers()
        this.canvasLayers = []

        this.$el.addEventListener("change", (ev: Event) => this.onFileInputChange(ev));
        document.addEventListener("drawchange", ((ev: CustomEvent) => this.updateCanvasDisplay(ev)) as EventListener);

        const workspaceToolbar = this.workspaceToolbar = new WorkspaceToolBar()
        const $workspaceToolbar = workspaceToolbar.el
        $workspaceToolbar.addEventListener("click", (ev: Event) => this.submitPrompt(ev))

        this.$el.appendChild(this.layers.el)
        this.$el.appendChild(this.$canvasContainer)
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
        this.setCanvasLayer({selected: true})
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

    setCanvasLayer({selected}: { selected: boolean }) {
        const canvasLayer = new Layer({type: 'canvas'})

        // Empty canvas
        canvasLayer.setCanvasSize(this.$canvasContainer.clientWidth, this.$canvasContainer.clientHeight)
        this.layers.setCanvasDisplay({selected})
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

    async saveCanvas() {
        const $canvas = this.mergedCanvas?.el
        if (!$canvas) return

        const blob = await getCanvasBlob($canvas)
        const blobUrl = URL.createObjectURL(blob)
        const downloadLink = document.createElement('a')

        downloadLink.href = blobUrl
        downloadLink.download = 'masterpiece.webp'
        downloadLink.click()

        URL.revokeObjectURL(blobUrl)
    }

    async submitPrompt(ev: Event) {
        const $target = ev.target as HTMLElement

        if ($target?.id === 'submit-prompt') {
            const inputValue = this.workspaceToolbar.retrieveInputValue()
            this.workspaceToolbar.clearInputValue()

            const uploadResult = await this.uploadFile()

            if (uploadResult?.success) {
                const data = uploadResult.data as ImageData
                this.workspaceToolbar.updatePrevOutputStatus({status: 'Image uploaded successfully!', icon: 'success'})
                this.saveUploadedReference(data)
                this.transformImage(data, inputValue)
            } else {
                this.workspaceToolbar.updatePrevOutputStatus({status: 'Image upload failed', icon: 'error'})
            }
        }
    }

    async uploadFile() {
        this.mergeCanvasLayers()
        if (!this.mergedCanvas) return

        this.workspaceToolbar.appendOutputStatus({status: 'Uploading your masterpiece...', icon: 'loading'})
        const blob = await getCanvasBlob(this.mergedCanvas.el)

        return await cloud.uploadFile(blob)
    }

    async transformImage(imageData: ImageData, prompt: string) {
        const src = cloud.transformImage({imageData, prompt})
        const {secureUrl} = imageData
        this.workspaceToolbar.appendOutputStatus({status: `Transforming image into: <span class="prompt">${prompt}</span>`, icon: 'loading'})
        this.workspaceToolbar.appendOutputImage({src, fallback: secureUrl})
            .then(() => {
                this.workspaceToolbar.updatePrevOutputStatus({
                    status: `Image transformed into <span class="prompt">${prompt}</span>`,
                    icon: 'success'
                })
            })
            .catch(() => {
                this.workspaceToolbar.updatePrevOutputStatus({
                    status: `Failed to transform image into <span class="prompt">${prompt}</span>`,
                    icon: 'error'
                })
            })
    }

    saveUploadedReference(uploadResultData: ImageData) {
        const {assetId} = uploadResultData

        storage.setItem<ImageData>(assetId, uploadResultData)
    }

    get el() {
        return this.$el
    }
}