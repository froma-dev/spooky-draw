import Layer from "@components/Layer.ts";
import '@styles/Workspace.css'
import {Layers} from "@components/Layers.ts";

export class Workspace {
    $el: HTMLElement
    $content: HTMLElement

    constructor() {
        this.$el = document.createElement('section')
        this.$content = document.createElement('div')
        this.$content.classList.add('__content')
        this.$el.classList.add('workspace')
        this.$el.innerHTML = `
            <h2>Workspace</h2>
        `

        const imageCanvas = new Layer({type: 'image'})
        const layers = new Layers()

        this.$content.appendChild(layers.el)
        this.$content.appendChild(imageCanvas.el)

        this.$el.appendChild(this.$content)
    }

    get el() {
        return this.$el
    }
}