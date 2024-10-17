import "@styles/Footer.css"
import {GithubIcon} from "@icons/Icon.ts";
export class Footer {
    $el: HTMLElement

    constructor() {
        const name = 'Frank Romaña'
        const github = 'https://github.com/froma-dev/spooky-draw'

        const footer = this.$el = document.createElement('footer')

        footer.innerHTML = `
            <div class="content">
                <h2>${name}</h2>
                <a href=${github} target="_blank" rel="noopener noreferrer">
                    ${GithubIcon}
                </a>
            </div>
        `
    }

    get el () {
        return this.$el
    }
}