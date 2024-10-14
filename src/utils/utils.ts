const imgFileTypes = [
    "image/jpg",
    "image/jpeg",
    "image/png",
    "image/svg+xml",
    "image/webp",
]

export const isValidImgFileType = (fileType: string) => imgFileTypes.includes(fileType)