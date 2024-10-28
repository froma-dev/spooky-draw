import '@styles/Workspace.css'
import Layers from "@components/Layers.ts";
import {retrieveSrcFromFile} from "@utils/utils.ts";
import WorkspaceToolBar from "@components/WorkspaceToolBar.ts";
import {cloud, SuccessfulData} from "@services/Cloud.ts";
import {storage} from "@services/LocalStorage.ts";
import VideoLayer from "@components/VideoLayer.ts";
import Canvas from "@components/Canvas.ts";
import {type TFileDropEvent} from "@utils/TCustomEvents.ts";

type ImageData = SuccessfulData & { transformations?: string[] }

export class Workspace {
    $el: HTMLElement
    layers: Layers = new Layers()
    workspaceToolbar: WorkspaceToolBar = new WorkspaceToolBar()
    videoCanvas: VideoLayer | null = null
    canvasContainer: Canvas = new Canvas()

    constructor() {
        this.$el = document.createElement('section')
        this.$el.classList.add('workspace')

        this.addEventListeners()

        this.$el.appendChild(this.layers.el)
        this.$el.appendChild(this.canvasContainer.el)
        this.$el.appendChild(this.workspaceToolbar.el)
    }

    addEventListeners() {
        this.$el.addEventListener("change", (ev: Event) => this.onInputChange(ev));
        document.addEventListener("file-drop", ((ev: TFileDropEvent) => this.onFileDrop(ev.detail)) as EventListener)
        document.addEventListener('trigger-camera', () => this.triggerCamera())
        document.addEventListener('cancel-camera', () => this.cancelCamera())
        this.workspaceToolbar.el.addEventListener("click", (ev: Event) => this.onWorkspaceToolbarClick(ev)) // TODO: refactor
    }

    onInputChange(ev: Event) {
        const target = ev.target as HTMLInputElement
        let [file] = target?.files ?? []

        if (file) {
            this.workspaceToolbar.enablePromptInput()
            this.setImages(retrieveSrcFromFile(file))
        }
    }

    onFileDrop(file: File) {
        if (file) {
            this.workspaceToolbar.enablePromptInput()
            this.setImages(retrieveSrcFromFile(file))
        }
    }

    triggerCamera() {
        const isVideoPlaying = this.videoCanvas?.isPlaying

        if (isVideoPlaying) {
            this.previewPhoto()
        } else {
            this.openPhotoBooth()
        }
    }

    cancelCamera() {
        this.closePhotoBooth()
    }

    onWorkspaceToolbarClick(ev: Event) {
        const $target = ev.target as HTMLElement

        if ($target?.id === 'submit-prompt') {
            const inputValue = this.workspaceToolbar.retrieveInputValue({clear: true})
            if (inputValue)
                this.submitPrompt(inputValue)
            else
                this.workspaceToolbar.shakeInput()
        } else if ($target?.id === 'submit-replace-item') {
            const inputValues = this.workspaceToolbar.retrieveInputValues({clear: true})

            if (inputValues.length === 2)
                this.submitPrompt(inputValues)
            else
                this.workspaceToolbar.shakeInputs()
        } else if ($target?.id === 'download-transformation') {
            const src = $target.dataset.src
            if (src) this.saveTransformedImage(src)
        }
    }

    setImages(src: string) {
        if (!src) return

        if (this.videoCanvas && this.videoCanvas.isPlaying) {
            this.closePhotoBooth()
        }

        if (this.canvasContainer.hasImageCanvas) {
            this.updateThumbnail(src)
            this.updateImageCanvas(src)
        } else {
            this.setImageLayer(src)
            this.setImageCanvas(src)
        }
    }

    setImageLayer(src: string) {
        this.layers.setImageLayer(src)
    }

    setImageCanvas(src: string) {
        this.canvasContainer.setImageCanvas(src)
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
        this.workspaceToolbar.enablePromptInput()
        this.setImages(URL.createObjectURL(blob))
        this.canvasContainer.showImageCanvas()
        this.closePhotoBooth()
    }

    openPhotoBooth() {
        if (!this.videoCanvas) {
            this.videoCanvas = new VideoLayer({type: 'capture'})
        }

        this.canvasContainer.hideImageCanvas()
        this.videoCanvas.openPhotoBooth()
        this.canvasContainer.appendChild(this.videoCanvas.el)
    }

    closePhotoBooth() {
        if (this.videoCanvas) {
            this.canvasContainer.showImageCanvas()
            this.videoCanvas.closePhotoBooth()
            this.canvasContainer.removeChild(this.videoCanvas.el)
        }
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

    async saveTransformedImage(src: string) {
        const downloadLink = document.createElement('a')

        downloadLink.setAttribute('download', 'masterpiece.webp')
        downloadLink.setAttribute('href', src)
        downloadLink.setAttribute('target', '_blank')
        downloadLink.click()
        downloadLink.remove()
    }

    async submitPrompt(inputValue: string | string[]) {
        const uploadResult = await this.uploadFile()

        this.workspaceToolbar.disablePromptInput()
        if (uploadResult?.success) {
            const data = uploadResult.data as ImageData
            this.workspaceToolbar.updatePrevOutputStatus({status: 'Image uploaded successfully!', icon: 'success'})
            this.saveUploadedReference(data)
            this.transformImage(data, inputValue)
        } else {
            this.workspaceToolbar.updatePrevOutputStatus({status: 'Image upload failed', icon: 'error'})
            this.workspaceToolbar.enablePromptInput()
        }
    }

    async uploadFile() {
        this.workspaceToolbar.appendOutputStatus({status: 'Uploading your masterpiece...', icon: 'loading'})
        const blob = await this.canvasContainer.getImageBlob()

        return await cloud.uploadFile(blob)
    }

    async transformImage(imageData: ImageData, prompt: string | string[]) {
        const src = cloud.transformImage({imageData, prompt})
        this.workspaceToolbar.appendOutputStatus({
            status: `Transforming image into: <span class="prompt">${prompt}</span>`,
            icon: 'loading'
        })
        this.workspaceToolbar.appendOutputImage({src})
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
                    icon: 'error',
                    button: {
                        icon: 'retry',
                        text: 'Retry',
                        onClick: () => {
                            this.transformImage(imageData, prompt)
                        }
                    }
                })
            })
            .finally(() => this.workspaceToolbar.enablePromptInput())
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