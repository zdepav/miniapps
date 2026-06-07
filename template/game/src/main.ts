import MiniApp from "@ma/MiniApp";
import "@/style.sass";

const app: MiniApp = new MiniApp("{{PROJECT_ID}}", {
    assets: true,
    autoremove: true,
    game: true
});
app.insertIntoPage().innerText = '{{PROJECT_NAME}}';
