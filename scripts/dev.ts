import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import webpack from 'webpack';
import ProjectInfo from './_project.js';
import { ASSETS_DIR, OUT_DIR, ROOTD } from './_utils.js';
import CLI, { ParsedCLIArgs } from './_cli.js';


/** Allowed port numbers for the server (8780-8799) */
const PORTS: Array<number> = [];
for (let i: number = 8780; i < 8800; ++i) {
    PORTS.push(i);
}


/** Port the server is listening on */
let PORT: number = PORTS[0];


/** Validator for static asset paths, captures project ID and file path
 * @example "/static/project-id/path/to/file.ext"
 */
const ASSET_PATH_REGEX: RegExp = (
    /^\/static\/([a-z0-9]+(?:-[a-z0-9]+)*)\/((?:[-_a-z0-9]+\/)*[-_a-z0-9]+\.[a-z0-9]{2,5})$/
);


/** Validator for generated script paths, captures project ID
 * @example "/static/project-id.js"
 */
const SCRIPT_PATH_REGEX: RegExp = (
    /^\/static\/([a-z0-9]+(?:-[a-z0-9]+)*)\.js$/
);


/** Path to favicon.ico */
const FAVICON: string = path.join(ROOTD, 'favicon.ico');


/** Project this server serves, will be loaded during initialization */
let PROJECT: ProjectInfo | null = null;


/** Whether light theme is enabled */
let LIGHT_THEME: boolean = false;


/** MIME types for allowed static file extensions */
const MIME_TYPES: Record<string, string> = {
    '.bmp': 'image/bmp', '.css': 'text/css', '.csv': 'text/csv', '.gif': 'image/gif',
    '.html': 'text/html', '.ico': 'image/x-icon', '.jpg': 'image/jpeg',
    '.js': 'application/javascript', '.json': 'application/json', '.mjs': 'application/javascript',
    '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.ogg': 'audio/ogg', '.png': 'image/png',
    '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.txt': 'text/plain', '.wav': 'audio/wav',
    '.webm': 'video/webm', '.webp': 'image/webp', '.woff': 'font/woff', '.woff2': 'font/woff2',
    '.xml': 'text/xml'
};


/** Shown names of HTTP error codes */
const STATUS_CODE_NAMES: Record<string, string> = {
    '400': '400 Bad Request', '403': '403 Forbidden', '404': '404 Not Found',
    '500': '500 Internal Server Error'
};


/** Send a error response
 * @param res response
 * @param statusCode error code
 */
function serveError(res: http.ServerResponse, statusCode: number): void {
    res.statusCode = statusCode;
    let status: string = String(statusCode);
    if (statusCode in STATUS_CODE_NAMES) {
        status = STATUS_CODE_NAMES[status];
    }
    res.setHeader('Content-Type', 'text/html').end(/* language=html */ `
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>${status}</title>
    <link rel="icon" href="/favicon.ico">
    <style>
      html, body { background: ${LIGHT_THEME ? '#fff' : '#222'}; }
      p { text-align: center; }
    </style>
  </head>
  <body>
    <p><img src="https://http.cat/${statusCode}.jpg" alt="${status}"></p>
  </body>
</html>`);
}


/** Serve static files
 * @param res response
 * @param fullPath absolute file path
 */
