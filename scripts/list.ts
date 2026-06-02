import CLI, { ParsedCLIArgs } from './_cli.js';
import ProjectInfo from './_project.js';
import { formatDate, getTerminalColors, TerminalColors } from './_utils.js';


/** CLI definition */
const cli: CLI = new CLI('list', false);
cli.setTitle('project listing');
cli.setDesc('Lists all projects');
cli.addOpt({ short: 'c', long: 'color', description: 'Enable colored output' });
cli.addOpt({ short: 'C', long: 'no-color', description: 'Disable colored output' });
cli.addOpt({ short: 'v', long: 'verbose', description: 'Print more information' });
cli.addOpt({ short: 'b', long: 'brief', description: 'Print only IDs' });

/** CLI arguments and options */
const args: ParsedCLIArgs = cli.parseArgs();

/** How detailed should output be */
const verbosity: number = (args.opts.has('verbose') ? 1 : 0) + (args.opts.has('brief') ? 0 : 1);


if (verbosity <= 0) { // brief output
    const ids: Array<string> = ProjectInfo.loadAll().map((proj: ProjectInfo): string => proj.id);
    ids.sort();
    for (const id of ids) {
        console.log(id);
    }
    process.exit(0);
}


/** Terminal colors */
const TC: TerminalColors = getTerminalColors(args.opts.has('color'), args.opts.has('no-color'));

/** Apps by ID */
const apps: Record<string, ProjectInfo> = {};

/** Games by ID */
const games: Record<string, ProjectInfo> = {};

for (const proj of ProjectInfo.loadAll()) {
    (proj.isGame ? games : apps)[proj.id] = proj;
}

const categories: Array<[string, Array<string>, Record<string, ProjectInfo>]> = [];


function tryAddCategory(name: string, category: Record<string, ProjectInfo>): void {
    const ids: Array<string> = Object.keys(category);
    if (ids.length == 0) {
        return;
    }
    categories.push([name, ids, category]);
}


tryAddCategory('Apps', apps);
tryAddCategory('Games', games);


function countAssetTypes(project: ProjectInfo): Array<string> {
    const counts: Record<string, number> = {};
    let unknown: number = 0;
    for (const asset of project.assets.values()) {
        const slashIndex: number = asset.lastIndexOf('/');
        const dotIndex: number = asset.lastIndexOf('.');
        if (dotIndex >= 0 && dotIndex > slashIndex) {
            const ext: string = asset.substring(dotIndex + 1).toUpperCase();
            counts[ext] = (counts[ext] ?? 0) + 1;
        } else {
            ++unknown;
        }
    }
    const ret: Array<string> = Object.entries(counts).sort(
        (a: [string, number], b: [string, number]): number => a[0].localeCompare(b[0], 'en')
    ).map((counter: [string, number]): string => `${counter[1]}x ${TC.G}${counter[0]}${TC.x}`);
    if (unknown > 0) {
        ret.push(`${unknown}x ${TC.R}unknown${TC.x}`);
    }
    return ret;
}


function listProjectBrief(project: ProjectInfo): void {
    console.log(`  ${TC.Y}${project.id}:${TC.x} ${project.name}`);
}


function listProjectFull(project: ProjectInfo): void {
    console.log(`  ${TC.Y}${project.id}:${TC.x}`);
    console.log(`    ${TC.B}name:${TC.x} ${project.name}`);
    console.log(`    ${TC.B}created:${TC.x} ${formatDate(project.created)}`);
    if (project.authors.length > 1) {
        console.log(`    ${TC.B}authors:${TC.x}`);
        for (const author of project.authors) {
            console.log(`      ${TC.B}-${TC.x} ${author}`);
        }
    } else {
        console.log(`    ${TC.B}author:${TC.x} ${project.authors[0]}`);
    }
    if (project.assets.size > 0) {
        const assetCounts: Array<string> = countAssetTypes(project);
        if (assetCounts.length > 1) {
            console.log(`    ${TC.B}assets:${TC.x}`);
            for (const asset of assetCounts) {
                console.log(`      ${TC.B}-${TC.x} ${asset}`);
            }
        } else if (project.assets.size == 1) {
            console.log(`    ${TC.B}asset:${TC.x} ${assetCounts[0]}`);
        } else {
            console.log(`    ${TC.B}assets:${TC.x} ${assetCounts[0]}`);
        }
    }
}


console.log();
for (const [name, ids, projects] of categories) {
    console.log(`${TC.C}${name}:${TC.x}`);
    for (const id of ids.sort()) {
        if (verbosity > 1) {
            listProjectFull(projects[id]);
            console.log();
        } else {
            listProjectBrief(projects[id]);
        }
    }
    if (verbosity < 2) {
        console.log();
    }
}
