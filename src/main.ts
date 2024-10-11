import '@styles/style.css'
import Header from './components/Header.ts'
import {THEME, type Theme} from './components/ThemeSwitch.ts'
import {storage} from "@services/LocalStorage.ts";
import {Footer} from "@components/Footer.ts";

class Main {
    $el: HTMLElement

    constructor() {
        const main = this.$el = document.createElement('main')
        this.$el.setAttribute('id', 'main')

        const body = document.querySelector('body')
        const theme = storage.getItem<Theme>('theme') ?? THEME.DEFAULT
        const header = new Header({theme})
        const footer = new Footer()
        const section = new Section()

        body?.appendChild(header.el)
        body?.appendChild(main)
        body?.appendChild(footer.el)

        this.setListeners()
    }

    setListeners () {
        const root = document.querySelector<HTMLHtmlElement>('html')

        document.addEventListener('themechanged', ((ev: CustomEvent) => {
            const { theme } = ev.detail
            storage.setItem<string>('theme', theme)
            root?.classList.toggle(THEME.DARK)
            root?.classList.toggle(THEME.LIGHT)
        })  as EventListener)
    }
}

new Main()
