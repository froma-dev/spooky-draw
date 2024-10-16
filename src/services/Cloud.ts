import {Cloudinary as Cld} from "@cloudinary/url-gen";
const CLOUD_BASE_URL = import.meta.env.VITE_CLOUD_BASE_URL
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME

console.log('CLOUD_BASE_URL', CLOUD_BASE_URL)
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

    async uploadFile (blob: Blob) {
        const response = await fetch(`${CLOUD_BASE_URL}/cloudy/upload`, {
            method: 'POST',
            headers: { 'Content-Type': blob.type || 'application/octet-stream' },
            body: blob
        })
        const uploadResult = await response.json()

        console.log('upload result' , uploadResult, response)
    }
}

const cloud = Cloud.instance

export {cloud}