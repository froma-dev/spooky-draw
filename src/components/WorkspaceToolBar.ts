import "@styles/WorkspaceToolbar.css"

export default class WorkspaceToolBar {
    $el: HTMLElement;
    $coords: HTMLElement;
    $promptBar: HTMLDivElement
    $promptBarButton: HTMLButtonElement

    constructor() {
        this.$el = document.createElement('div')
        this.$promptBar = document.createElement('div')
        this.$promptBarButton = document.createElement('button')
        this.$coords = document.createElement('span')

        this.$promptBar.classList.add('__prompt-bar')
        this.$promptBarButton.classList.add('__button')
        this.$promptBarButton.setAttribute('id', 'submit-prompt')
        this.$el.classList.add('__workspace-toolbar')
        this.$coords.setAttribute('id', 'coords')

        this.$el.innerHTML = `
            <label for="color-picker">
                <input type="color" id="color-picker" class="__color-picker" value="#000000">
            </label>
        `

        this.$promptBarButton.innerHTML = `Submit`

        this.$promptBar.appendChild(this.$promptBarButton)
        this.$el.appendChild(this.$coords)
        this.$el.appendChild(this.$promptBar)
    }

    get el() { return this.$el }
}