import { setAssetUrlTemplate } from './assets';


/** Will be called for `data-*` attributes on the source script element with the attribute name and
 *  its value
 * @param key attribute name without the "data-" prefix
 * @param value attribute value (value may only be null if watch is true, in which case it
 *        signals the attribute being removed)
 */
type OnDataCallback = (key: string, value: string | null) => void;


/** Will be called when the source script element is directly removed */
type OnRemoveCallback = () => void;


interface MiniAppConfig {

    /** Container element tag name, defaults to "div" */
    element?: string;

    /** If true, "ma-game-" id prefix will be used instead of "ma-" */
    game?: boolean;

    /** If true, auto-apply "light-theme" class */
    themed?: boolean;

    /** If true, auto-apply setAssetUrlTemplate */
    assets?: boolean;

    /** If true, the container element will be removed when the source script element is removed */
    autoremove?: boolean;
}


export default class MiniApp {
    readonly id: string;
    readonly container: HTMLElement;
    private readonly onDataCallbacks: Array<[OnDataCallback, boolean]>;
    private readonly onRemoveCallbacks: Array<OnRemoveCallback>;
    private readonly script: HTMLScriptElement | SVGScriptElement | null;
    private inserted: boolean;
    private removeObserver: MutationObserver | null;

    constructor(id: string, config?: MiniAppConfig) {
        this.id = id;
        this.container = document.createElement(config?.element ?? 'div');
        this.container.id = config?.game ? `ma-game-${id}` : `ma-${id}`;
        this.script = document.currentScript;
        if (this.script == null) {
            console.warn(`miniapps[${this.id}]: Unable to locate script tag.`);
        }
        this.onDataCallbacks = [];
        if (config?.themed) {
            this.onDataCallbacks.push([
                (key: string, value: string | null): void => {
                    if (key === "theme") {
                        this.container.classList.toggle("light-theme", value === "light");
                    }
                },
                true
            ]);
        }
        if (config?.assets) {
            this.onDataCallbacks.push([
                (key: string, value: string | null): void => {
                    if (key === 'asset-prefix') {
                        setAssetUrlTemplate(value ?? "/");
                    }
                },
                false
            ]);
        }
        this.onRemoveCallbacks = [];
        this.removeObserver = null;
        if (config?.autoremove) {
            this.onRemove((): void => { this.container.remove(); });
        }
        this.inserted = false;
    }

    /** Add data attribute callback that will be called for `data-*` attributes on the source script
     *  element with the attribute name and its value
     * @param callback callback to call
     * @param watch if true, the callback will be called whenever the data attributes change, value
     *          will be null on attribute removal
     * @remarks Callbacks must be added before {@link insertIntoPage} is called
     * @returns this
     */
    onData(callback: OnDataCallback, watch: boolean = false): this {
        if (this.inserted) {
            return this;
        }
        this.onDataCallbacks.push([callback, watch]);
        return this;
    }

    /** Add callback that will be called when the source script element is directly removed
     * @param callback callback to call
     * @remarks Indirect removal (removing parent element) will not trigger this callback.
     * @returns this
     */
    onRemove(callback: OnRemoveCallback): this {
        if (this.script == null || this.script.parentElement == null) {
            return this; // nothing to watch for
        }
        if (this.removeObserver == null) {
            this.removeObserver = new MutationObserver((): void => {
                if (this.removeObserver == null || document.contains(this.script)) {
                    return;
                }
                for (const callback of this.onRemoveCallbacks) {
                    callback();
                }
                this.removeObserver!.disconnect();
                this.removeObserver = null;
            });
            this.removeObserver.observe(this.script.parentNode!, {
                childList: true,
                subtree: false
            });
        }
        this.onRemoveCallbacks.push(callback);
        return this;
    }

    private triggerOnData(key: string, value: string | null, watchingOnly: boolean): void {
        for (const [callback, watch] of this.onDataCallbacks) if (!watchingOnly || watch) {
            callback(key, value);
        }
    }

    /** Insert the application/game's element into the host page. If possible, the element will be
     *  placed before the script element running it.
     * @param html optional HTML content to insert into the container
     */
    insertIntoPage(html?: string): HTMLElement {
        if (html != null) {
            this.container.innerHTML = html;
        }
        if (this.inserted) {
            return this.container;
        }
        if (this.script == null) {
            document.body.appendChild(this.container);
        } else {
            this.script.before(this.container);
        }
        this.inserted = true;
        if (this.onDataCallbacks.length === 0 || this.script == null) {
            return this.container;
        }
        const attrs: NamedNodeMap = this.script.attributes;
        for (let i: number = 0; i < attrs.length; ++i) {
            const attr: Attr = attrs[i];
            if (attr.name.startsWith('data-')) {
                this.triggerOnData(attr.name.substring(5), attr.value, false);
            }
        }
        if (!this.onDataCallbacks.some((cb: [OnDataCallback, boolean]): boolean => cb[1])) {
            return this.container;
        }
        new MutationObserver((mutations: Array<MutationRecord>): void => {
            for (const mutation of mutations) {
                const name: string = mutation.attributeName!;
                if (name != null && name.startsWith('data-')) {
                    this.triggerOnData(name.substring(5), this.script!.getAttribute(name), true);
                }
            }
        }).observe(this.script, { attributes: true, attributeOldValue: false });
        return this.container;
    }
}
