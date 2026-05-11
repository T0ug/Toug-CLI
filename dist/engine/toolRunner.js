"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeShellCommand = void 0;
const node_child_process_1 = require("node:child_process");
const node_util_1 = __importDefault(require("node:util"));
const execAsync = node_util_1.default.promisify(node_child_process_1.exec);
const executeShellCommand = async (command) => {
    try {
        const { stdout, stderr } = await execAsync(command, { maxBuffer: 2 * 1024 * 1024 }); // 2MB buffer para prevenir max buffer spawn logs
        let result = stdout.trim();
        if (stderr.trim()) {
            result += `\n[STDERR]:\n${stderr.trim()}`;
        }
        result = result.trim() || "Process exited successfully with no string output.";
        if (result.length > 2000) {
            result = result.substring(0, 1997) + '...';
        }
        return result;
    }
    catch (e) {
        let errOutput = e.stderr || e.stdout || e.message || String(e);
        if (typeof errOutput === 'string' && errOutput.length > 2000) {
            errOutput = errOutput.substring(0, 1997) + '...';
        }
        return `[ERROR failed to execute tool command]: ${errOutput}`;
    }
};
exports.executeShellCommand = executeShellCommand;
