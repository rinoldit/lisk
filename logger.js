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

const consoleLog = level =>
	new winston.transports.Console({
		level,
		levels: customLevels.levels,
		format: format.combine(
			format.colorize(),
			format.timestamp(),
			format.splat(),
			format.align()
		),
	});

const fileLog = (level, filename) =>
	new winston.transports.File({
		level,
		filename,
		format: format.combine(
			format.timestamp(),
			format.splat(),
			format.align(),
			format.json()
		),
	});

const createLogger = ({
	filename,
	level,
	consoleLevel,
} = defaultLoggerConfig) => {
	const transports = [];
	if (level !== 'none') {
		transports.push(fileLog(level, filename));
	}
	if (consoleLevel !== 'none') {
		transports.push(consoleLog(consoleLevel));
	}
	return winston.createLogger({
		level,
		levels: customLevels.levels,
		transports,
		exitOnError: false,
	});
};

const defaultLogger = winston.createLogger();

const updateTransports = ({
	filename,
	level,
	consoleLevel,
} = defaultLoggerConfig) => {
	defaultLogger.clear();
	if (consoleLevel !== 'none') {
		defaultLogger.add(consoleLog(consoleLevel));
	}
	if (level !== 'none') {
		defaultLogger.add(fileLog(level, filename));
	}
};

module.exports = {
	default: defaultLogger,
	createLogger,
	updateTransports,
};
