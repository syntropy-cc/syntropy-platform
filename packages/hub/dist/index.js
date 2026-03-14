"use strict";
/**
 * Hub domain package.
 * Architecture: COMP-019 through COMP-021
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIPContributionAdapter = exports.ContributionNotReadyForMergeError = exports.ContributionIntegrationService = void 0;
__exportStar(require("./domain/collaboration/index.js"), exports);
var contribution_integration_service_js_1 = require("./application/contribution-integration-service.js");
Object.defineProperty(exports, "ContributionIntegrationService", { enumerable: true, get: function () { return contribution_integration_service_js_1.ContributionIntegrationService; } });
Object.defineProperty(exports, "ContributionNotReadyForMergeError", { enumerable: true, get: function () { return contribution_integration_service_js_1.ContributionNotReadyForMergeError; } });
var dip_contribution_adapter_js_1 = require("./infrastructure/dip-contribution-adapter.js");
Object.defineProperty(exports, "DIPContributionAdapter", { enumerable: true, get: function () { return dip_contribution_adapter_js_1.DIPContributionAdapter; } });
