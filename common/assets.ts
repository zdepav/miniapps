import { SoundMixer } from './audio';

/** Template for asset urls, URL is constructed as
 * `ASSET_URL_TEMPLATE[0] + assetPath + ASSET_URL_TEMPLATE[1]`
 */
let ASSET_URL_TEMPLATE: [string, string] = ['/static/', ''];

/** Set template for asset urls, URL is constructed as `prefix + assetPath + suffix`
 * @param prefix URL prefix, e.g. `"/assets/"` or `"https://example.com/assets/"`
 * @param suffix URL suffix, e.g. `"?v=1.0.0"` or `""`
 * @example setAssetUrlTemplate('https://example.com/assets/', '?v=1.0.0');
 */
export function setAssetUrlTemplate(prefix: string, suffix: string = ""): void {
    ASSET_URL_TEMPLATE = [prefix, suffix];
}

/** Get asset url for the given path using template set by {@link setAssetUrlTemplate}
 * @param path asset path, relative to the project's assets directory
 * @returns asset url
 * @example getAssetUrl('img/logo.png');
 * @remarks If {@link setAssetUrlTemplate} was not called, `"/static/" + path` will be returned.
 */
export function getAssetUrl(path: string): string {
    return ASSET_URL_TEMPLATE[0] + path + ASSET_URL_TEMPLATE[1];
}

/** Asynchronously load image asset
 * @param asset asset path, relative to the project's assets directory
 * @returns promise resolving to the loaded image element
 */
export function loadImageAsset(asset: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img: HTMLImageElement = new Image();
        img.onload = () => {
            img.onload = null;
            resolve(img);
        }
        img.onerror = reject;
        img.src = getAssetUrl(asset);
    });
}

/** Asynchronously load audio asset using DOM element
 * @param asset asset path, relative to the project's assets directory
 * @param canPlayThrough if true, waits for canplaythrough event instead of canplay
 * @returns promise resolving to the audio element
 */
export function loadMusicAsset(
    asset: string,
    canPlayThrough: boolean = false
): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
        const audio: HTMLAudioElement = new Audio();
        if (canPlayThrough) {
            audio.oncanplaythrough = () => {
                audio.oncanplaythrough = null;
                resolve(audio);
            };
        } else {
            audio.oncanplay = () => {
                audio.oncanplay = null;
                resolve(audio);
            };
        }
        audio.onerror = reject;
        audio.src = getAssetUrl(asset);
    });
}

/** Asynchronously load audio asset using Web Audio API
 * @param asset asset path, relative to the project's assets directory
 * @returns promise resolving to the loaded audio buffer
 * @see {@link SoundMixer}
 */
export async function loadSoundAsset(asset: string): Promise<AudioBuffer> {
    const res: Response = await fetch(getAssetUrl(asset));
    if (!res.ok) {
        throw new Error(`Failed to load "${asset}" (${res.statusText})`);
    }
    return await SoundMixer.get().decode(await res.arrayBuffer());
}