import "@styles/WorkspaceToolbar.css"
import {CircleCheck, CircleExclamation, LoadingIcon, PhotoDownload, RetryIcon} from "@icons/Icon.ts";

const mappedStatusIcons = {
    'loading': LoadingIcon,
    'success': CircleCheck,
    'error': CircleExclamation,
    'retry': RetryIcon
}

type Status = 'loading' | 'error' | 'success'

interface IStatusParams {
    status: string,
    icon: Status,
    button?: {
        icon: string,
        text: string,
        onClick: () => void
    }
}

export default class WorkspaceToolBar {
    $el: HTMLElement;
    $promptBar: HTMLDivElement
    $outputs: HTMLDivElement
    $promptInput: HTMLInputElement
    $shakeInputTimeoutID: number | null = null
    $shakeInputsTimeoutID: number | null = null

    constructor() {
        this.$el = document.createElement('div')
        this.$promptBar = document.createElement('div')

        this.$promptBar.classList.add('prompt-bar')
        this.$el.classList.add('workspace-toolbar')
        const $inputs = document.createElement('div')
        $inputs.classList.add('inputs')
        this.$outputs = document.createElement('div')
        this.$outputs.classList.add('outputs')

        this.$promptBar.innerHTML = `
            <section class="prompters">
                <h3>Replace Background</h3>
                <input type="text" placeholder="Type your prompt" class="input"/>
                <button id="submit-prompt" class="button">Submit</button>
            </section>
            
            <section class="prompters">
                <h3>Replace Items</h3>
                <label for="replace-this">
                    <input id="replace-this" type="text" placeholder="What to replace?" class="input"/>
                </label>
                <label for="with-this">
                    <input id="with-this" type="text" placeholder="What to replace with?" class="input"/>
                </label>
                <button id="submit-replace-item" class="button">Submit</button>
            </section>
        `
        this.$promptInput = this.$promptBar.querySelector('.input')!
        this.$promptInput.addEventListener('change', (ev: Event) => {
            ev.stopPropagation()
        })
        $inputs.appendChild(this.$promptBar)
        this.$el.appendChild($inputs)
        this.$el.appendChild(this.$outputs)
        this.disablePromptInput()
    }

    appendPrompt() {

    }

    async appendOutputImage({src}: { src: string }) {
        return new Promise<void>((resolve, reject) => {
            const $status = document.createElement('div')
            const $transformedImg = document.createElement('img')
            const onLoad = () => {
                const $imageActions = this.getImageActions(src)
                $status.appendChild($imageActions)
                $status.scrollIntoView({behavior: 'smooth'})
                resolve()
                $transformedImg.removeEventListener('error', onError)
            }
            const onError = () => {
                reject()
                $transformedImg.removeEventListener('load', onLoad)
                $transformedImg.remove()
                $status.remove()
            }

            $status.classList.add('status', `--transformed`)
            $transformedImg.classList.add('transformed')
            $transformedImg.crossOrigin = 'anonymous'
            $transformedImg.addEventListener('load', onLoad, {once: true})
            $transformedImg.addEventListener('error', onError, {once: true})

            $transformedImg.crossOrigin = 'anonymous'
            $transformedImg.src = src
            $transformedImg.alt = "Transformed image"

            $status.appendChild($transformedImg)
            $status.scrollIntoView({behavior: 'smooth'})
            this.$outputs.appendChild($status)
        })
    }

    getImageActions(src: string): HTMLDivElement {
        const $downloadImageButton = document.createElement('button')
        $downloadImageButton.classList.add('button', 'download-transformation')
        $downloadImageButton.setAttribute('id', 'download-transformation')
        $downloadImageButton.setAttribute('data-src', src)
        $downloadImageButton.innerHTML = `${PhotoDownload} <span class="text">Download</span>`

        const $imageActions = document.createElement('div')
        $imageActions.classList.add('options')
        $imageActions.append($downloadImageButton)

        return $imageActions
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
        $status.scrollIntoView({behavior: 'smooth'})
    }

