/*
 * Copyright © 2018 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */
const os = require('os');
const winston = require('winston');

const { format } = winston;

const customLevels = {
	levels: {
		fatal: 0,
		error: 1,
		warn: 2,
		info: 3,
		debug: 4,
		trace: 5,
		none: 99,
	},
	colors: {
		fatal: 'yellow',
		error: 'red',
		warn: 'meganta',
		info: 'blue',
		debug: 'green',
		trace: 'cyan',
		none: 'black',
	},
};

winston.addColors(customLevels.colors);

const defaultLoggerConfig = {
	filename: 'logs/lisk.log',
	level: 'none',
	consoleLevel: 'debug',
};

const consoleFormat = info => {
	let log = `[${info.level}] ${info.timestamp} <${info.module}>: ${
		info.message
	}`;
	log += info.durationMs ? ` duration=${info.durationMs}ms` : '';
	log += info.meta ? `\n\t ${JSON.stringify(info.meta)}` : '';
	return log;
};

const injectKey = (key, value) =>
	format(info => {
		info[key] = value;
		return info;
	});

const consoleLog = (level, module) =>
	new winston.transports.Console({
		level,
		levels: customLevels.levels,
		format: format.combine(
			format.colorize(),
			injectKey('module', module)(),
			format.timestamp(),
			format.splat(),
			format.printf(consoleFormat)
		),
	});

const fileLog = (level, filename, module) =>
	new winston.transports.File({
		level,
		filename,
		format: format.combine(
			format.timestamp(),
			injectKey('module', module)(),
			injectKey('hostname', os.hostname())(),
			format.splat(),
			format.json()
		),
	});

const getTransport = ({ filename, level, consoleLevel, module }) => {
	const transports = [];
	if (level !== 'none') {
		transports.push(fileLog(level, filename, module));
	}
	if (consoleLevel !== 'none') {
		transports.push(consoleLog(consoleLevel, module));
	}
	return transports;
};

class Logger {
	constructor(config = defaultLoggerConfig) {
		this.config = config;
		this.container = new winston.Container();
		this.defaultLogger = this.get('defaultLogger');
		Object.keys(customLevels.levels).forEach(level => {
			this[level] = this.defaultLogger[level];
		});
	}

	get(moduleName) {
		return this.container.get(moduleName, {
			level: this.config.level,
			levels: customLevels.levels,
			transports: getTransport({
				filename: this.config.filename,
				level: this.config.level,
				consoleLevel: this.config.consoleLevel,
				module: moduleName,
			}),
			exitOnError: false,
		});
	}
}

module.exports = Logger;
