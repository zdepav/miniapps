const CODES: Record<string, string> = {

    py: /* language=html */ `<span class="kw">from</span> datetime<span class="kw"> import</span><span class="cls"> datetime</span>,<span class="cls"> timezone</span>
      
now:<span class="cls"> datetime</span> =<span class="cls"> datetime</span>.now(<span class="cls">timezone</span>.utc).astimezone()
format:<span class="cls"> str</span> =&nbsp;<span class="str format"></span>
print(now.strftime(format))</code></pre>`,

    shP: /* language=html */ `<span class="kw">date</span> +<span class="str format"></span>`,

    shG: /* language=html */ `<span class="kw">date</span> +<span class="str format"></span>`,

    cs: /* language=html */ `<span class="kw">using</span> System;
<span class="kw">using</span> System.Globalization;

<span class="kw">class</span><span class="cls"> Program</span> {

<span class="kw">    static void</span> Main() {
<span class="kw">        var</span> now =<span class="cls"> DateTime</span>.Now;
<span class="kw">        var</span> format =&nbsp;<span class="str format"></span>;
<span class="cls">        Console</span>.WriteLine(now.ToString(format));
    }
}`,

    j7: /* language=html */ `<span class="kw">import</span> java.text.<span class="cls">SimpleDateFormat</span>;
<span class="kw">import</span> java.util.<span class="cls">Date</span>;

<span class="kw">public class</span><span class="cls"> Program</span> {

<span class="kw">    public static void</span> main(<span class="cls">String</span>[] args) {
<span class="cls">        Date</span> now = new<span class="cls"> Date</span>();
<span class="cls">        String</span> format =&nbsp;<span class="str format"></span>;
<span class="cls">        System</span>.out.println(new<span class="cls"> SimpleDateFormat</span>(format).format(now));
    }
}`,

    j8: /* language=html */ `<span class="kw">import</span> java.time.<span class="cls">OffsetDateTime</span>;
<span class="kw">import</span> java.time.format.<span class="cls">DateTimeFormatter</span>;

<span class="kw">public class</span><span class="cls"> Program</span> {

<span class="kw">    public static void</span> main(<span class="cls">String</span>[] args) {
<span class="cls">        OffsetDateTime</span> now = new<span class="cls"> OffsetDateTime</span>.now();
<span class="cls">        String</span> format =&nbsp;<span class="str format"></span>;
<span class="cls">        System</span>.out.println(now.format(<span class="cls">DateTimeFormatter</span>.ofPattern(format)));
    }
}`,

    jsL: /* language=html */ `<span class="kw">const</span> { DateTime } = require(<span class="str">"luxon"</span>);  

<span class="kw">const</span> now =<span class="cls"> DateTime</span>.now();
<span class="kw">const</span> format =&nbsp;<span class="str format"></span>;
console.log(now.toFormat(format));`

};


/** Insert samples into parrent and return list of format string placements */
export function buildCodeSamples(parent: HTMLElement): Array<[string, HTMLElement, HTMLElement]> {
    const container: HTMLElement = document.createElement("div");
    container.id = "ma-datetime-codes";
    container.className = "expand";
    const title: HTMLElement = document.createElement("div");
    title.className = "label";
    title.innerText = "Code example";
    const formatStrs: Array<[string, HTMLElement, HTMLElement]> = [];
    for (const [lang, code] of Object.entries(CODES)) {
        const codeBlock: HTMLElement = document.createElement("div");
        codeBlock.className = "code-block";
        const pre: HTMLElement = document.createElement("pre");
        const codeElement: HTMLElement = document.createElement("code");
        codeElement.innerHTML = code;
        pre.appendChild(codeElement);
        codeBlock.appendChild(pre);
        container.appendChild(codeBlock);
        formatStrs.push([lang, codeBlock.querySelector(".format")!, codeBlock]);
    }
    parent.appendChild(container);
    return formatStrs;
}
