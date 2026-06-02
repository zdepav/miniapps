import fs from 'node:fs';
import path from 'node:path';
import webpack from 'webpack';
import { PROJECT_ID_REGEX } from './_cli.js';
import { ROOTD, APPS_DIR, DIST_DIR, wordWrapIter, OUT_DIR } from './_utils.js';


/** License texts with template placeholders (currently "{{YEAR}}" and "{{NAME}}") */
class LicenseTemplates {

    /** 3-Clause BSD License */
    static readonly BSD_3_CLAUSE: string = [
        'BSD 3-Clause License',
        'Copyright {{YEAR}}, {{NAME}}',
        'Redistribution and use in source and binary forms, with or without modification, are'
        + ' permitted provided that the following conditions are met:',
        '1. Redistributions of source code must retain the above copyright notice, this list of'
        + ' conditions and the following disclaimer.',
        '2. Redistributions in binary form must reproduce the above copyright notice, this list of'
        + ' conditions and the following disclaimer in the documentation and/or other materials'
        + ' provided with the distribution.',
        '3. Neither the name of the copyright holder nor the names of its contributors may be used'
        + ' to endorse or promote products derived from this software without specific prior'
        + ' written permission.',
        'THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY'
        + ' EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF'
        + ' MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL'
        + ' THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,'
        + ' SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,'
        + ' PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS'
        + ' INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,'
        + ' STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF'
        + ' THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.'
    ].join('\n\n');
}


/** Get license text
 * @param authors list of authors
 * @param padding number of blank lines to add before and after the license text
 * @param year copyright start year (when project was created), only needed if it's not the current
 *     year
 * @param lineWidth maximum line length, defaults to 100 characters
 * @returns license text
 */
export function formatLicense(
    authors: ReadonlyArray<string>,
    padding: number = 0,
    year?: number | null,
    lineWidth: number = 100
): string {
    const pad: string | null = padding == 1 ? '' : padding > 1 ? '\n'.repeat(padding - 1) : null;
    const currentYear: number = new Date().getFullYear();
    let yearRange: string = String(currentYear);
    if (year != null && year < currentYear) {
        yearRange = `${year} - ${yearRange}`;
    }
    const lines: Array<string> = pad == null ? [] : [pad];
    for (const line of wordWrapIter(
        LicenseTemplates.BSD_3_CLAUSE
            .replace('{{YEAR}}', yearRange)
            .replace('{{NAME}}', authors.join(", ")),
        '',
        lineWidth
    )) {
        lines.push(line);
    }
    if (pad != null) {
        lines.push(pad);
    }
    return lines.join('\n');
}


/** MiniApp project configuration, see app.schema.json file for config format */
export default class ProjectInfo {

    /** Project ID */
    readonly id: string;

    /** List of project authors */
    readonly authors: ReadonlyArray<string>;

    /** Project (display) name */
    readonly name: string;

    /** Project source directory */
    readonly directory: string;

    /** Project creation date */
    readonly created: Date;

    /** Whether the project is a game (true) or an app (false) */
    readonly isGame: boolean;

    /** Paths to all included static assets */
    readonly assets: Set<string>;

    private constructor(
        id: string,
        name: string,
        directory: string,
        authors: ReadonlyArray<string>,
        created: Date,
        game: boolean
    ) {
        this.id = id;
        this.name = name;
        this.directory = directory;
        this.authors = authors;
        this.created = created;
        this.isGame = game;
        this.assets = new Set();
    }

    /** Get webpack configuration for the project
     * @param release if true, the configuration is optimized for production build
     * @returns webpack configuration object
     * @remarks Watching is enabled if {@link release} is false.
     */
    getWebpackConfig(release: boolean): webpack.Configuration {
        const src: string = path.join(this.directory, 'src');
        const cfg: webpack.Configuration = {
            entry: { main: path.join(src, 'main.ts') },
            output: {
                path: release ? DIST_DIR : OUT_DIR,
                filename: `${this.id}${release ? '.min' : ''}.js`
            },
            resolve: {
                extensions: ['.ts'],
                alias: {
                    '@': src,
                    '@common': path.join(ROOTD, 'common')
                }
            },
            module: {
                rules: [
                    {
                        test: /\.ts$/,
                        loader: 'ts-loader',
                        options: { configFile: path.join(this.directory, 'tsconfig.json') }
                    },
                    {
                        test: /\.s[ac]ss$/,
                        use: [
                            { loader: 'style-loader' },
                            { loader: 'css-loader' },
                            { loader: 'sass-loader' }
                        ]
                    },
                    {
                        test: /\.css$/,
                        use: [
                            { loader: 'style-loader' },
                            { loader: 'css-loader' }
                        ]
                    }
                ]
            },
            mode: release ? 'production' : 'development'
        };
        if (release) {
            cfg.plugins = [
                new webpack.BannerPlugin({
                    banner: `/*${formatLicense(this.authors, 2, this.created.getFullYear())}*/`,
                    raw: true,
                    entryOnly: false,
                    stage: webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT
                })
            ];
        } else {
            cfg.devtool = 'inline-source-map';
            cfg.watch = true;
            cfg.watchOptions = {
                aggregateTimeout: 500,
                ignored: /node_modules/
            };
        }
        return cfg;
    }

