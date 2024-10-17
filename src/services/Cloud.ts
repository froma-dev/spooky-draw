import {Cloudinary as Cld} from "@cloudinary/url-gen"
import {generativeBackgroundReplace} from "@cloudinary/url-gen/actions/effect"

const CLOUD_BASE_URL = import.meta.env.VITE_CLOUD_BASE_URL
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME

export type UnsuccessfulData = {
    message: string,
    name: string,
    httpCode: number
}

interface IUploadUnsuccessful {
    success: boolean,
    data: UnsuccessfulData
}

export type SuccessfulData = {
    assetId: string,
    publicId: string,
    secureUrl: string,
    width: number,
    height: number,
    format: string,
    url: string
}

interface IUploadSuccessful {
    success: boolean,
    data: SuccessfulData
}

interface ITransformImageParams {
    imageData: SuccessfulData,
    prompt: string
}

class Cloud {
    private static api: Cloud
    cloudinary: Cld

    private constructor() {
        this.cloudinary = new Cld({
            cloud: {
                cloudName: CLOUD_NAME || 'fromaweb'
            }
        })
    }

    static get instance(): Cloud {
        if (!Cloud.api) {
            Cloud.api = new Cloud()
        }

        return Cloud.api
    }

    buildMessageError(data: UnsuccessfulData) {
        const {message, name, httpCode} = data

        return `${httpCode}: ${name} - ${message}`
    }

    async uploadFile(blob: Blob): Promise<IUploadSuccessful | IUploadUnsuccessful> {
        try {
            const response = await fetch(`${CLOUD_BASE_URL}/cloudy/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': blob.type || 'application/octet-stream'
                },
                body: blob
            })

            if (!response.ok) {
                throw new Error('Error while fetching data')
            }

            return await response.json() as IUploadSuccessful
        } catch (error: unknown) {
            return {
                success: false,
                data: {
                    message: "Request failed.",
                    name: "Request unsuccessful",
                    httpCode: 0
                }
            } as IUploadUnsuccessful
        }
    }

    transformImage({imageData, prompt}: ITransformImageParams) {
        const myImage = this.cloudinary.image(imageData.publicId)
        const generativePrompt = `${prompt} make it spooky halloween themed`

        myImage.effect(generativeBackgroundReplace().prompt(generativePrompt))

        console.log('myImage',myImage)
        console.log('myImage',myImage.toURL())

        return myImage.toURL()
    }
}

const cloud = Cloud.instance

export {cloud}