    updatePrevOutputStatus({status, icon, button}: IStatusParams) {
        const $statusList = this.$outputs.querySelectorAll('.--loading')
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

        if (button) {
            const $button = document.createElement('button')
            $button.classList.add('button', 'retry')
            $button.innerHTML = `${mappedStatusIcons['retry']}<span class="text">Retry</span>`
            $button.setAttribute('id', 'retry-button')
            $button.addEventListener('click', () => {
                button.onClick()
                $button.remove()
                $lastStatus.remove()
            }, {once: true})
            $lastStatus.append($button)
        }

        if (icon === 'error') {

        }
    }

    retrieveInputValue({clear = false}: { clear?: boolean }) {
        const inputValue = this.$promptInput.value
        if (clear) this.$promptInput.value = ''
        return inputValue
    }

    shakeInput() {
        if (this.$shakeInputTimeoutID) return
        this.$promptInput.classList.add('shake')

        this.$shakeInputTimeoutID = setTimeout(() => {
            this.$promptInput.classList.remove('shake')
            this.$shakeInputTimeoutID = null
        }, 1000)
    }

    retrieveInputValues({clear = false}: { clear?: boolean }) {
        const $from = this.$promptBar.querySelector('#replace-this') as HTMLInputElement
        const $to = this.$promptBar.querySelector('#with-this') as HTMLInputElement
        const inputValues = []

        if ($from.value.length > 0) inputValues.push($from.value)
        if ($to.value.length > 0) inputValues.push($to.value)
        if (clear && inputValues.length === 2) {
            $from.value = ''
            $to.value = ''
        }
        return inputValues
    }

    shakeInputs() {
        if (this.$shakeInputsTimeoutID) return
        const $from = this.$promptBar.querySelector('#replace-this') as HTMLInputElement
        const $to = this.$promptBar.querySelector('#with-this') as HTMLInputElement

        if ($from.value.length === 0) $from.classList.add('shake')
        if ($to.value.length === 0) $to.classList.add('shake')

        this.$shakeInputsTimeoutID = setTimeout(() => {
            $from.classList.remove('shake')
            $to.classList.remove('shake')
            this.$shakeInputsTimeoutID = null
        }, 1000)
    }

    clearInputValue() {
        this.$promptInput.value = ''
    }

    clearWorkspace() {
        this.$outputs.innerHTML = ''
    }

    enablePromptInput() {
        const $from = this.$promptBar.querySelector('#replace-this') as HTMLInputElement
        const $to = this.$promptBar.querySelector('#with-this') as HTMLInputElement
        const $submitReplaceButton = this.$promptBar.querySelector('#submit-replace-item') as HTMLButtonElement
        const $submitButton = this.$promptBar.querySelector('#submit-prompt') as HTMLButtonElement

        this.$promptInput.removeAttribute('disabled')
        $submitReplaceButton.removeAttribute('disabled')
        $submitButton.removeAttribute('disabled')
        $from.removeAttribute('disabled')
        $to.removeAttribute('disabled')

        this.$promptInput.classList.remove('disabled')
        $submitReplaceButton.classList.remove('disabled')
        $submitButton.classList.remove('disabled')
        $from.classList.remove('disabled')
        $to.classList.remove('disabled')
    }

    disablePromptInput() {
        const $from = this.$promptBar.querySelector('#replace-this') as HTMLInputElement
        const $to = this.$promptBar.querySelector('#with-this') as HTMLInputElement
        const $submitReplaceButton = this.$promptBar.querySelector('#submit-replace-item') as HTMLButtonElement
        const $submitButton = this.$promptBar.querySelector('#submit-prompt') as HTMLButtonElement

        this.$promptInput.setAttribute('disabled', '')
        $from.setAttribute('disabled', '')
        $to.setAttribute('disabled', '')
        $submitReplaceButton.setAttribute('disabled', '')
        $submitButton.setAttribute('disabled', '')

        this.$promptInput.classList.add('disabled')
        $from.classList.add('disabled')
        $to.classList.add('disabled')
        $submitReplaceButton.classList.add('disabled')
        $submitButton.classList.add('disabled')
    }

    get el() {
        return this.$el
    }
}