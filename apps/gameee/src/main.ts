import MiniApp from "@common/MiniApp";
import { loadMusicAsset } from "@common/assets";
import Game from "@/Game";
import Point from '@/Point';
import '@/style.sass';


const app: MiniApp = new MiniApp("gameee", {
    game: true,
    assets: true,
    autoremove: true
});
const introScreen: HTMLElement = document.createElement('div');
introScreen.innerText = "Click to load the game";
app.insertIntoPage().appendChild(introScreen);


function initInput(game: Game, element: HTMLElement): void {
    element.setAttribute('tabindex', '0');
    element.focus();
    element.addEventListener('keydown', (e: KeyboardEvent): void => {
        game.PressKey(e.key.toUpperCase());
    });
    element.addEventListener('keyup', (e: KeyboardEvent): void => {
        game.ReleaseKey(e.key.toUpperCase());
    });
    element.addEventListener('mousedown', (e: MouseEvent): void => {
        game.PressMouseButton(e.button);
    });
    element.addEventListener('mouseup', (e: MouseEvent): void => {
        game.ReleaseMouseButton(e.button);
    });
    element.addEventListener('mousemove', (e: MouseEvent): void => {
        const rect: DOMRect = element.getBoundingClientRect();
        game.MoveMouse(new Point(e.clientX - rect.left, e.clientY - rect.top));
    });
}


async function startGame(): Promise<void> {
    introScreen.remove();
    const music: HTMLAudioElement = await loadMusicAsset(
        'gameee/music/teknoaxe/threshold-of-insanity.mp3'
    );
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;
    app.container.appendChild(canvas);
    const game: Game = new Game(800, 400, music);
    initInput(game, canvas);
    let prevTime: number = performance.now();
    let terminated: boolean = false;
    app.onRemove((): void => { terminated = true; });

    function update(): void {
        if (terminated) {
            return;
        }
        requestAnimationFrame(update);
        const ntime: number = performance.now();
        game.Step(Math.min(ntime - prevTime, 200));
        prevTime = ntime;
        game.Draw(ctx);
    }

    update();
}


introScreen.addEventListener("click", startGame);
