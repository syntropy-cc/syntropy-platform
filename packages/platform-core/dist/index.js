"use strict";
/**
 * Platform core package — shared infrastructure and cross-cutting utilities.
 * Architecture: COMP-001, COMP-038, COMP-040
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.withCorrelationId = exports.createLogger = void 0;
var logger_js_1 = require("./observability/logger.js");
Object.defineProperty(exports, "createLogger", { enumerable: true, get: function () { return logger_js_1.createLogger; } });
Object.defineProperty(exports, "withCorrelationId", { enumerable: true, get: function () { return logger_js_1.withCorrelationId; } });
