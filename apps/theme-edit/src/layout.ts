import MiniApp from "@common/MiniApp";


export interface Layout {
    readonly container: HTMLElement;
    readonly stylesheet: HTMLElement;
    readonly stylesheetSelect: HTMLElement;
    readonly inputColorBack: HTMLInputElement;
    readonly inputColorText: HTMLInputElement;
    readonly inputColorBase: HTMLInputElement;
    readonly inputHueError: HTMLInputElement;
    readonly inputHueWarning: HTMLInputElement;
    readonly InputHueOk: HTMLInputElement;
    readonly inputLang: HTMLSelectElement;
    readonly buttonInvert: HTMLButtonElement;
}


const CONTAINER: HTMLElement = new MiniApp("theme-edit", {
    autoremove: true
}).insertIntoPage(// language=html
`<div class="column">
  <div class="inputs">
    <label data-label="Background"><input type="text" id="col-bg"></label>
    <label data-label="Text"><input type="text" id="col-fg"></label>
    <label data-label="Accent"><input type="text" id="col-a"></label>
    <label data-label="&nbsp;"><button id="invert">Invert</button></label>
  </div>
  <div class="inputs">
    <label data-label="Error hue"><input type="text" class="number" id="hue-err"></label>
    <label data-label="Warning hue"><input type="text" class="number" id="hue-warn"></label>
    <label data-label="OK hue"><input type="text" class="number" id="hue-ok"></label>
    <label data-label="Stylesheet">
      <select id="output-lang">
        <option value="css">CSS</option>
        <option value="scss">SCSS</option>
        <option value="sass">Sass</option>
      </select>
    </label>
  </div>
  <div data-label="Example">
    <section id="ma-theme-edit-example">
      <h1>Lorem Ipsum</h1>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sit amet rhoncus nisi. Quisque
        sollicitudin congue molestie. Donec dignissim commodo iaculis.
        <a title="Null pointer?">Nullam</a> congue enim arcu, at pulvinar ex hendrerit et. Nullam in
        diam placerat, posuere urna id, dictum ex. Phasellus vestibulum ante ac iaculis viverra.
        Aliquam erat volutpat. Sed ac <a title="Mauritius?">mauris</a> vitae dui hendrerit
        pretium.</p>
      <blockquote>Donec dapibus eros ut sagittis egestas. Donec ut iaculis nisi. Duis quis rutrum
        metus. Morbi mattis turpis massa, viverra viverra enim ornare a. Aenean et consequat metus,
        vel tincidunt urna. Sed at finibus nunc, a consectetur metus. Etiam egestas ante vel varius
        dignissim.</blockquote>
      <p>Duis vitae mi at lacus ultricies posuere. Sed cursus felis orci, eget mollis nunc blandit
        rhoncus. Nunc vulputate augue neque, nec consectetur neque malesuada sed. Etiam cursus
        ligula luctus, maximus metus lacinia, ornare sapien. Sed purus justo, mattis ut mauris eu,
        sollicitudin pretium lectus. Nullam nulla nisi, maximus ac risus ac, scelerisque auctor
        ligula. Nam nec lobortis nibh, non auctor odio.</p>
      <div class="flow">
        <div class="tag ok">Success</div>
        <div class="tag warn">Warning</div>
        <div class="tag err">Error</div>
      </div>
      <p>Sed hendrerit ex accumsan elit faucibus aliquet. Mauris placerat ante et tincidunt aliquet.
        Donec ut imperdiet sem. Integer nec venenatis turpis, vel pulvinar tortor. Proin finibus
        lobortis venenatis. In hac habitasse platea dictumst. Phasellus eget turpis ac arcu
        vulputate <a title="Curse?">cursus</a> id iaculis mauris. Sed ante ipsum, tincidunt a lorem
        vel, volutpat hendrerit elit. Maecenas eu hendrerit <a title="Libero?">libero</a>.</p>
      <div class="flow">
        <button>Press Me!</button>
      </div>
    </section>
  </div>
</div>
<div class="column">
  <div data-label="Stylesheet">
    <section id="stylesheet-container">
      <div id="stylesheet-select" class="icon-btn" title="Select">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path fill="currentColor" d="M0,12l8-8,2,2-6,6,6,6-2,2zM24,12l-8,8-2-2,6-6l-6-6l2-2z"/>
        </svg>
      </div>
      <pre><code id="stylesheet"></code></pre>
    </section>
  </div>
</div>`
);

const LAYOUT: Layout = {
    container: CONTAINER,
    stylesheet: <HTMLElement>CONTAINER.querySelector('#stylesheet'),
    stylesheetSelect: <HTMLElement>CONTAINER.querySelector('#stylesheet-select'),
    inputColorBack: <HTMLInputElement>CONTAINER.querySelector('#col-bg'),
    inputColorText: <HTMLInputElement>CONTAINER.querySelector('#col-fg'),
    inputColorBase: <HTMLInputElement>CONTAINER.querySelector('#col-a'),
    inputHueError: <HTMLInputElement>CONTAINER.querySelector('#hue-err'),
    inputHueWarning: <HTMLInputElement>CONTAINER.querySelector('#hue-warn'),
    InputHueOk: <HTMLInputElement>CONTAINER.querySelector('#hue-ok'),
    inputLang: <HTMLSelectElement>CONTAINER.querySelector('#output-lang'),
    buttonInvert: <HTMLButtonElement>CONTAINER.querySelector('#invert')
};
for (const input of [LAYOUT.inputColorBase, LAYOUT.inputColorBack, LAYOUT.inputColorText]) {
    input.title = 'Supported formats:\n"#RGB", "#RRGGBB", "rgb(R, G, B)"'
}
for (const input of [LAYOUT.inputHueError, LAYOUT.inputHueWarning, LAYOUT.InputHueOk]) {
    input.title = 'Hue value between 0 and 360 (integer only)'
}
CONTAINER.querySelectorAll('#ma-theme-edit-example a').forEach((a: Element): void => {
    (<HTMLAnchorElement>a).target = '_blank';
    (<HTMLAnchorElement>a).href = 'https://lipsum.com';
});

export default LAYOUT;
