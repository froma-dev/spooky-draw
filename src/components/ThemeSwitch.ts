type Theme = 'dark' | 'light'
const defaultTheme: Theme = 'dark'

export default class ThemeSwitch {
    htmlLiteral: string
    root: HTMLElement | null
    currentTheme: Theme

    constructor() {
        this.htmlLiteral = `
            <button class="theme-button">
                <span class="theme-button-content">
                <span class="theme-button-content__icon--dark"></span></span>
                <span class="theme-button-content__text">Theme</span>
            </button>
        `
        this.currentTheme = defaultTheme
        this.root = document.querySelector<HTMLElement>('html')
    }

    onClick () {
        if (this.root?.classList.contains('')) {}
    }

    get html () {
        return this.htmlLiteral
    }
}