"use strict";
/**
 * Shared TypeScript types and branded IDs.
 * Architecture: COMP-001, COMP-015 (Learn IDs).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTrackId = exports.isFragmentId = exports.isCourseId = exports.isCareerId = exports.createTrackId = exports.createFragmentId = exports.createCourseId = exports.createCareerId = void 0;
var ids_js_1 = require("./ids.js");
Object.defineProperty(exports, "createCareerId", { enumerable: true, get: function () { return ids_js_1.createCareerId; } });
Object.defineProperty(exports, "createCourseId", { enumerable: true, get: function () { return ids_js_1.createCourseId; } });
Object.defineProperty(exports, "createFragmentId", { enumerable: true, get: function () { return ids_js_1.createFragmentId; } });
Object.defineProperty(exports, "createTrackId", { enumerable: true, get: function () { return ids_js_1.createTrackId; } });
Object.defineProperty(exports, "isCareerId", { enumerable: true, get: function () { return ids_js_1.isCareerId; } });
Object.defineProperty(exports, "isCourseId", { enumerable: true, get: function () { return ids_js_1.isCourseId; } });
Object.defineProperty(exports, "isFragmentId", { enumerable: true, get: function () { return ids_js_1.isFragmentId; } });
Object.defineProperty(exports, "isTrackId", { enumerable: true, get: function () { return ids_js_1.isTrackId; } });
