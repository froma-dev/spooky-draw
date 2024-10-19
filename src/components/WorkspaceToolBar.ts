import "@styles/WorkspaceToolbar.css"
import {CircleCheck, CircleExclamation, LoadingIcon} from "@icons/Icon.ts";

const mappedStatusIcons = {
    'loading': LoadingIcon,
    'success': CircleCheck,
    'error': CircleExclamation
}

type Status = 'loading' | 'error' | 'success'

interface IStatusParams {
    status: string,
    icon: Status
}

export default class WorkspaceToolBar {
    $el: HTMLElement;
    $coords: HTMLElement;
    $promptBar: HTMLDivElement
    $outputs: HTMLDivElement
    $promptInput: HTMLInputElement

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
            <input type="text" placeholder="Type your prompt" class="input" />
            <button id="submit-prompt" class="button">Submit</button>
        `
        this.$promptInput = this.$promptBar.querySelector('.input')!
        $inputs.appendChild(this.$coords)
        $inputs.appendChild(this.$promptBar)
        this.$el.appendChild($inputs)
        this.$el.appendChild(this.$outputs)
    }

    appendPrompt() {

    }

    async appendOutputImage({src}: { src: string, fallback: string }) {
        return new Promise<void>((resolve, reject) => {
            const $transformedImg = document.createElement('img')

            $transformedImg.onload = () => resolve()
            $transformedImg.onerror = () => {
                $transformedImg.src = src
                reject()
            }
            $transformedImg.src = src
            $transformedImg.alt = "Transformed image"
            this.$outputs.appendChild($transformedImg)
        })
    }

    appendOutputStatus({status, icon}: IStatusParams) {
        const $status = document.createElement('div')
        let iconStatus = ''
        $status.classList.add('status', `--${icon}`)

        if (icon === 'loading') {
            iconStatus = mappedStatusIcons.loading
        }

        $status.innerHTML = `
            <span class="icon">${iconStatus}</span>
            <span class="text">${status}</span>
        `

        this.$outputs.appendChild($status)
    }

    updatePrevOutputStatus({status, icon}: IStatusParams) {
        const $statusList = this.$outputs.querySelectorAll('.status')
        const $lastStatus = $statusList[$statusList.length - 1]
        let iconStatus = icon === 'success' ? mappedStatusIcons.success : mappedStatusIcons.error
        const $icon = $lastStatus.querySelector('.icon')
        const $text = $lastStatus.querySelector('.text')

        $lastStatus.classList.remove('status', `--loading`)
        $lastStatus.classList.add('status', `--${icon}`)

        if ($icon)
            $icon.innerHTML = iconStatus
        if ($text)
            $text.innerHTML = status
    }

    retrieveInputValue() {
        return this.$promptInput.value
    }

    clearInputValue() {
        this.$promptInput.value = ''
    }

    get el() {
        return this.$el
    }
}