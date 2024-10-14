import '@styles/Workspace.css'
import {Layers} from "@components/Layers.ts";
import Layer from "@components/Layer.ts";

export class Workspace {
    $el: HTMLElement
    $content: HTMLElement
    $canvasContainer: HTMLElement
    layers: Layers
    canvasLayers: Layer[]

    constructor() {
        this.$el = document.createElement('section')
        this.$content = document.createElement('div')
        this.$content.classList.add('__content')
        this.$el.classList.add('workspace')
        this.$el.innerHTML = `
            <h2>Workspace</h2>
        `

        this.$canvasContainer = document.createElement('div')//new Layer({type: 'image'})
        this.$canvasContainer.classList.add('canvas-container')
        this.layers = new Layers()
        this.canvasLayers = []

        this.$content.appendChild(this.layers.el)
        this.$content.appendChild(this.$canvasContainer)

        this.$el.addEventListener("change", (ev) => {
            this.updateImageDisplay(ev)
        });

        this.$el.appendChild(this.$content)
    }

    updateImageDisplay (ev: Event) {
        console.log('updateImageDisplay', ev)
        const $input = ev.target as HTMLInputElement
        let [file] = $input?.files ?? []

        const src = URL.createObjectURL(file)

        if (this.canvasLayers.length === 0) {
            const imageLayer = new Layer({
                type: 'image',
                src
            })

            this.$canvasContainer.appendChild(imageLayer.el)
            this.canvasLayers.push(imageLayer)
        } else {

        }

    }

    get el() {
        return this.$el
    }
}