import "@styles/WorkspaceToolbar.css"
import {LoadingIcon} from "@icons/Icon.ts";

const mappedStatusIcons = {
    'loading': LoadingIcon
}

type Status = 'loading' | 'error' | 'loaded'

export default class WorkspaceToolBar {
    $el: HTMLElement;
    $coords: HTMLElement;
    $promptBar: HTMLDivElement
    $outputs: HTMLDivElement

    constructor() {
        this.$el = document.createElement('div')
        this.$promptBar = document.createElement('div')
        this.$coords = document.createElement('span')

        this.$promptBar.classList.add('prompt-bar')
        this.$el.classList.add('workspace-toolbar')
        this.$coords.setAttribute('id', 'coords')
        const $inputs = document.createElement('div')
        $inputs.classList.add('inputs')
        this.$outputs = document.createElement('div')
        this.$outputs.classList.add('outputs')

        $inputs.innerHTML = `
            <label for="color-picker">
                <input type="color" id="color-picker" class="__color-picker" value="#666EFF">
            </label>
        `

        this.$promptBar.innerHTML = `
            <input type="text" placeholder="Type your prompt" class="__input" />
            <button id="submit-prompt" class="__button">Submit</button>
        `
        $inputs.appendChild(this.$coords)
        $inputs.appendChild(this.$promptBar)
        this.$el.appendChild($inputs)
        this.$el.appendChild(this.$outputs)
    }

    appendPrompt() {

    }

    async appendOutputImage({src}: {src: string}) {
        return new Promise<void>((resolve, reject) => {
            const $transformedImg = document.createElement('img')
            $transformedImg.onload = () => resolve()
            $transformedImg.onerror = () => reject()
            $transformedImg.src = src
            $transformedImg.alt = "Transformed image"
            this.$outputs.appendChild($transformedImg)
        })
    }

    appendOutputStatus({status, icon}: {status: string, icon: Status}) {
        const $status = document.createElement('div')
        let iconStatus = ''
        $status.classList.add('status')

        if (icon === 'loading') {
            iconStatus = mappedStatusIcons.loading
        }

        $status.innerHTML = `
            <span class="icon">${iconStatus}</span>
            <span class="text">${status}</span>
        `

        this.$outputs.appendChild($status)
    }

    get el() { return this.$el }
}