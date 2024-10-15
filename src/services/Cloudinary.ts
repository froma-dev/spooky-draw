class Cloudinary {
    private static api: Cloudinary

    private constructor() {}

    static get instance(): Cloudinary {
        if (!Cloudinary.api) {
            Cloudinary.api = new Cloudinary()
        }

        return Cloudinary.api
    }
}

let api = Cloudinary.instance

export {api}