    /** Get project data for use in templates
     * @returns mapping of template variables to project data
     */
    getTemplateVars(): Record<string, string> {
        return {
            PROJECT_ID: this.id,
            PROJECT_NAME: this.name,
            PROJECT_TYPE: this.isGame ? 'Game' : 'App',
            PROJECT_IS_GAME: this.isGame ? 'true' : 'false'
        };
    }

    /** Load project info
     * @param id project ID
     * @returns loaded project info
     * @throws Error thrown if no such project exists or if the project's data is corrupted
     */
    static load(id: string): ProjectInfo {
        if (!PROJECT_ID_REGEX.test(id)) {
            throw new Error('Invalid project ID');
        }
        const directory: string = path.join(APPS_DIR, id);
        const configPath: string = path.join(directory, 'app.json');
        if (!fs.existsSync(configPath)) {
            throw new Error(`Project ${id} not found`);
        }
        const data: any = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        if (data == null || typeof data !== 'object') {
            throw new Error(`Project ${id} is corrupted`);
        } else if (!('name' in data) || typeof data.name !== 'string') {
            throw new Error(`Project ${id} is corrupted (name missing or invalid)`);
        }
        if (!('created' in data) || typeof data.created !== 'string') {
            throw new Error(`Project ${id} is corrupted (creation date missing or invalid)`);
        }
        let created: Date = new Date(data.created);
        if (isNaN(created.valueOf())) {
            throw new Error(`Project ${id} is corrupted (invalid creation date)`);
        }
        if (!('type' in data) || (data.type !== 'app' && data.type !== 'game')) {
            throw new Error(`Project ${id} is corrupted (type missing or invalid)`);
        }
        if (
            !('authors' in data)
            || !Array.isArray(data.authors)
            || data.authors.length === 0
            || data.authors.some((name: any): boolean => typeof name !== 'string')
        ) {
            throw new Error(`Project ${id} is corrupted (authors array missing or invalid)`);
        }
        let proj: ProjectInfo = new ProjectInfo(
            id,
            data.name,
            directory,
            data.authors,
            created,
            data.type === 'game'
        );
        if ('assets' in data) {
            if (!Array.isArray(data.assets)) {
                throw new Error(`Project ${id} is corrupted (invalid assets property)`);
            }
            for (const asset of data.assets) {
                if (typeof asset !== 'string') {
                    throw new Error(`Project ${id} is corrupted (invalid asset path)`);
                }
                proj.assets.add(asset);
            }
        }
        return proj;
    }

    /** Load project info for all projects
     * @returns array of loaded projects
     * @throws Error thrown if any project's data is corrupted
     */
    static loadAll(): Array<ProjectInfo> {
        const projects: Array<ProjectInfo> = [];
        for (const id of fs.readdirSync(APPS_DIR)) {
            projects.push(ProjectInfo.load(id));
        }
        return projects;
    }

    /** Create a new project
     * @param id project ID
     * @param name project name
     * @param game whether the project is a game (true) or an app (false)
     * @param author project author's name
     * @returns created project info
     */
    static create(id: string, name: string, game: boolean, author: string): ProjectInfo {
        const directory: string = path.join(APPS_DIR, id);
        fs.mkdirSync(directory, { recursive: true });
        const now: Date = new Date();
        const authors: ReadonlyArray<string> = [author];
        fs.writeFileSync(
            path.join(directory, 'app.json'),
            JSON.stringify({
                "$schema": "../../app.schema.json",
                name: name,
                created: now.toISOString(),
                authors: authors,
                assets: [],
                type: game ? 'game' : 'app'
            }, null, 2),
            'utf-8'
        );
        return new ProjectInfo(id, name, directory, authors, now, game);
    }
}