function serveFile(res: http.ServerResponse, fullPath: string): void {
    if (!fs.existsSync(fullPath)) {
        serveError(res, 404);
        return;
    }
    const ext: string = path.extname(fullPath);
    if (!(ext in MIME_TYPES)) { // do not serve source files like Pug, Sass or TypeScript
        serveError(res, 404);
        return;
    } else if (ext === '.js' || ext === '.mjs') {
        res.setHeader('Cache-Control', 'no-cache');
    }
    fs.readFile(fullPath, (err: NodeJS.ErrnoException | null, data: Buffer): void => {
        if (err != null) {
            serveError(res, err.code === 'ENOENT' ? 404 : 500);
            return;
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', MIME_TYPES[ext]).end(data);
    });
}


/** Send the index page
 * @param res response
 * @param lightTheme whether to use light theme
 * @remarks Requires {@link PROJECT} to be non-null.
 */
function serveIndex(res: http.ServerResponse, lightTheme: boolean): void {
    res.statusCode = 200;
    // noinspection HtmlUnknownTarget
    res.setHeader('Content-Type', 'text/html').end(/* language=html */ `
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>${PROJECT!.name} (2d3's MiniApps test page)</title>
    <link rel="icon" href="/favicon.ico">
    <style>
      html, body {
          background: ${lightTheme ? '#fff' : '#222'};
          color: ${lightTheme ? '#000' : '#eee'};
          font-family: sans-serif;
      }
      h1 { font-size: 2rem; text-align: center; }
    </style>
  </head>
  <body>
    <h1>${PROJECT!.name}</h1>
    <script src="/static/${PROJECT!.id}.js"${lightTheme ? ' data-theme="light"' : ''}></script>
  </body>
</html>`);
}


/** Replacement for `import(node:url).parse` */
function getURL(req: http.IncomingMessage): URL {
    const proto: any = req.headers['x-forwarded-proto'] || 'https';
    const host: any = req.headers['x-forwarded-host'] || req.headers.host || `127.0.0.1:${PORT}`;
    return new URL(req.url || '/', `${proto}://${host}`);
}


/** Handle incoming HTTP request
 * @param req HTTP request
 * @param res response
 * @remarks Requires {@link PROJECT} to be non-null.
 */
function handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    const pathname: string = getURL(req).pathname;
    let match: RegExpExecArray | null;
    if (pathname === '/' || pathname === '/index.html') {
        serveIndex(res, LIGHT_THEME);
    } else if (pathname === '/dark') {
        serveIndex(res, false); // force dark theme
    } else if (pathname === '/light') {
        serveIndex(res, true); // force light theme
    } else if (pathname === '/favicon.ico') {
        serveFile(res, FAVICON);
    } else if ((match = ASSET_PATH_REGEX.exec(pathname)) != null) {
        if (match[1] === PROJECT!.id && PROJECT!.assets.has(match[2])) {
            serveFile(res, path.join(ASSETS_DIR, match[2]));
        } else {
            serveError(res, 403);
        }
    } else if ((match = SCRIPT_PATH_REGEX.exec(pathname)) != null) {
        if (match[1] === PROJECT!.id) {
            serveFile(res, path.join(OUT_DIR, `${match[1]}.js`));
        } else {
            serveError(res, 403);
        }
    } else {
        serveError(res, 404);
    }
}


/** Try to listen on the given port
 * @param port port number
 * @returns whether the server successfully started listening
 */
function tryListen(port: number): Promise<boolean> {
    return new Promise((resolve: (ret: boolean) => void): void => {
        const server: http.Server = http.createServer(handleRequest);
        server.on('error', (): void => resolve(false));
        server.listen(port, (): void => {
            console.log(`Server running at http://127.0.0.1:${port}/`);
            resolve(true);
        });
    });
}


/** CLI definition */
const cli: CLI = new CLI('dev');
cli.setTitle('test server');
cli.setDesc('Runs webpack in watch mode and serves the compiled files over HTTP');
cli.addOpt({ short: 'l', long: 'light', description: 'Use light theme' });
cli.addExample({ args: ['test'], description: 'Runs test server for apps/test' });

/** CLI arguments and options */
const args: ParsedCLIArgs = cli.parseArgs();
try {
    PROJECT = ProjectInfo.load(args.projectId);
} catch (e) {
    cli.printUsageAndExit(1, String(e));
}
LIGHT_THEME = args.opts.has('light');


function webpackCallback(error: Error | null, result?: webpack.Stats): void {
    if (error != null) {
        console.error(error.message);
        if (error.stack != null) {
            console.error(error.stack);
        }
        if ('details' in error && error.details != null) {
            console.error(error.details);
        }
        return;
    } else if (result == null) {
        console.error('Build failed');
        return;
    }
    console.log();
    console.log(result.toString({
        colors: true,
        errors: true,
        errorCause: 'auto',
        errorDetails: 'auto',
        errorErrors: 'auto',
        warnings: true,
    }));
}


webpack(PROJECT!.getWebpackConfig(false), webpackCallback);


/** Start the server on the first free port */
async function startServer(): Promise<void> {
    for (const port of PORTS) if (await tryListen(port)) {
        PORT = port;
        return;
    }
    console.error('No free port found');
    process.exit(1);
}

// noinspection JSIgnoredPromiseFromCall
startServer();
