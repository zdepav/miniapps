import MiniApp from "@common/MiniApp";
import { initialize } from '@/game';
import '@/style.sass';


const app: MiniApp = new MiniApp("smoker", {
    game: true,
    assets: true,
    autoremove: true
});
const canvas: HTMLCanvasElement = document.createElement('canvas');
canvas.width = 800;
canvas.height = 640;
app.insertIntoPage().appendChild(canvas);
initialize(app, canvas).catch(console.error);
