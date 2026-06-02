import MiniApp from "@common/MiniApp";
import { buildCheatsheet } from '@/cheatsheet';
import { buildPlayground } from '@/playground';
import '@/main.sass';


const container: HTMLElement = new MiniApp("datetime", {
    themed: true,
    autoremove: true
}).insertIntoPage();
buildCheatsheet(container);
buildPlayground(container);
