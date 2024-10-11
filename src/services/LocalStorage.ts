class LocalStorage {
    private static storage: LocalStorage

    private constructor() {}

    static get instance(): LocalStorage {
        if (!LocalStorage.storage) {
            LocalStorage.storage = new LocalStorage()
        }

        return LocalStorage.storage
    }

    getItem<T>(key: string): T | null {
        const value = localStorage.getItem(key)

        return value ? JSON.parse(value) as T : null
    }
    setItem<T>(key: string, value: T) {
        localStorage.setItem(key, JSON.stringify(value));
    }
    remove(key: string): any {
        localStorage.removeItem(key);
    }
    clear(): any {
        localStorage.clear();
    }
}

let storage = LocalStorage.instance

export {storage}

