import "@styles/Layers.css"
import {PlusIcon} from "@icons/Icon.ts";

export class Layers {
    $el: HTMLElement
    constructor() {
        this.$el = document.createElement('div')
        this.$el.classList.add('layers')

        this.$el.innerHTML = `
            <div class="layer --add">
                    <label for="image_uploads">
                        <span class="__icon">${PlusIcon}</span>
                        <span class="text">Choose image</span>
                    </label>
                    <input
                      type="file"
                      id="image_uploads"
                      name="image_uploads"
                      accept=".jpg, .jpeg, .png"
                      />
<!--                </span>-->
            </div><div class="layer --add">
                <span class="__icon">${PlusIcon}</span>
                <span class="text">Add Canvas</span>
            </div>
        `
    }

    get el() {
        return this.$el
    }
}