import ThemeSwitch, {type Theme, type ThemeSwitchParams} from "@components/ThemeSwitch.ts";
import '@styles/Header.css'

type HeaderParams = {
    theme: Theme
}

export default class Header {
    $el: HTMLElement

    constructor(params: HeaderParams) {
        const themeSwitch = new ThemeSwitch({...params} as ThemeSwitchParams)
        this.$el = document.createElement('header')
        this.$el.classList.add('header')
        this.$el.innerHTML = `<h1>AI Modification</h1>`

        this.$el.appendChild(themeSwitch.el)
    }

    get el () {
        return this.$el
    }
}