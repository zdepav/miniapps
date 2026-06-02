import { wordWrapPrint } from './_utils.js';

/** Validator for project IDs */
export const PROJECT_ID_REGEX: RegExp = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;


/** CLI argument definition */
export interface CLIArg {

    /** Argument name */
    readonly name: string;

    /** Whether the argument is optional, defaults to false (required) if not specified. Optional
     * arguments MUST be placed after all required arguments.
     */
    readonly optional?: boolean;

    /** Argument description, optional */
    readonly description?: string;
}


/** CLI option definition */
export interface CLIOpt {

    /** Short (single-letter) name, without leading dash, optional
     * @example "h" for `-h`
     */
    readonly short?: string;

    /** Long name, without leading dashes
     * @example "help" for `--help`
     */
    readonly long: string;

    /** Option description, optional */
    readonly description?: string;
}


/** CLI example definition */
export interface CLIExample {

    /** CLI arguments (excluding script name)
     */
    readonly args: Array<string>;

    /** Example description, optional */
    readonly description?: string;
}


/** Parsed CLI arguments and options */
export interface ParsedCLIArgs {

    /** Project ID */
    projectId: string;

    /** Positional arguments by name, excluding (project ID). Optional arguments that were not
     * specified will be missing from this object. */
    named: Record<string, string>;

    /** Set of enabled options, listed by their long names
     * @example `args.opts.has('color')` to check for --color option
     */
    opts: Set<string>;
}


/** Script CLI API helper */
export default class CLI {

    /** NPM script name
     * @example "build"
     */
    readonly command: string

    /** Command title
     * @example "build script"
     */
    private title: string | null;

    /** Description of what the script does */
    private description: string | null;

    /** Allowed options */
    private readonly opts: Array<CLIOpt>;

    /** Positional arguments */
    private readonly args: Array<CLIArg>;

    /** Usage examples */
    private readonly examples: Array<CLIExample>;

    /** Whether the script requires a project ID as its first positional argument */
    private readonly usesProjectId: boolean;

    /** Creates a new CLI helper instance
     * @param command NPM script name
     * @param usesProjectId whether the script requires a project ID (defaults to true)
     * @example `new CLI('build')`
     */
    constructor(command: string, usesProjectId: boolean | 'optional' = true) {
        this.command = command;
        this.title = null;
        this.description = null;
        this.opts = [{ short: 'h', long: 'help', description: 'Print this help message'}];
        this.args = [];
        if (usesProjectId !== false) {
            this.args.push({
                name: 'project_id',
                optional: usesProjectId === 'optional',
                description: (
                    'ID for the project (lowercase letters and digits, words may be separated by a'
                    + ' single dash "-")'
                )
            });
            this.usesProjectId = true;
        } else {
            this.usesProjectId = false;
        }
        this.examples = [];
    }

    /** Set command title
     * @param title command title
     */
    setTitle(title: string): void {
        this.title = title;
    }

    /** Set command description
     * @param description command description
     */
    setDesc(description: string): void {
        this.description = description;
    }

    /** Add option
     * @param opt option definition
     */
    addOpt(opt: CLIOpt): void {
        this.opts.push(opt);
    }

    /** Add positional argument
     * @param arg argument definition
     */
    addArg(arg: CLIArg): void {
        this.args.push(arg);
    }

    /** Add example
     * @param example usage example
     */
    addExample(example: CLIExample): void {
        this.examples.push(example);
    }

