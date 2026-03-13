"use strict";
/**
 * Platform core package — shared infrastructure and cross-cutting utilities.
 * Architecture: COMP-001, COMP-038, COMP-040
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeoutError = exports.CircuitOpenError = exports.CircuitBreaker = exports.withCorrelationId = exports.createLogger = void 0;
var logger_js_1 = require("./observability/logger.js");
Object.defineProperty(exports, "createLogger", { enumerable: true, get: function () { return logger_js_1.createLogger; } });
Object.defineProperty(exports, "withCorrelationId", { enumerable: true, get: function () { return logger_js_1.withCorrelationId; } });
var circuit_breaker_js_1 = require("./resilience/circuit-breaker.js");
Object.defineProperty(exports, "CircuitBreaker", { enumerable: true, get: function () { return circuit_breaker_js_1.CircuitBreaker; } });
var errors_js_1 = require("./resilience/errors.js");
Object.defineProperty(exports, "CircuitOpenError", { enumerable: true, get: function () { return errors_js_1.CircuitOpenError; } });
Object.defineProperty(exports, "TimeoutError", { enumerable: true, get: function () { return errors_js_1.TimeoutError; } });
