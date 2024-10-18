import '@styles/style.css'
import '@styles/animations.css'
import Header from './components/Header.ts'
import {THEME, type Theme} from './components/ThemeSwitch.ts'
import {storage} from "@services/LocalStorage.ts";
import {Footer} from "@components/Footer.ts";
import {Workspace} from "@components/Workspace.ts";

class Main {
    $el: HTMLElement
    $root: HTMLHtmlElement | null

    constructor() {
        const main = this.$el = document.createElement('main')
        this.$el.setAttribute('id', 'app')
        this.$root = document.querySelector<HTMLHtmlElement>('html')

        const body = document.querySelector('body')
        const theme = storage.getItem<Theme>('theme') ?? THEME.DEFAULT
        this.$root?.classList.add(theme)
        const header = new Header({theme})
        const footer = new Footer()
        const workspace = new Workspace()

        main.appendChild(workspace.el)

        body?.appendChild(header.el)
        body?.appendChild(main)
        body?.appendChild(footer.el)

        this.setListeners()
    }

    setListeners () {
        document.addEventListener('themechanged', ((ev: CustomEvent) => {
            const { theme } = ev.detail
            storage.setItem<string>('theme', theme)
            this.$root?.classList.toggle(THEME.DARK)
            this.$root?.classList.toggle(THEME.LIGHT)
        })  as EventListener)
    }
}

new Main()
