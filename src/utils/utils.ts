const imgFileTypes = [
    "image/jpg",
    "image/jpeg",
    "image/png",
    "image/svg+xml",
    "image/webp",
]

export const isValidImgFileType = (fileType: string) => imgFileTypes.includes(fileType)

export const getCanvasBlob = async ($canvas: HTMLCanvasElement) => {
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