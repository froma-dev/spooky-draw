import '@styles/Workspace.css'
import Layers from "@components/Layers.ts";
import Layer from "@components/Layer.ts";
import {retrieveSrcFromFile, getCanvasBlob} from "@utils/utils.ts";
import ImageLayer from "@components/ImageLayer.ts";
import WorkspaceToolBar from "@components/WorkspaceToolBar.ts";
import {cloud, SuccessfulData} from "@services/Cloud.ts";
import {storage} from "@services/LocalStorage.ts";
import VideoLayer from "@components/VideoLayer.ts";
import {CameraIcon} from "@icons/Icon.ts";

type ImageData = SuccessfulData & {transformations?: string[]}

export class Workspace {
    $el: HTMLElement
    $canvasContainer: HTMLElement
    $photoBooth: HTMLElement | undefined
    layers: Layers
    canvasLayers: Layer[]
    mergedCanvas: Layer | null = null
    workspaceToolbar: WorkspaceToolBar
    videoLayer: VideoLayer | null = null

    constructor() {
        this.$el = document.createElement('section')
        this.$el.classList.add('workspace')

        this.$canvasContainer = document.createElement('div')
        this.$canvasContainer.classList.add('canvas-container')
        this.layers = new Layers()
        this.canvasLayers = []

        this.$el.addEventListener("change", (ev: Event) => {
            const target = ev.target as HTMLInputElement
            let [file] = target?.files ?? []

            if (!file) return
            const src = retrieveSrcFromFile(file)

            this.setImages(src)
        });
        document.addEventListener("file-drop", ((ev: CustomEvent<File>) => {
            let file = ev.detail

            if (!file) return
            const src = retrieveSrcFromFile(file)

            this.setImages(src)
        }) as EventListener)
        document.addEventListener("drawchange", ((ev: CustomEvent<HTMLCanvasElement>) => {
            this.updateCanvasDisplay(ev.detail)
        }) as EventListener);

        const workspaceToolbar = this.workspaceToolbar = new WorkspaceToolBar()
        const $workspaceToolbar = workspaceToolbar.el
        $workspaceToolbar.addEventListener("click", (ev: Event) => this.onWorkspaceToolbarClick(ev))
        document.addEventListener('trigger-camera', () => this.triggerCamera())
        this.$canvasContainer.addEventListener('click', (ev: Event) => {
            const target = ev.target as HTMLElement

            if (target.id === 'take-photo') this.triggerCamera()
        })

        this.$el.appendChild(this.layers.el)
        this.$el.appendChild(this.$canvasContainer)
        this.$el.appendChild($workspaceToolbar)
    }

    triggerCamera () {
        const isVideoPlaying = this.videoLayer?.isPlaying

        if (isVideoPlaying) this.takePhoto()
        else this.setVideoLayer()
    }

    onWorkspaceToolbarClick(ev: Event) {
        const $target = ev.target as HTMLElement

        if ($target?.id === 'submit-prompt') {
            const inputValue = this.workspaceToolbar.retrieveInputValue()
            this.submitPrompt(inputValue)
        }
        else if ($target?.id === 'submit-replace-item') {
            const inputValues = this.workspaceToolbar.retrieveInputValues()
            this.submitPrompt(inputValues)
        }
        else if ($target?.id === 'change-to-transformed-image') {
            const publicId = $target.dataset.publicid

            if (publicId) {
                const $lastCanvas = this.canvasLayers[this.canvasLayers.length - 1]
                this.replaceImageDisplay(publicId)
                $lastCanvas.clearCanvas()
                this.updateCanvasDisplay($lastCanvas.el)
                this.workspaceToolbar.clearWorkspace()
            }
        }
    }

    setImages(src: string) {
        if (this.canvasLayers.length === 0) {
            if (src) this.setImageLayer(src)
            this.setCanvasLayer({selected: true})
        } else {
            this.updateImageDisplay(src)
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
        debugger
        if (lastTransformationSrc) {
            this.updateImageDisplay(lastTransformationSrc)

        }
    }

    setImageLayer(src: string) {
        const img = new Image()
        const image = {
            src,
            $el: new Image()
        }
        const imageLayer = new ImageLayer({
            type: 'image',
            image
        })

        img.src = src
        this.layers.setImageDisplay({image})
        this.$canvasContainer.appendChild(img)
        this.canvasLayers.push(imageLayer)
    }

    setVideoLayer() {
        if (!this.videoLayer) {
            this.videoLayer = new VideoLayer({type: 'capture'})
        }

        const $photoBooth = this.$photoBooth = document.createElement('div')
        const $takePictureButton = document.createElement('button')
        $takePictureButton.innerHTML = `
            ${CameraIcon}
        `
        $takePictureButton.classList.add('button', 'take-photo')
        $takePictureButton.setAttribute('id', 'take-photo')
        $photoBooth.classList.add('photo-booth')
        $photoBooth.append(this.videoLayer.videoEl)
        $photoBooth.append($takePictureButton)
        this.$canvasContainer.appendChild($photoBooth)
        this.videoLayer.startImageCapture()
    }

    takePhoto () {
        if (this.videoLayer) {
            this.videoLayer.takePhoto()
                .then((blob: Blob) => {
                    this.setImages(URL.createObjectURL(blob))
                    if (this.videoLayer && this.$photoBooth) {
                        this.videoLayer.stopImageCapture()
                        this.$canvasContainer.removeChild(this.$photoBooth)
                    }
                })
                .catch((err) => {console.log('Picture failed :(', err)})
        }
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

    updateImageDisplay(src: string) {
        if (src) {
            const {imageEl} = this.canvasLayers[0] as ImageLayer
            imageEl.src = src
        }
    }

    updateCanvasDisplay($canvas: HTMLCanvasElement) {
        this.layers.updateCanvasDisplay($canvas)
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
        this.mergeCanvasLayers()
        if (!this.mergedCanvas) return

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