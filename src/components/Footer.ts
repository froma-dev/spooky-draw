export class Footer {
    $el: HTMLElement
    name: string
    github: string

    constructor() {
        this.name = 'Frank Romaña'
        this.github = 'https://github.com/froma-dev'

        const footer = this.$el = document.createElement('footer')

        footer.innerHTML = `
            <div class="content">
                <span>${this.name}</span>
                <span>${this.github}</span>
            </div>
        `
    }

    get el () {
        return this.$el
    }
}