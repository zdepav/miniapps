/** Normalize audio volume to a number between 0 and 1
 * @param volume volume to normalize
 * @returns normalized volume
 */
function normalizeVolume(volume: number): number {
    return Number.isNaN(volume) || volume >= 1 ? 1 : volume <= 0 ? 0 : volume;
}


/** Minimum allowed playback rate */
export const MIN_PLAYBACK_RATE: number = 0.125;


/** Maximum allowed playback rate */
export const MAX_PLAYBACK_RATE: number = 8;


/** Normalize playback rate to a number between {@link MIN_PLAYBACK_RATE} and
 * {@link MAX_PLAYBACK_RATE}
 * @param rate playback rate to normalize
 * @returns normalized value
 */
function normalizePlaybackRate(rate: number): number {
    if (Number.isNaN(rate)) {
        return 1;
    } else if (rate <= MIN_PLAYBACK_RATE) {
        return MIN_PLAYBACK_RATE;
    } else if (rate >= MAX_PLAYBACK_RATE) {
        return MAX_PLAYBACK_RATE;
    } else {
        return rate;
    }
}


/** Simple audio mixer based on Web Audio API */
export class SoundMixer {

    /** Audio context */
    private readonly ctx: AudioContext;

    /** Global volume */
    private readonly gainNode: GainNode;

    private constructor() {
        this.ctx = new AudioContext();
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.value = 1;
        this.gainNode.connect(this.ctx.destination);
    }

    /** Decode audio data
     * @param buffer buffer to decode
     * @returns decoded audio data
     */
    decode(buffer: ArrayBuffer): Promise<AudioBuffer> {
        return this.ctx.decodeAudioData(buffer);
    }

    /** Set global sound effect volume
     * @param volume global sound volume, between 0 and 1
     */
    setGlobalVolume(volume: number): void {
        this.gainNode.gain.value = normalizeVolume(volume);
    }

    /** Play audio
     * @param buffer audio data to play
     * @param volume sound volume, between 0 and 1
     * @param playbackRate playback rate, between `MIN_PLAYBACK_RATE` and `MAX_PLAYBACK_RATE`
     */
    play(buffer: AudioBuffer, volume: number, playbackRate: number): void {
        volume = normalizeVolume(volume);
        if (volume === 0) {
            return;
        }
        playbackRate = normalizePlaybackRate(playbackRate);
        const source: AudioBufferSourceNode = this.ctx.createBufferSource();
        source.buffer = buffer;
        if (playbackRate !== 1) {
            source.playbackRate.value = playbackRate;
        }
        if (volume !== 1) {
            const gainNode: GainNode = this.ctx.createGain();
            gainNode.gain.value = volume;
            source.connect(gainNode);
            gainNode.connect(this.gainNode);
        } else {
            source.connect(this.gainNode);
        }
        source.start();
    }

    private static INSTANCE: SoundMixer | null = null;

    /** Get singleton instance of the sound mixer */
    static get(): SoundMixer {
        if (SoundMixer.INSTANCE == null) {
            SoundMixer.INSTANCE = new SoundMixer();
        }
        return SoundMixer.INSTANCE;
    }
}
