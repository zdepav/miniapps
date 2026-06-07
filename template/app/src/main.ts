import MiniApp from "@ma/MiniApp";
import "@/style.sass";

const app: MiniApp = new MiniApp("{{PROJECT_ID}}", {
    themed: true,
    autoremove: true
});
app.insertIntoPage().innerText = '{{PROJECT_NAME}}';
