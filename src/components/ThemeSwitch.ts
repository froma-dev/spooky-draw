import {SunHighIcon, MoonStarsIcon} from "../icons/Icon.ts";
import "@styles/ThemeSwitch.css"

export const THEME = {
    DEFAULT: 'dark',
    DARK: 'dark',
    LIGHT: 'light',
}
export type Theme = typeof THEME[keyof typeof THEME]

export interface ThemeSwitchParams {
    theme?: Theme | null
}

export default class ThemeSwitch {
    currentTheme: Theme
    $el: HTMLButtonElement

    constructor({theme}: ThemeSwitchParams) {
        this.$el = document.createElement('button')
        this.$el.classList.add('theme-switch')
        this.$el.innerHTML = `
            <span class="__content">
                <span class="__icon">${SunHighIcon}${MoonStarsIcon}</span>
            </span>
        `
        this.currentTheme = theme ?? THEME.DEFAULT

        this.$el.addEventListener('click', this.changeTheme)
    }

    changeTheme() {
        this.currentTheme = (this.currentTheme === THEME.DARK)
            ? THEME.LIGHT
            : THEME.DARK

        document.dispatchEvent(new CustomEvent('themechanged', {
            detail: {
                theme: this.currentTheme
            }
        }))
    }

    get el() {
        return this.$el
    }
}