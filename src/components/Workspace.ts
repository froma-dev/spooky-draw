import '@styles/Workspace.css'
import Layers from "@components/Layers.ts";
import Layer from "@components/Layer.ts";
import {retrieveSrcFromFile, getCanvasBlob} from "@utils/utils.ts";
import WorkspaceToolBar from "@components/WorkspaceToolBar.ts";
import {cloud, SuccessfulData} from "@services/Cloud.ts";
import {storage} from "@services/LocalStorage.ts";
import VideoLayer from "@components/VideoLayer.ts";
import Canvas from "@components/Canvas.ts";
import {type TFileDropEvent} from "@utils/TCustomEvents.ts";

type ImageData = SuccessfulData & { transformations?: string[] }

export class Workspace {
    $el: HTMLElement
    layers: Layers
    mergedCanvas: Layer | null = null
    workspaceToolbar: WorkspaceToolBar
    videoCanvas: VideoLayer | null = null
    canvasContainer: Canvas = new Canvas()

    constructor() {
        this.$el = document.createElement('section')
        this.$el.classList.add('workspace')

        this.canvasContainer = new Canvas()
        this.layers = new Layers()
        this.workspaceToolbar = new WorkspaceToolBar()

        this.addEventListeners()

        this.$el.appendChild(this.layers.el)
        this.$el.appendChild(this.canvasContainer.el)
        this.$el.appendChild(this.workspaceToolbar.el)
    }

    addEventListeners() {
        this.$el.addEventListener("change", (ev: Event) => this.onInputChange(ev));
        document.addEventListener("file-drop", ((ev: TFileDropEvent) => this.onFileDrop(ev.detail)) as EventListener)
        document.addEventListener('trigger-camera', () => this.triggerCamera())
        this.workspaceToolbar.el.addEventListener("click", (ev: Event) => this.onWorkspaceToolbarClick(ev)) // TODO: refactor
    }

    onInputChange(ev: Event) {
        const target = ev.target as HTMLInputElement
        let [file] = target?.files ?? []

        if (file) this.setImages(retrieveSrcFromFile(file))
    }

    onFileDrop(file: File) {
        if (file) this.setImages(retrieveSrcFromFile(file))
    }

    triggerCamera() {
        const isVideoPlaying = this.videoCanvas?.isPlaying

        if (isVideoPlaying) {
            this.previewPhoto()
        } else {
            this.openPhotoBooth()
        }
    }

    onWorkspaceToolbarClick(ev: Event) {
        const $target = ev.target as HTMLElement

        if ($target?.id === 'submit-prompt') {
            const inputValue = this.workspaceToolbar.retrieveInputValue()
            this.submitPrompt(inputValue)
        } else if ($target?.id === 'submit-replace-item') {
            const inputValues = this.workspaceToolbar.retrieveInputValues()
            this.submitPrompt(inputValues)
        } else if ($target?.id === 'change-to-transformed-image') {
            const publicId = $target.dataset.publicid

            if (publicId) {
                const $lastCanvas = this.canvasLayers[this.canvasLayers.length - 1]
                this.replaceImageDisplay(publicId)
                $lastCanvas.clearCanvas()
                this.updateThumbnail($lastCanvas.el)
                this.workspaceToolbar.clearWorkspace()
            }
        }
    }

    setImages(src: string) {
        if (!src) return
        if (this.canvasContainer.hasImageCanvas) {
            this.updateThumbnail(src)
            this.updateImageCanvas(src)
        } else {
            this.setImageLayer(src)
            this.setImageCanvas(src)
        }
    }

    replaceImageDisplay(publicId: string) {
        const imageData = storage.getItem<ImageData>(publicId)

        if (!imageData) return
        const transformationLength = imageData.transformations?.length ?? 0
        const lastTransformationSrc = imageData.transformations
            ? imageData.transformations[transformationLength - 1]
            : ''

        console.log('lastTransformationSrc ', lastTransformationSrc)
        if (lastTransformationSrc) {
            this.updateImageCanvas(lastTransformationSrc)
        }
    }

    setImageLayer(src: string) {
        this.layers.setImageLayer(src)
    }

    setImageCanvas(src: string) {
        this.canvasContainer.setImageCanvas(src)
    }

    removeVideoLayer() {
        if (this.videoCanvas) {
            this.canvasContainer.removeChild(this.videoCanvas.el)
        }
    }

    previewPhoto() {
        this.videoCanvas?.previewPhoto()
            .then((approved) => {
                if (approved) {
                    this.takePhoto()
                } else {
                    this.retryPhoto()
                }
            })
    }

    takePhoto() {
        return this.videoCanvas?.takePhoto()
            .then(blob => this.onPhotoTaken(blob))
            .catch((err) => console.log('Picture failed :(', err))
    }

    onPhotoTaken(blob: Blob) {
        this.setImages(URL.createObjectURL(blob))
        this.canvasContainer.showImageCanvas()
        if (this.videoCanvas) {
            this.videoCanvas.closePhotoBooth()
            this.canvasContainer.removeChild(this.videoCanvas.el)
        }
    }

    openPhotoBooth() {
        if (!this.videoCanvas) {
            this.videoCanvas = new VideoLayer({type: 'capture'})
        }

        this.canvasContainer.hideImageCanvas()
        this.videoCanvas.openPhotoBooth()
        this.canvasContainer.appendChild(this.videoCanvas.el)
    }

    retryPhoto() {
        this.videoCanvas?.retakePhoto()
    }

    updateImageCanvas(src: string) {
        this.canvasContainer.updateImageCanvas(src)
    }

    updateThumbnail(src: string) {
        this.layers.updateThumbnail(src)
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

    async submitPrompt(inputValue: string | string[]) {
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

    async uploadFile() {
        this.workspaceToolbar.appendOutputStatus({status: 'Uploading your masterpiece...', icon: 'loading'})
        const blob = await getCanvasBlob(this.mergedCanvas.el)

        return await cloud.uploadFile(blob)
    }

    async transformImage(imageData: ImageData, prompt: string | string[]) {
        const src = cloud.transformImage({imageData, prompt})
        this.workspaceToolbar.appendOutputStatus({
            status: `Transforming image into: <span class="prompt">${prompt}</span>`,
            icon: 'loading'
        })
        this.workspaceToolbar.appendOutputImage({src, imageData})
            .then(() => {
                this.workspaceToolbar.updatePrevOutputStatus({
                    status: `Image transformed into <span class="prompt">${prompt}</span>`,
                    icon: 'success'
                })
                this.saveTransformedReference(src, imageData)
            })
            .catch(() => {
                this.workspaceToolbar.updatePrevOutputStatus({
                    status: `Failed to transform image into <span class="prompt">${prompt}</span>`,
                    icon: 'error'
                })
            })
    }

    saveUploadedReference(uploadResultData: ImageData) {
        const {publicId} = uploadResultData

        storage.setItem<ImageData>(publicId, uploadResultData)
    }

    saveTransformedReference(src: string, imageData: ImageData) {
        const {publicId} = imageData
        let {transformations} = imageData
        let imageDataTransformations = imageData

        if (transformations) {
            transformations.push(src)
        } else {
            transformations = [src]
            imageDataTransformations = {...imageData, transformations}
        }

        storage.setItem<ImageData>(publicId, imageDataTransformations)
    }

    get el() {
        return this.$el
    }
}