import fs from 'node:fs';
import path from 'node:path';
import webpack from 'webpack';
import CLI, { ParsedCLIArgs } from './_cli.js';
import ProjectInfo from './_project.js';
import { ASSETS_DIR, DIST_DIR } from './_utils.js';


function webpackCallback(error: Error | null, result?: webpack.Stats): void {
    if (error != null) {
        throw error;
    } else if (result == null) {
        throw new Error('Build failed');
    }
    console.log(result.toString({
        colors: true,
        errors: true,
        errorCause: 'auto',
        errorDetails: 'auto',
        errorErrors: 'auto',
        warnings: true,
    }));
    if (result.hasErrors()) {
        process.exit(2);
    }
}


function copyAssets(project: ProjectInfo, src: string, dst: string, prefix: string): void {
    for (const item of fs.readdirSync(src)) {
        const srcItem: string = path.join(src, item);
        const dstItem: string = path.join(dst, item);
        const newPrefix: string = prefix.length == 0 ? item : `${prefix}/${item}`;
        const srcStat: fs.Stats = fs.statSync(srcItem);
        if (srcStat.isDirectory()) {
            copyAssets(project, srcItem, dstItem, newPrefix);
        } else if (srcStat.isFile() && project.assets.has(newPrefix)) {
            fs.mkdirSync(dst, { recursive: true }); // only create necessary directories
            fs.copyFileSync(srcItem, dstItem);
        }
    }
}


function buildProject(project: ProjectInfo): void {
    webpack(project.getWebpackConfig(true), webpackCallback);
    if (project.assets.size > 0) {
        const distPath: string = path.join(DIST_DIR, project.id);
        copyAssets(project, ASSETS_DIR, distPath, '');
    }
}


/** CLI definition */
const cli: CLI = new CLI('build', 'optional');
cli.setTitle('release build script');
cli.setDesc('Copies assets to the output directory and generates a production build');
cli.addExample({ args: ['test-project'] });

/** CLI arguments and options */
const args: ParsedCLIArgs = cli.parseArgs();
if (args.projectId.length > 0) {
    buildProject(ProjectInfo.load(args.projectId));
} else for (const project of ProjectInfo.loadAll()) {
    buildProject(project);
}
