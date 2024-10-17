import "@styles/WorkspaceToolbar.css"

export default class WorkspaceToolBar {
    $el: HTMLElement;
    $coords: HTMLElement;
    $promptBar: HTMLDivElement

    constructor() {
        this.$el = document.createElement('div')
        this.$promptBar = document.createElement('div')
        this.$coords = document.createElement('span')

        this.$promptBar.classList.add('__prompt-bar')
        this.$el.classList.add('__workspace-toolbar')
        this.$coords.setAttribute('id', 'coords')

        this.$el.innerHTML = `
            <label for="color-picker">
                <input type="color" id="color-picker" class="__color-picker" value="#666EFF">
            </label>
        `

        this.$promptBar.innerHTML = `
            <input type="text" placeholder="Type your prompt" class="__input" />
            <button id="submit-prompt" class="__button">Submit</button>
        `
        this.$el.appendChild(this.$coords)
        this.$el.appendChild(this.$promptBar)
    }

    get el() { return this.$el }
}