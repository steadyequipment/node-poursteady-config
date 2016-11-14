'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _commandLineArgs = require('command-line-args');

var _commandLineArgs2 = _interopRequireDefault(_commandLineArgs);

var _commandLineUsage = require('command-line-usage');

var _commandLineUsage2 = _interopRequireDefault(_commandLineUsage);

var _ansiEscapeSequences = require('ansi-escape-sequences');

var _ansiEscapeSequences2 = _interopRequireDefault(_ansiEscapeSequences);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EnvironmentProduction = "production";
var EnvironmentDevelopment = "development";

var Config = function () {

    // config : {
    //   name : string,
    //   description : string,
    //   options : [ command-line-args-option ],
    //   note : string,
    //   aboutDescription : string or [ string ]
    // }
    function Config(config) {
        _classCallCheck(this, Config);

        this.config = config;

        this.usage = (0, _commandLineUsage2.default)(this.commandLineUsageOptions);

        try {
            this._values = (0, _commandLineArgs2.default)(this.options);
        } catch (error) {
            this.error = error;
        }

        if (this.configFile) {

            var configRelativePath = this.configFile;
            try {

                var configAbsPath = _path2.default.resolve(process.cwd(), configRelativePath);

                var configFile = JSON.parse(_fs2.default.readFileSync(configAbsPath));
                this._values = _lodash2.default.defaults(this._values, configFile);
            } catch (error) {

                this.error = new Error('Reading config file \'' + configRelativePath + '\': ' + error);
            }
        }
    }

    _createClass(Config, [{
        key: 'printUsage',
        value: function printUsage(message, exitProcess) {
            if (_lodash2.default.isBoolean(message)) {
                exitProcess = message;
                message = undefined;
            }

            if (_lodash2.default.isString(message) && message.length > 0) {
                console.log("  " + message);
            } else if (_lodash2.default.isError(message)) {
                console.log(_ansiEscapeSequences2.default.format("  [red bold underline]{Error}[red bold]{:} " + message.message));
            }

            console.log(this.usage);

            if (_lodash2.default.isBoolean(exitProcess) && exitProcess) {
                process.exit();
            }
        }
    }, {
        key: 'environment',
        get: function get() {
            return this.config.environment || process.env.NODE_ENV || EnvironmentDevelopment;
        }
    }, {
        key: 'values',
        get: function get() {
            if (!this._values) {
                return {};
            }

            return this._values;
        }
    }, {
        key: 'name',
        get: function get() {
            var name = this.config.name;

            return name;
        }
    }, {
        key: 'description',
        get: function get() {
            var description = this.config.description;

            return description;
        }
    }, {
        key: 'options',
        get: function get() {
            var defaultOptions = [{ name: 'help', alias: 'h', type: Boolean, description: "Display this usage guide." }, { name: 'config', alias: 'c', type: String, description: "Config file in JSON format." }];

            // { name: 'logLevel', alias: 'l', type: String, description: "Log level to send to Console: ERROR, WARNING, INFO, DEBUG, VERBOSE."},
            // { name: 'logOutputFolder', alias: 'f', type: String, description: "Folder to store log outputs within."},

            var configOptions = this.config.options;
            if (!configOptions) {
                return defaultOptions;
            }

            return defaultOptions.concat(configOptions);
        }
    }, {
        key: 'note',
        get: function get() {
            var note = this.config.note;

            return note;
        }
    }, {
        key: 'aboutDescription',
        get: function get() {
            var aboutDescription = this.config.aboutDescription;

            return aboutDescription;
        }
    }, {
        key: 'commandLineUsageOptions',
        get: function get() {
            return [{
                header: this.name,
                content: this.description
            }, {
                header: "Options",
                optionList: this.options
            }, { // TODO: do not include if not specified
                content: this.note
            }, { // TODO: do not include if not specified
                header: "About",
                content: this.aboutDescription
            }];
        }
    }, {
        key: 'showHelp',
        get: function get() {
            var help = this.values.help;

            return help;
        }
    }, {
        key: 'configFile',
        get: function get() {
            var config = this.values.config;

            return config;
        }
    }]);

    return Config;
}();

var parseOrExit = function parseOrExit(config) {
    var configObject = new Config(config);
    if (configObject.error) {
        configObject.printUsage(configObject.error, true); // Will exit process
        //        return
    }

    if (configObject.showHelp) {
        configObject.printUsage(true); // Will exit process
        //        return
    }

    return configObject;
};

exports.default = {
    Config: Config,
    parseOrExit: parseOrExit
};