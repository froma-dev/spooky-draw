export default class Canvas {
    $el: HTMLElement

    constructor() {
        this.$el = document.createElement('div')
        this.$el.classList.add('canvas-container')

        this.setListeners()
    }

    setListeners() {
        document.addEventListener('click', (ev: Event) => {
            const target = ev.target as HTMLElement

            if (target.id === 'take-photo') this.triggerCamera()
        })
    }

    appendChild(child: HTMLElement) {
        this.$el.appendChild(child)
    }

    removeChild(child: HTMLElement) {
        this.$el.removeChild(child)
    }

    triggerCamera() {
        console.log('trigger camera!')
    }

    get el() {
        return this.$el
    }
}