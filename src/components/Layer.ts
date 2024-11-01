export interface LayerParams {
    type?: string
}

const MODES = {
    DRAW: 'draw',
    ERASE: 'erase',
    RECTANGLE: 'rectangle',
    RECTANGLE_FILL: 'rectangleFill',
    ELLIPSE: 'ellipse',
    ELLIPSE_FILL: 'ellipseFill',
    PICKER: 'picker',
    CLEAR: 'clear',
    LINE: 'line',
}

export default class Layer {
    $el: HTMLCanvasElement
    isDrawing: boolean
    startX: number
    startY: number
    lastX: number
    lastY: number
    controlZValues: ImageData[]
    imageData: ImageData | undefined
    ctx: CanvasRenderingContext2D | null
    mode: string
    isShiftDown: boolean

    constructor({type}: LayerParams) {
        this.isDrawing = false
        this.startX = 0
        this.startY = 0
        this.lastX = 0
        this.lastY = 0
        this.controlZValues = []
        this.mode = MODES.DRAW
        this.isShiftDown = false
        const canvas = this.$el = document.createElement('canvas')
        canvas.classList.add(`--${type}`)

        this.ctx = type === 'canvas' ? canvas.getContext('2d') : null

        if (type === 'canvas') {
            canvas.addEventListener('mousedown', (ev: MouseEvent) => this.startDrawingCursor(ev))
            canvas.addEventListener('mouseup', () => this.stopDrawing())
            canvas.addEventListener('mouseleave', () => this.stopDrawing())
        }
    }

    startDrawingCursor(ev: MouseEvent) {
        this.startDrawing(ev)
        this.$el.addEventListener('mousemove', (ev: MouseEvent) => this.draw(ev))
    }

    startDrawing(ev: MouseEvent) {
        this.isDrawing = true
        const {offsetX, offsetY} = ev;

        [this.startX, this.startY] = [offsetX, offsetY];
        [this.lastX, this.lastY] = [offsetX, offsetY];

        this.imageData = this.getCurrentImageData()

        if (this.imageData)
            this.controlZValues.push(this.imageData)
    }

    stopDrawing() {
        if (this.isDrawing) document.dispatchEvent(new CustomEvent('drawchange', {detail: this.$el}))
        this.isDrawing = false
        this.$el.removeEventListener('mousemove', this.draw)
    }

    updateCoords(ev: MouseEvent) {
        let {offsetX, offsetY} = ev
        if (offsetX < 0) offsetX = 0
        if (offsetY < 0) offsetY = 0

        //$coords.innerText = `${offsetX},${offsetY}`
    }

    clearCoords() {
        //$coords.innerText = ''
    }

    draw(ev: MouseEvent) {
        if (!this.isDrawing || !this.ctx) return
        const {offsetX, offsetY} = ev

        if (this.mode === MODES.DRAW || this.mode === MODES.ERASE) {
            this.ctx.lineWidth = 15
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.lineJoin = 'round'
            this.ctx.lineCap = 'round'
            this.ctx.strokeStyle = "#666EFF"
            this.ctx.beginPath()
            this.ctx.moveTo(this.lastX, this.lastY)
            this.ctx.lineTo(offsetX, offsetY)
            this.ctx.stroke()

            ;[this.lastX, this.lastY] = [offsetX, offsetY]
            return
        }

        if (!this.imageData) return

        if (this.mode === MODES.LINE) {
            this.ctx.putImageData(this.imageData, 0, 0)
            this.ctx.beginPath()
            this.ctx.moveTo(this.startX, this.startY)
            this.ctx.lineTo(offsetX, offsetY)
            this.ctx.stroke()

            ;[this.lastX, this.lastY] = [offsetX, offsetY]
            return
        }

        if (this.mode === MODES.RECTANGLE || this.mode === MODES.ELLIPSE || this.mode === MODES.RECTANGLE_FILL || this.mode === MODES.ELLIPSE_FILL) {
            this.ctx.putImageData(this.imageData, 0, 0)
            let width = offsetX - this.startX
            let height = offsetY - this.startY
            let startAngle = 0
            let endAngle = 2 * Math.PI

            if (this.isShiftDown) {
                const sideLength = Math.min(
                    Math.abs(width),
                    Math.abs(height)
                )

                width = width > 0 ? sideLength : -sideLength
                height = height > 0 ? sideLength : -sideLength
            }

            this.ctx.beginPath()
            if (this.mode === MODES.RECTANGLE)
                this.ctx.strokeRect(this.startX, this.startY, width, height)
            else if (this.mode === MODES.ELLIPSE) {
                this.ctx.ellipse(this.startX, this.startY, Math.abs(width), Math.abs(height), 0, startAngle, endAngle)
                this.ctx.stroke()
            } else if (this.mode === MODES.RECTANGLE_FILL) {
                this.ctx.fillRect(this.startX, this.startY, width, height)
            } else if (this.mode === MODES.ELLIPSE_FILL) {
                this.ctx.ellipse(this.startX, this.startY, Math.abs(width), Math.abs(height), 0, startAngle, endAngle)
                this.ctx.fill()
            }
        }
    }

    getCurrentImageData() {
        const ctx = this.$el.getContext('2d')
        return ctx?.getImageData(0, 0, this.$el.width, this.$el.height)
    }

    setCanvasSize(canvasWidth: number, canvasHeight: number) {
        const $canvas = this.$el

        $canvas.width = canvasWidth
        $canvas.height = canvasHeight
    }

    clearCanvas() {
        const currentImageData = this.getCurrentImageData()
        const $canvas = this.$el
        const ctx = $canvas.getContext('2d')

        if(currentImageData) this.controlZValues.push(currentImageData)
        ctx?.clearRect(0, 0, $canvas.width, $canvas.height)
    }

    drawImage() {
        const $canvas = this.$el
        const $source = this.getSource()
        const canvasWidth = $canvas.parentElement?.clientWidth ?? 1
        const canvasHeight = $canvas.parentElement?.clientHeight ?? 1
        const imageAspectRatio = this.getAspectRatio()
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
        ctx?.drawImage($source, offsetX, offsetY, drawWidth, drawHeight)
    }

    getAspectRatio() {return 1}

    getSource() {return this.$el}

    resetCanvas() {
        this.clearCanvas()
        this.controlZValues.length = 0
    }

    get el() {
        return this.$el
    }
}

