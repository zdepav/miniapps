import MiniApp from "@common/MiniApp";
import { commands } from "@/commands";
import { sgr } from "@/sgr";
import { palette } from "@/palette";
import Switcher from "@/Switcher";
import { classed, heading } from "@/html";
import "@/main.sass"


const container: HTMLElement = new MiniApp("ansi", {
    element: "section",
    themed: true,
    autoremove: true
}).insertIntoPage();

// build UI
const langSwitcher: Switcher = new Switcher("lang");
langSwitcher.option("c", "C");
langSwitcher.option("sh", "Shell");
langSwitcher.option("py", "Python");
langSwitcher.build(container);
commands(container);
heading(container, 3, "Display attribute Codes");
sgr(classed(classed(container, "columns"), "table"));
heading(container, 3, "256 Color Palette");
const termSwitcher: Switcher = new Switcher("term");
termSwitcher.option("vscode", "VS Code");
termSwitcher.option("terminal", "Windows Terminal");
termSwitcher.option("win", "Windows CMD");
termSwitcher.option("powershell", "Powershell");
termSwitcher.option("putty", "PuTTY");
termSwitcher.option("jetbrains-fg", "JetBrains (foreground)");
termSwitcher.option("jetbrains-bg", "JetBrains (background)");
termSwitcher.option("terminator", "Terminator");
termSwitcher.option("konsole", "Konsole");
termSwitcher.option("xterm", "xterm");
termSwitcher.build(container);
palette(classed(container, "palette"));

// hide unselected elements
langSwitcher.init();
termSwitcher.init();
