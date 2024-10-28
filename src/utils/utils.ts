const imgFileTypes = [
    "image/jpg",
    "image/jpeg",
    "image/png",
    "image/svg+xml",
    "image/webp",
]
const $canvas = document.createElement('canvas')

export const isValidImgFileType = (fileType: string) => imgFileTypes.includes(fileType)

export const getCanvasBlob = async ($canvas: HTMLCanvasElement) =>  {
    const blobPromise = new Promise<Blob>((resolve, reject) => {
        $canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob)
            } else {
                reject(new Error("No image info"))
            }
        }, 'image/jpg')
    })

    return Promise.resolve(blobPromise)
}

export async function getImageBlob($image: HTMLImageElement) {
    // const context = $canvas.getContext('2d')!
    //
    // context.clearRect(0, 0, $canvas.width, $canvas.height)
    // $canvas.width = $image.width
    // $canvas.height = $image.height;
    // context.drawImage($image, 0, 0)

    const canvasWidth = $image.width
    const canvasHeight = $image.height
    const imageAspectRatio = getAspectRatio($image)
    //const canvasAspectRatio = canvasWidth / canvasHeight
    let drawWidth, drawHeight, offsetX, offsetY

    $canvas.width = canvasWidth
    $canvas.height = canvasHeight

    drawWidth = canvasWidth
    drawHeight = drawWidth / imageAspectRatio
    offsetX = 0
    offsetY = -(drawHeight - canvasHeight) / 2

    const ctx = $canvas.getContext('2d')
    ctx?.drawImage($image, offsetX, offsetY, drawWidth, drawHeight)

    //document.$someCanvas = $canvas

    return getCanvasBlob($canvas)
}

function getAspectRatio($image: HTMLImageElement) {
    return $image.naturalWidth / $image.naturalHeight
}

export const retrieveSrcFromFile = (file: File) => {
    let src

    try {
        src = URL.createObjectURL(file)
    } catch (err) {
        src = URL.createObjectURL(file)
    }

    if (!isValidImgFileType(file?.type)) {
        console.error(`File ${file?.type} is invalid.`)
        return ''
    }

    return src
}