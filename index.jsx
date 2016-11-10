import CommandLineArgs from 'command-line-args';
import CommandLineUsage from 'command-line-usage';
import AnsiEscape from 'ansi-escape-sequences';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';

const EnvironmentProduction = "production";
const EnvironmentDevelopment = "development";

class Config {

    // config : {
    //   name : string,
    //   description : string,
    //   options : [ command-line-args-option ],
    //   note : string,
    //   aboutDescription : string or [ string ]
    // }
    constructor(config) {

        this.config = config;

        this.usage = CommandLineUsage(this.commandLineUsageOptions);

        try {
            this._values = CommandLineArgs(this.options);    
        } catch(error) {
            this.error = error;
        }

        if (this.configFile) { 

            const configRelativePath = this.configFile;
            try {
        
                const configAbsPath = path.resolve(process.cwd(), configRelativePath);

                let configFile = JSON.parse(fs.readFileSync(configAbsPath));
                this._values = _.defaults(this._values, configFile);
            } catch(error) {

                this.error = new Error(`Reading config file '${configRelativePath}': ${error}`);
            }
        }
    }

    get environment() {
        return this.config.environment || 
            process.env.NODE_ENV || 
            EnvironmentDevelopment;
    }

    get values() {
        if (!this._values) {
            return {}
        }

        return this._values;
    }

    get name() {
        const { name } = this.config;
        return name;        
    }

    get description() {
        const { description } = this.config;
        return description;
    }

    get options() {
        const defaultOptions = [
            { name: 'help', alias: 'h', type: Boolean, description: "Display this usage guide." },
            { name: 'config', alias: 'c', type: String, description: "Config file in JSON format." }
        ];

    // { name: 'logLevel', alias: 'l', type: String, description: "Log level to send to Console: ERROR, WARNING, INFO, DEBUG, VERBOSE."},
    // { name: 'logOutputFolder', alias: 'f', type: String, description: "Folder to store log outputs within."},

        const configOptions = this.config.options;
        if (!configOptions) {
            return defaultOptions;
        }

        return defaultOptions.concat(configOptions);
    }

    get note() {
        const { note } = this.config;
        return note;
    }

    get aboutDescription() {
        const { aboutDescription } = this.config;
        return aboutDescription;
    }

    get commandLineUsageOptions() {
        return [ 
            {
                header: this.name,
                content: this.description                
            },
            {
                header: "Options",
                optionList: this.options
            },
            { // TODO: do not include if not specified
                content: this.note
            },
            { // TODO: do not include if not specified
                header: "About",
                content: this.aboutDescription
            }
        ]
    }

    printUsage(message, exitProcess) {
        if (_.isBoolean(message)) {
            exitProcess = message;
            message = undefined;
        }

        if (_.isString(message) && message.length > 0) {
            console.log("  " + message)
        } else if (_.isError(message)) {
            console.log(AnsiEscape.format("  [red bold underline]{Error}[red bold]{:} " + message.message))
        }

        console.log(this.usage)

        if (_.isBoolean(exitProcess) && exitProcess) {
            process.exit()
        }
    }

    get showHelp() {
        const { help } = this.values;
        return help;
    }

    get configFile() {
        const { config } = this.values;
        return config;
    }
}

const parseOrExit = (config) => {
    const configObject = new Config(config);
    if (configObject.error) {
        configObject.printUsage(configObject.error, true); // Will exit process
//        return
    }

    if (configObject.showHelp) {
        configObject.printUsage(true); // Will exit process
//        return
    }

    return configObject;
}

export default {
    Config,
    parseOrExit
}