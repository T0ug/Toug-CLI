"use strict";
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeChat = exports.printError = exports.printHeader = exports.promptUser = exports.COLORS = void 0;
const readline = __importStar(require("readline/promises"));
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
exports.COLORS = {
    RESET: '\x1b[0m',
    CYAN: '\x1b[36m',
    GREEN: '\x1b[32m',
    YELLOW: '\x1b[33m',
    RED: '\x1b[31m',
    MAGENTA: '\x1b[35m'
};
const promptUser = async (text) => {
    return await rl.question(`${exports.COLORS.CYAN}${text}${exports.COLORS.RESET}`);
};
exports.promptUser = promptUser;
const printHeader = (agent, model, provider) => {
    const providerLabel = provider ? `${provider.toUpperCase()} / ` : '';
    process.stdout.write(`\n${exports.COLORS.GREEN}>> [${providerLabel}${agent.toUpperCase()} @ ${model}]${exports.COLORS.RESET}\n`);
};
exports.printHeader = printHeader;
const printError = (msg, err) => {
    if (err) {
        console.error(`\n${exports.COLORS.RED}❌ ${msg}${exports.COLORS.RESET}`, err);
    }
    else {
        console.error(`\n${exports.COLORS.RED}❌ ${msg}${exports.COLORS.RESET}`);
    }
};
exports.printError = printError;
const closeChat = () => {
    rl.close();
};
exports.closeChat = closeChat;
