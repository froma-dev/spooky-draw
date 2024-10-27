import "@styles/WorkspaceToolbar.css"
import {CircleCheck, CircleExclamation, LoadingIcon, PhotoDownload} from "@icons/Icon.ts";
import {SuccessfulData as IImageData} from "@services/Cloud.ts";

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

interface IOutputImageParams {
    src: string,
    imageData: IImageData
}

export default class WorkspaceToolBar {
    $el: HTMLElement;
    $promptBar: HTMLDivElement
    $outputs: HTMLDivElement
    $promptInput: HTMLInputElement

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
                <input type="text" placeholder="Type your prompt" class="input" />
                <button id="submit-prompt" class="button">Submit</button>
            </section>
            
            <section class="prompters">
                <h3>Replace Items</h3>
                <label for="replace-this">
                    <input id="replace-this" type="text" placeholder="What to replace?" class="input" />
                </label>
                <label for="with-this">
                    <input id="with-this" type="text" placeholder="What to replace with?" class="input" />
                </label>
                <button id="submit-replace-item" class="button">Submit</button>
            </section>
        `
        this.$promptInput = this.$promptBar.querySelector('.input')!
        this.$promptInput.addEventListener('change', (ev: Event) => {ev.stopPropagation()})
        $inputs.appendChild(this.$promptBar)
        this.$el.appendChild($inputs)
        this.$el.appendChild(this.$outputs)
    }

    appendPrompt() {

    }

    async appendOutputImage({src, imageData}: IOutputImageParams) {
        return new Promise<void>((resolve, reject) => {
            const $status = document.createElement('div')
            const $transformedImg = document.createElement('img')

            $status.classList.add('status', `--transformed`)
            $transformedImg.classList.add('transformed')
            $transformedImg.crossOrigin = 'anonymous'
            $transformedImg.onload = () => {
                const $imageActions = this.getImageActions(imageData.publicId, src)
                $status.appendChild($imageActions)
                $status.scrollIntoView({ behavior: 'smooth' })
                resolve()
            }
            $transformedImg.onerror = () => {
                $transformedImg.src = imageData.secureUrl
                reject()
            }
            $transformedImg.crossOrigin = 'anonymous'
            $transformedImg.src = src
            $transformedImg.alt = "Transformed image"

            $status.appendChild($transformedImg)
            $status.scrollIntoView({ behavior: 'smooth' })
            this.$outputs.appendChild($status)
        })
    }

    getImageActions (publicId: string, src: string): HTMLDivElement {
        const $replaceImageButton = document.createElement('button')
        $replaceImageButton.classList.add('button', 'change-to-transformed-image')
        $replaceImageButton.setAttribute('id', 'change-to-transformed-image')
        $replaceImageButton.setAttribute('data-publicid', publicId)
        $replaceImageButton.innerHTML = 'Prompt this image'

        const $imageActions = document.createElement('div')
        $imageActions.classList.add('options')
        $imageActions.innerHTML = `
            <a class="button download-transformation" href=${src} download=${publicId} target="_blank">
                <span class="icon">${PhotoDownload}</span>
                <span class="text">Download</span>
            </a>
            `
        $imageActions.append($replaceImageButton)

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
        $status.scrollIntoView({ behavior: 'smooth' })
    }

    updatePrevOutputStatus({status, icon}: IStatusParams) {
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

        if (icon === 'error') {

        }
    }

    retrieveInputValue({clear = false}: {clear?: boolean}) {
        const inputValue = this.$promptInput.value
        if (clear) this.$promptInput.value = ''
        return inputValue
    }

    retrieveInputValues({clear = false}: {clear?: boolean}) {
        const $from = this.$promptBar.querySelector('#replace-this') as HTMLInputElement
        const $to = this.$promptBar.querySelector('#with-this') as HTMLInputElement
        const inputValues = [$from.value, $to.value]

        if (clear) {
            $from.value = ''
            $to.value = ''
        }
        return inputValues
    }

    clearInputValue() {
        this.$promptInput.value = ''
    }

    clearWorkspace() {
        this.$outputs.innerHTML = ''
    }

    get el() {
        return this.$el
    }
}