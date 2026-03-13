"use strict";
/**
 * Platform core package — shared infrastructure and cross-cutting utilities.
 * Architecture: COMP-001, COMP-038, COMP-040, COMP-037
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_JOB_TIMEOUT_MS = exports.DEFAULT_DB_TIMEOUT_MS = exports.DEFAULT_HTTP_TIMEOUT_MS = exports.withTimeout = exports.TimeoutError = exports.CircuitOpenError = exports.CircuitBreaker = exports.withCorrelationId = exports.createLogger = exports.appendToLog = exports.SoftDeletableMixin = exports.getEncryptionKey = exports.decryptField = exports.encryptField = exports.validateEnv = void 0;
var env_validator_js_1 = require("./config/env-validator.js");
Object.defineProperty(exports, "validateEnv", { enumerable: true, get: function () { return env_validator_js_1.validateEnv; } });
var encrypted_field_js_1 = require("./security/encrypted-field.js");
Object.defineProperty(exports, "encryptField", { enumerable: true, get: function () { return encrypted_field_js_1.encryptField; } });
Object.defineProperty(exports, "decryptField", { enumerable: true, get: function () { return encrypted_field_js_1.decryptField; } });
Object.defineProperty(exports, "getEncryptionKey", { enumerable: true, get: function () { return encrypted_field_js_1.getEncryptionKey; } });
var soft_deletable_js_1 = require("./data-integrity/soft-deletable.js");
Object.defineProperty(exports, "SoftDeletableMixin", { enumerable: true, get: function () { return soft_deletable_js_1.SoftDeletableMixin; } });
var append_only_log_js_1 = require("./data-integrity/append-only-log.js");
Object.defineProperty(exports, "appendToLog", { enumerable: true, get: function () { return append_only_log_js_1.appendToLog; } });
var logger_js_1 = require("./observability/logger.js");
Object.defineProperty(exports, "createLogger", { enumerable: true, get: function () { return logger_js_1.createLogger; } });
Object.defineProperty(exports, "withCorrelationId", { enumerable: true, get: function () { return logger_js_1.withCorrelationId; } });
var circuit_breaker_js_1 = require("./resilience/circuit-breaker.js");
Object.defineProperty(exports, "CircuitBreaker", { enumerable: true, get: function () { return circuit_breaker_js_1.CircuitBreaker; } });
var errors_js_1 = require("./resilience/errors.js");
Object.defineProperty(exports, "CircuitOpenError", { enumerable: true, get: function () { return errors_js_1.CircuitOpenError; } });
Object.defineProperty(exports, "TimeoutError", { enumerable: true, get: function () { return errors_js_1.TimeoutError; } });
var timeout_js_1 = require("./resilience/timeout.js");
Object.defineProperty(exports, "withTimeout", { enumerable: true, get: function () { return timeout_js_1.withTimeout; } });
Object.defineProperty(exports, "DEFAULT_HTTP_TIMEOUT_MS", { enumerable: true, get: function () { return timeout_js_1.DEFAULT_HTTP_TIMEOUT_MS; } });
Object.defineProperty(exports, "DEFAULT_DB_TIMEOUT_MS", { enumerable: true, get: function () { return timeout_js_1.DEFAULT_DB_TIMEOUT_MS; } });
Object.defineProperty(exports, "DEFAULT_JOB_TIMEOUT_MS", { enumerable: true, get: function () { return timeout_js_1.DEFAULT_JOB_TIMEOUT_MS; } });
