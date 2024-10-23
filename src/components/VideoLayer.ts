import Layer, {type LayerParams} from "@components/Layer.ts"
import {getCanvasBlob} from "@utils/utils.ts";

export interface VideoLayerParams {
    type?: string
}

type VideoSource = string | MediaStream

const DEFAULT_MIN_WIDTH = 640
const DEFAULT_MIN_HEIGHT = 480
const DEFAULT_IDEAL_WIDTH = 1920
const DEFAULT_IDEAL_HEIGHT = 1080

export default class VideoLayer extends Layer {
    $video: HTMLVideoElement = document.createElement('video')
    autoplay: boolean = true
    currentSrc: VideoSource | null = null
    type: string = 'video'
    plabackStarted: boolean = false

    constructor(params: VideoLayerParams) {
        super({type: params.type} as LayerParams)

        this.setType(params.type ?? this.type)
        this.addEventListeners()
    }

    setType(type: string) {
        this.$video.classList.remove(this.type)
        this.type = type
        this.$video.classList.add(this.type)
    }

    addEventListeners () {
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
            .then(()=>console.log('video played'))
            .catch(()=>console.log('video could not be played'))
    }

    pause() {
        this.$video.pause()
    }

    stop() {
        this.$video.pause()
        this.$video.currentTime = 0
    }

    onplay() {
        this.plabackStarted = true
    }

    onpause() {

    }

    onstop() {
        this.plabackStarted = false
    }

    get isPlaying() {
        return this.plabackStarted
    }

    startImageCapture() {
        const mediaStreamConstraints = {
            video: {
                width: { min: DEFAULT_MIN_WIDTH, ideal: DEFAULT_IDEAL_WIDTH },
                height: { min: DEFAULT_MIN_HEIGHT, ideal: DEFAULT_IDEAL_HEIGHT },
                aspectRatio: {
                    min: DEFAULT_MIN_WIDTH / DEFAULT_MIN_HEIGHT,
                    ideal: DEFAULT_IDEAL_WIDTH / DEFAULT_IDEAL_HEIGHT
                },
            }
        } as MediaStreamConstraints

        navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
            .then((stream) => this.load(stream))
            .catch((err: Error) => {console.error('Error accessing user media', err)})
    }

    stopImageCapture() {
        if (typeof this.currentSrc === 'string') {
            this.stop()
        } else {
            const tracks = this.currentSrc?.getTracks();
            tracks?.forEach((track) => track.stop());
            this.$video.srcObject = null;
        }
    }

    async takePhoto() {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = this.$video.clientWidth
        canvas.height = this.$video.clientHeight

        ctx?.drawImage(this.$video, 0, 0, this.$video.clientWidth, this.$video.clientHeight)

        return getCanvasBlob(canvas)
    }

    getAspectRatio() {
        return this.$video.videoWidth / this.$video.videoHeight
    }

    get videoEl() {
        return this.$video
    }
}