    /** Print full usage instructions (help) and terminate this process
     * @param exitCode exit code to use, prints to stderr if non-zero
     * @param message optional message to print before the usage instructions
     */
    printUsageAndExit(exitCode: number, message?: string): never {
        const print: (s?: string) => void = exitCode > 0 ? console.error : console.log;
        if (message != null) {
            print(message);
            print();
        }
        if (this.title != null) {
            print(`2d3's MiniApps ${this.title}`);
        } else {
            print(`2d3's MiniApps ${this.command} script`);
        }
        if (this.description != null) {
            wordWrapPrint(print, this.description);
        }
        print();
        print('Usage:')
        const invoker: string = process.env.MINIAPPS_MA_MODE == 'true' ? 'ma' : 'npm run --';
        print(`    ${invoker} ${this.command} --help`);
        let args: string = this.args.map(
            (arg: CLIArg): string => arg.optional ? `[${arg.name}]` : `<${arg.name}>`
        ).join(' ');
        if (this.opts.length > 1) {
            args = `[options...] ${args}`;
        }
        print(`    ${invoker} ${this.command} ${args}`);
        print();
        if (this.opts.length > 0) {
            print('Options:');
            for (const opt of this.opts) {
                print(opt.short != null ? `    -${opt.short}, --${opt.long}` : `    --${opt.long}`);
                if (opt.description != null) {
                    wordWrapPrint(print, opt.description, 8);
                }
                print();
            }
        }
        if (this.args.length > 0) {
            print('Arguments:');
            for (const arg of this.args) {
                print(arg.optional ? `    ${arg.name} (optional)` : `    ${arg.name}`);
                if (arg.description != null) {
                    wordWrapPrint(print, arg.description, 8);
                }
                print();
            }
        }
        if (this.examples.length > 0) {
            print(this.examples.length > 1 ? 'Examples:' : 'Example:');
            for (const example of this.examples) {
                print(`    npm run -- ${this.command} ${example.args.join(' ')}`);
                if (example.description != null) {
                    wordWrapPrint(print, example.description, 8);
                }
                print();
            }
        }
        process.exit(exitCode);
    }

    private parseShortOptions(ret: ParsedCLIArgs, optArg: string): void {
        let ok: boolean = false;
        // starting from 1 as optArg includes the statring "-"
        for (let j: number = 1; j < optArg.length; ++j) {
            const char: string = optArg[j];
            for (const opt of this.opts) if (opt.short === char) {
                ret.opts.add(opt.long);
                ok = true;
                break;
            }
            if (!ok) {
                this.printUsageAndExit(1, `ERROR: Unknown short option -${char}`);
            }
        }
    }

    private parseLongOption(ret: ParsedCLIArgs, optArg: string): void {
        optArg = optArg.substring(2);
        let ok: boolean = false;
        for (const opt of this.opts) if (opt.long === optArg) {
            ret.opts.add(opt.long);
            ok = true;
            break;
        }
        if (!ok) {
            this.printUsageAndExit(1, `ERROR: Unknown long option --${optArg}`);
        }
    }

    /** Parse CLI arguments
     * @returns parsed CLI arguments and options
     */
    parseArgs(): ParsedCLIArgs {
        const ret: ParsedCLIArgs = { projectId: '', named: {}, opts: new Set() }
        const orderedArgs: Array<string> = [];
        let optionsAllowed: boolean = true;
        for (let i: number = 2; i < process.argv.length; ++i) {
            let a: string = process.argv[i];
            if (optionsAllowed && (a === '-' || a === '--')) {
                optionsAllowed = false;
            } else if (optionsAllowed && a.startsWith('--')) {
                this.parseLongOption(ret, a);
            } else if (optionsAllowed && a.startsWith('-')) {
                this.parseShortOptions(ret, a);
            } else {
                orderedArgs.push(a);
            }
        }
        if (ret.opts.has('help')) { // --help takes precedence over any other usage
            this.printUsageAndExit(0);
        }
        let requiredArgCount: number = this.args.length;
        while (requiredArgCount > 0 && this.args[requiredArgCount - 1].optional) {
            --requiredArgCount;
        }
        if (orderedArgs.length < requiredArgCount) {
            this.printUsageAndExit(
                1,
                `ERROR: Missing required argument <${this.args[orderedArgs.length].name}>`
            );
        } else if (orderedArgs.length > this.args.length) {
            this.printUsageAndExit(1, `ERROR: Too many arguments`);
        } else if (orderedArgs.length === 0) {
            return ret;
        } else if (this.usesProjectId) {
            ret.projectId = orderedArgs[0];
            if (!PROJECT_ID_REGEX.test(ret.projectId)) {
                this.printUsageAndExit(1, `ERROR: Invalid project ID "${ret.projectId}"`);
            }
        }
        for (let i: number = this.usesProjectId ? 1 : 0; i < orderedArgs.length; i++) {
            ret.named[this.args[i].name] = orderedArgs[i];
        }
        return ret;
    }
}
