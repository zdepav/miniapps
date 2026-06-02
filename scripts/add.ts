import fs from 'node:fs';
import path from 'node:path';
import ProjectInfo from './_project.js';
import { ROOTD } from './_utils.js';
import CLI, { ParsedCLIArgs } from './_cli.js';


/** Template substitution regex */
const TEMPLATE_SUB_REGEX: RegExp = /\{\{([A-Z]+(?:_[A-Z0-9]+)*)}}/g;


/** CLI definition */
const cli: CLI = new CLI('add');
cli.setTitle('project generator');
cli.setDesc('Creates a new app project');
cli.addArg({ name: 'project_name', description: 'Human-readable name for the project' });
cli.addArg({
    name: 'author_name',
    description: 'Full name of project author, defaults to Zdeněk Pavlátka',
    optional: true
});
cli.addOpt({ short: 'g', long: 'game', description: 'Create a game project ranther than an app' });
cli.addExample({
    args: ['-g', 'test-game', '"Test game"'],
    description: 'Creates a game named "Test game" in apps/test-game'
});
cli.addExample({
    args: ['json-viewer', '"Json preview"'],
    description: 'Creates an application named "Json preview" in apps/json-viewer'
});


/** CLI arguments and options */
const args: ParsedCLIArgs = cli.parseArgs();
if (fs.existsSync(path.join(ROOTD, args.projectId))) {
    cli.printUsageAndExit(1, 'ERROR: Project with given ID already exists');
}


/** Project configuration */
const project: ProjectInfo = ProjectInfo.create(
    args.projectId,
    args.named.project_name!,
    args.opts.has('game'),
    args.named.author_name ?? "Zdeněk Pavlátka"
);


/** Project data for use in templates */
const META: Record<string, string> = project.getTemplateVars();


/** Substitute template pattern with project data
 * @param _ ignored
 * @param key data key/ID
 * @returns project data associated with the given key/ID
 * @throws {Error} if requested key/ID is not found
 */
function templateSubstitute(_: any, key: string): string {
    if (key in META) {
        return META[key];
    }
    throw new Error(`Missing template substitution value for ${key}`);
}


/** Recursively create project directory based on template
 * @param src template directory path
 * @param dst target directory path
 */
function applyTemplateDirectory(src: string, dst: string): void {
    fs.mkdirSync(dst, { recursive: true });
    for (const item of fs.readdirSync(src, { encoding: 'utf-8', withFileTypes: true })) {
        if (item.isFile()) {
            fs.writeFileSync(
                path.join(dst, item.name),
                fs.readFileSync(path.join(src, item.name), 'utf-8').replace(
                    TEMPLATE_SUB_REGEX,
                    templateSubstitute
                ),
                'utf-8'
            );
        } else if (item.isDirectory()) {
            applyTemplateDirectory(path.join(src, item.name), path.join(dst, item.name));
        }
    }
}


applyTemplateDirectory(
    path.join(ROOTD, 'template', project.isGame ? 'game' : 'app'),
    project.directory
);
fs.appendFileSync(
    path.join(ROOTD, 'README.md'), `
- **${META.PROJECT_NAME}** (\`${META.PROJECT_ID}\`)
  - ${META.PROJECT_TYPE}
`);
