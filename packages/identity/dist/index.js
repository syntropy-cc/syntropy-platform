"use strict";
/**
 * Identity domain package.
 * Architecture: COMP-002
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ROLE_PERMISSIONS = exports.getPermissionsForRole = exports.RequireRole = exports.InMemoryPermissionCache = exports.createPermissionChecker = exports.PermissionChecker = exports.requirePermission = exports.hasPermission = exports.ForbiddenError = exports.AuthProviderError = exports.InvalidTokenError = exports.IdentityEventPublisher = exports.SupabaseAuthAdapter = exports.createUserUpdated = exports.createUserCreated = exports.IdentityToken = exports.Permission = exports.isActorId = exports.createActorId = exports.Session = exports.Role = exports.RBACRole = exports.User = void 0;
var index_js_1 = require("./domain/index.js");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return index_js_1.User; } });
Object.defineProperty(exports, "RBACRole", { enumerable: true, get: function () { return index_js_1.RBACRole; } });
Object.defineProperty(exports, "Role", { enumerable: true, get: function () { return index_js_1.Role; } });
Object.defineProperty(exports, "Session", { enumerable: true, get: function () { return index_js_1.Session; } });
Object.defineProperty(exports, "createActorId", { enumerable: true, get: function () { return index_js_1.createActorId; } });
Object.defineProperty(exports, "isActorId", { enumerable: true, get: function () { return index_js_1.isActorId; } });
Object.defineProperty(exports, "Permission", { enumerable: true, get: function () { return index_js_1.Permission; } });
Object.defineProperty(exports, "IdentityToken", { enumerable: true, get: function () { return index_js_1.IdentityToken; } });
Object.defineProperty(exports, "createUserCreated", { enumerable: true, get: function () { return index_js_1.createUserCreated; } });
Object.defineProperty(exports, "createUserUpdated", { enumerable: true, get: function () { return index_js_1.createUserUpdated; } });
var supabase_auth_adapter_js_1 = require("./infrastructure/supabase-auth-adapter.js");
Object.defineProperty(exports, "SupabaseAuthAdapter", { enumerable: true, get: function () { return supabase_auth_adapter_js_1.SupabaseAuthAdapter; } });
var IdentityEventPublisher_js_1 = require("./infrastructure/IdentityEventPublisher.js");
Object.defineProperty(exports, "IdentityEventPublisher", { enumerable: true, get: function () { return IdentityEventPublisher_js_1.IdentityEventPublisher; } });
var errors_js_1 = require("./infrastructure/errors.js");
Object.defineProperty(exports, "InvalidTokenError", { enumerable: true, get: function () { return errors_js_1.InvalidTokenError; } });
Object.defineProperty(exports, "AuthProviderError", { enumerable: true, get: function () { return errors_js_1.AuthProviderError; } });
Object.defineProperty(exports, "ForbiddenError", { enumerable: true, get: function () { return errors_js_1.ForbiddenError; } });
var index_js_2 = require("./rbac/index.js");
Object.defineProperty(exports, "hasPermission", { enumerable: true, get: function () { return index_js_2.hasPermission; } });
Object.defineProperty(exports, "requirePermission", { enumerable: true, get: function () { return index_js_2.requirePermission; } });
Object.defineProperty(exports, "PermissionChecker", { enumerable: true, get: function () { return index_js_2.PermissionChecker; } });
Object.defineProperty(exports, "createPermissionChecker", { enumerable: true, get: function () { return index_js_2.createPermissionChecker; } });
Object.defineProperty(exports, "InMemoryPermissionCache", { enumerable: true, get: function () { return index_js_2.InMemoryPermissionCache; } });
Object.defineProperty(exports, "RequireRole", { enumerable: true, get: function () { return index_js_2.RequireRole; } });
Object.defineProperty(exports, "getPermissionsForRole", { enumerable: true, get: function () { return index_js_2.getPermissionsForRole; } });
Object.defineProperty(exports, "DEFAULT_ROLE_PERMISSIONS", { enumerable: true, get: function () { return index_js_2.DEFAULT_ROLE_PERMISSIONS; } });
