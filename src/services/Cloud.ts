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

    async uploadFile (formData: FormData) {
        const uploadResult = fetch(`${CLOUD_BASE_URL}/cloudy/upload`, {
            method: 'POST',
            body: JSON.stringify({
                data: ""
            })
        }).then(async res => await res.json())

        console.log('upload result' , uploadResult)
    }
}

const cloud = Cloud.instance

export {cloud}