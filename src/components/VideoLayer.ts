import Layer, {type LayerParams} from "@components/Layer.ts"

export interface VideoLayerParams {
    type?: string
    image: {
        src: string,
        $el: HTMLImageElement
    }
}

export default class VideoLayer extends Layer {
    $video: HTMLImageElement

    constructor(params: VideoLayerParams) {
        super({type: params.type} as LayerParams)

        const {src, $el: $video} = params.image
        this.$video = $video

        if ($video && src) {
            $video.addEventListener('load', () => this.drawImage())
            $video.crossOrigin = 'anonymous'
            $video.src = src
        }
    }

    drawImage() {
        const $canvas = this.$el
        const $video = this.$video

        const canvas = this.$el
        const ctx = canvas.getContext('2d')
        ctx?.drawImage($video, 0, 0, drawWidth, drawHeight)
    }

    get videoEl() {
        return this.$video
    }
}