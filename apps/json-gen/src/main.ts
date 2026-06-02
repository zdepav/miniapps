import hljs from 'highlight.js/lib/core';
import hljsJson from 'highlight.js/lib/languages/json';
import MiniApp from "@common/MiniApp";
import { rValue, Config } from '@/gen';
import '@/style.sass';

const container: HTMLElement = new MiniApp("json-gen", {
    element: "section",
    themed: true,
    autoremove: true
}).insertIntoPage(// language=html
`<header>
  <h1>Random JSON generator</h1>
  <label><span>Size:&nbsp;</span><input id="size" type="number" min="1" max="8" value="5"></label>
  <label><span>Allow decimal numbers:&nbsp;</span><input id="float" type="checkbox" checked></label>
  <button>Generate</button>
</header>
<pre><code class="hljs"></code></pre>`
);
const codeContainer: HTMLElement = container.querySelector('code')!;


function generate(): void {
    codeContainer.innerHTML = hljs.highlight(rValue(), { language: 'json' }).value;
}


hljs.registerLanguage('json', hljsJson);
container.querySelector('button')!.addEventListener('click', generate);
container.querySelector('#size')!.addEventListener('change', (event: Event): void => {
    const input: HTMLInputElement = <HTMLInputElement>event.target;
    const val: number = parseInt(input.value);
    if (Number.isInteger(val) && val > 0 && val <= 8) {
        input.setCustomValidity('');
        input.value = String(val);
        Config.RECURSION_LIMIT = val;
        Config.LENGTH_LIMIT = val * 2;
    } else {
        input.setCustomValidity('Invalid');
    }
});
container.querySelector('#float')!.addEventListener('change', (event: Event): void => {
    Config.ALLOW_DECIMALS = (<HTMLInputElement>event.target).checked;
});
codeContainer.parentElement!.addEventListener('dblclick', (): void => {
    const selection: Selection | null = window.getSelection();
    if (selection) {
        selection.removeAllRanges();
        const range: Range = document.createRange();
        range.selectNodeContents(codeContainer);
        selection.addRange(range);
    }
});
