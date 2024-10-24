import Layer, {type LayerParams} from "@components/Layer.ts"

export interface ImageLayerParams {
    type?: string
    image: {
        src: string,
        $el: HTMLImageElement
    }
}

export default class ImageLayer extends Layer {
    $image: HTMLImageElement

    constructor(params: ImageLayerParams) {
        const {type} = params
        super({type} as LayerParams)

        const {src, $el: $image} = params.image
        this.$image = $image

        if ($image && src) {
            $image.addEventListener('load', () => this.drawImage())
            $image.crossOrigin = 'anonymous'
            $image.src = src
        }
    }

    getAspectRatio() {
        return this.$image.naturalWidth / this.$image.naturalHeight
    }

    get imageEl() {
        return this.$image
    }
}