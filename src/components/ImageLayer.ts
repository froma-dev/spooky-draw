import Layer, {type LayerParams} from "@components/Layer.ts";

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
        super({type: params.type} as LayerParams)

        const {src, $el: $image} = params.image
        this.$image = $image

        if ($image && src) {
            const canvas = this.$el
            const ctx = canvas.getContext('2d')

            $image.addEventListener('load', () => {
                ctx?.drawImage($image, 0, 0, canvas.width, canvas.height)
            })

            $image.src = src
        }
    }

    get imageEl() {
        return this.$image
    }
}