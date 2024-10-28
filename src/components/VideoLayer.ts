import {getCanvasBlob} from "@utils/utils.ts";
import {CameraIcon, CheckIcon, XIcon} from "@icons/Icon.ts";

export interface VideoLayerParams {
    type?: string
}

type VideoSource = string | MediaStream

const DEFAULT_MIN_WIDTH = 640
const DEFAULT_MIN_HEIGHT = 480
const DEFAULT_IDEAL_WIDTH = 1920
const DEFAULT_IDEAL_HEIGHT = 1080

export default class VideoLayer {
    $video: HTMLVideoElement = document.createElement('video')
    autoplay: boolean = true
    currentSrc: VideoSource | null = null
    type: string = 'video'
    playbackStarted: boolean = false
    $photoBooth: HTMLDivElement = document.createElement('div')
    $photoBoothControls: HTMLDivElement = document.createElement('div')

    constructor(params: VideoLayerParams) {
        this.$photoBooth.classList.add('photo-booth')
        this.$photoBoothControls.classList.add('photo-booth-controls')

        this.$photoBooth.append(this.$video)
        this.$photoBooth.append(this.$photoBoothControls)

        this.setType(params.type ?? this.type)
        this.addEventListeners()
    }

    setType(type: string) {
        this.$video.classList.remove(this.type)
        this.type = type
        this.$video.classList.add(this.type)
    }

    addEventListeners() {
        this.$video.addEventListener('canplay', () => this.oncanplay())
        this.$video.addEventListener('play', () => this.onplay())
    }

    load(src: VideoSource) {
        this.currentSrc = src

        if (typeof src === 'string') {
            this.$video.src = src
            return
        }

        this.$video.srcObject = src
    }

    oncanplay() {
        if (this.autoplay) {
            this.play()
        }
    }

    play() {
        this.$video.play()
            .then(() => console.log('video played'))
            .catch(() => console.log('video could not be played'))
    }

    pause() {
        this.$video.pause()
    }

    stop() {
        this.$video.pause()
        this.$video.currentTime = 0
        this.$video.srcObject = null
        this.$video.src = ''
        this.onstop()
    }

    onplay() {
        this.playbackStarted = true
    }

    onpause() {

    }

    onstop() {
        this.playbackStarted = false
    }

    get isPlaying() {
        return this.playbackStarted
    }

    startImageCapture() {
        const mediaStreamConstraints = {
            video: {
                width: {min: DEFAULT_MIN_WIDTH, ideal: DEFAULT_IDEAL_WIDTH},
                height: {min: DEFAULT_MIN_HEIGHT, ideal: DEFAULT_IDEAL_HEIGHT},
                aspectRatio: {
                    min: DEFAULT_MIN_WIDTH / DEFAULT_MIN_HEIGHT,
                    ideal: DEFAULT_IDEAL_WIDTH / DEFAULT_IDEAL_HEIGHT
                },
            }
        } as MediaStreamConstraints

        navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
            .then((stream) => this.load(stream))
            .catch((err: Error) => {
                console.error('Error accessing user media', err)
            })
    }

    stopImageCapture() {
        if (typeof this.currentSrc !== 'string')  {
            const tracks = this.currentSrc?.getTracks()
            tracks?.forEach((track) => track.stop())
        }

        this.stop()
    }

    async previewPhoto() {
        this.pause()
        this.removeAllControls()
        const [approvePhotoButton, rejectPhotoButton] = this.addConfirmationControls()

        return new Promise<boolean>((resolve) => {
            approvePhotoButton.addEventListener('click', () => resolve(true), {once: true})
            rejectPhotoButton.addEventListener('click', () => resolve(false), {once: true})
        })
    }

    addTakePhotoButton() {
        const takePhotoButton = document.createElement('button')
        takePhotoButton.classList.add('button', 'take-photo')
        takePhotoButton.setAttribute('id', 'take-photo')
        takePhotoButton.innerHTML = `${CameraIcon}`
        takePhotoButton.addEventListener('click', (ev: MouseEvent) => this.triggerCamera(ev), {once: true})

        this.$photoBoothControls.append(takePhotoButton)
    }

    addCancelPhotoButton() {
        const cancelPhotoButton = document.createElement('button')
        cancelPhotoButton.classList.add('button', 'cancel-photo')
        cancelPhotoButton.setAttribute('id', 'cancel-photo')
        cancelPhotoButton.innerHTML = `${XIcon}`
        cancelPhotoButton.addEventListener('click', (ev: MouseEvent) => this.cancelCamera(ev), {once: true})

        this.$photoBoothControls.append(cancelPhotoButton)
    }

    removeTakePhotoButton() {
        const $takePhotoButton = this.$photoBoothControls.querySelector('.take-photo')

        if ($takePhotoButton) $takePhotoButton.remove()
    }

    removeCancelPhotoButton() {
        const $cancelPhotoButton = this.$photoBoothControls.querySelector('.cancel-photo')

        if ($cancelPhotoButton) $cancelPhotoButton.remove()
    }

    addConfirmationControls() {
        const approvePhotoButton = document.createElement('button')
        approvePhotoButton.classList.add('button', 'approve-photo')
        approvePhotoButton.setAttribute('id', 'approve-photo')
        approvePhotoButton.innerHTML = `${CheckIcon}`
        approvePhotoButton.classList.add('button', 'approve-photo')

        const rejectPhotoButton = document.createElement('button')
        rejectPhotoButton.classList.add('button', 'reject-photo')
        rejectPhotoButton.setAttribute('id', 'reject-photo')
        rejectPhotoButton.innerHTML = `${XIcon}`
        rejectPhotoButton.classList.add('button', 'reject-photo')

        this.$photoBoothControls.append(approvePhotoButton, rejectPhotoButton)

        return [approvePhotoButton, rejectPhotoButton]
    }

    removeConfirmControls() {
        const $approvePhotoButton = this.$photoBoothControls.querySelector('.approve-photo')
        const $rejectPhotoButton = this.$photoBoothControls.querySelector('.reject-photo')

        if ($approvePhotoButton) $approvePhotoButton.remove()
        if ($rejectPhotoButton) $rejectPhotoButton.remove()
    }

    removeAllControls() {
        this.removeConfirmControls()
        this.removeTakePhotoButton()
        this.removeCancelPhotoButton()
    }

    retakePhoto() {
        this.play()
        this.removeConfirmControls()
        this.addTakePhotoButton()
        this.addCancelPhotoButton()
    }

    async takePhoto() {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = this.$video.clientWidth
        canvas.height = this.$video.clientHeight

        ctx?.drawImage(this.$video, 0, 0, this.$video.clientWidth, this.$video.clientHeight)

        return getCanvasBlob(canvas)
    }

    openPhotoBooth() {
        this.$photoBooth.classList.add('active')
        this.startImageCapture()
        this.addTakePhotoButton()
        this.addCancelPhotoButton()
    }

    closePhotoBooth() {
        this.$photoBooth.classList.remove('active')
        this.stopImageCapture()
        this.removeAllControls()
    }

    triggerCamera(ev: MouseEvent) {
        ev.stopPropagation()
        document.dispatchEvent(new CustomEvent('trigger-camera'))
    }

    cancelCamera(ev: MouseEvent) {
        ev.stopPropagation()
        document.dispatchEvent(new CustomEvent('cancel-camera'))
    }

    getAspectRatio() {
        return this.$video.videoWidth / this.$video.videoHeight
    }

    get el() {
        return this.$photoBooth
    }
}