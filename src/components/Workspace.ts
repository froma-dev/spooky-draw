import '@styles/Workspace.css'
import {Layers} from "@components/Layers.ts";

export class Workspace {
    $el: HTMLElement
    $content: HTMLElement
    $canvasContainer: HTMLElement
    layers: Layers

    constructor() {
        this.$el = document.createElement('section')
        this.$content = document.createElement('div')
        this.$content.classList.add('__content')
        this.$el.classList.add('workspace')
        this.$el.innerHTML = `
            <h2>Workspace</h2>
        `

        const canvasContainer= this.$canvasContainer = document.createElement('div')//new Layer({type: 'image'})
        canvasContainer.classList.add('canvas-container')
        this.layers = new Layers()

        this.$content.appendChild(this.layers.el)
        this.$content.appendChild(canvasContainer)

        this.$el.addEventListener("change", this.updateImageDisplay);

        this.$el.appendChild(this.$content)
    }

    updateImageDisplay (ev: Event) {
        console.log('updateImageDisplay', ev)
        //this.layers.
    }

    get el() {
        return this.$el
    }
}