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
        super({type: params.type} as LayerParams)

        const {src, $el: $image} = params.image
        this.$image = $image

        if ($image && src) {
            $image.addEventListener('load', () => this.drawImage())
            $image.src = src
        }
    }

    drawImage() {
        const $canvas = this.$el
        const $image = this.$image
        const canvasWidth = $canvas.parentElement?.clientWidth ?? 1
        const canvasHeight = $canvas.parentElement?.clientHeight ?? 1
        const imageAspectRatio = $image.naturalWidth / $image.naturalHeight
        const canvasAspectRatio = canvasWidth / canvasHeight
        let drawWidth, drawHeight, offsetX, offsetY

        this.setCanvasSize(canvasWidth, canvasHeight)

        if (imageAspectRatio > canvasAspectRatio) {
            drawHeight = canvasHeight
            drawWidth = drawHeight * imageAspectRatio
            offsetX = -(drawWidth - canvasWidth) / 2
            offsetY = 0
        } else {
            drawWidth = canvasWidth
            drawHeight = drawWidth / imageAspectRatio
            offsetX = 0
            offsetY = -(drawHeight - canvasHeight) / 2
        }

        const canvas = this.$el
        const ctx = canvas.getContext('2d')
        ctx?.drawImage($image, offsetX, offsetY, drawWidth, drawHeight)
    }

    get imageEl() {
        return this.$image
    }
}