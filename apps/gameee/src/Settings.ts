export default class Settings {
    private highscore: number;
    private playMusic: boolean;

    get Highscore(): number { return this.highscore; }

    set Highscore(value: number) {
        this.highscore = value;
        localStorage.setItem('miniapps.Gameee.highscore', value.toString());
    }

    get PlayMusic(): boolean { return this.playMusic; }

    set PlayMusic(value: boolean) {
        this.playMusic = value;
        localStorage.setItem('miniapps.Gameee.playMusic', value ? "true" : "false");
    }

    constructor() {
        const highscore: string | null = localStorage.getItem('ma.Gameee.highscore');
        this.highscore = highscore == null ? 0 : parseInt(highscore);
        this.playMusic = localStorage.getItem('ma.Gameee.playMusic') !== 'false';
    }
}
