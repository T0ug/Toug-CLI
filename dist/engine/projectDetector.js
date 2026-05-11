"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectProjectState = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const detectProjectState = (cwd) => {
    const docsDir = path_1.default.join(cwd, 'docs');
    const projectStatusPath = path_1.default.join(docsDir, 'project_status.md');
    const tasksPath = path_1.default.join(docsDir, 'tasks.md');
    const agentsDir = path_1.default.join(cwd, '.agents');
    const packageJson = path_1.default.join(cwd, 'package.json');
    const hasDocumentation = fs_1.default.existsSync(docsDir);
    const hasProjectStatus = fs_1.default.existsSync(projectStatusPath);
    const hasTasks = fs_1.default.existsSync(tasksPath);
    const hasAgentsPipeline = fs_1.default.existsSync(agentsDir);
    const hasPackageJson = fs_1.default.existsSync(packageJson);
    const isExistingProject = hasDocumentation || hasPackageJson;
    let projectStatusContent = null;
    if (hasProjectStatus) {
        try {
            projectStatusContent = fs_1.default.readFileSync(projectStatusPath, 'utf8');
        }
        catch {
            projectStatusContent = null;
        }
    }
    const items = [];
    items.push(hasDocumentation ? '  ✅ docs/' : '  ❌ docs/');
    items.push(hasProjectStatus ? '  ✅ docs/project_status.md' : '  ❌ docs/project_status.md');
    items.push(hasTasks ? '  ✅ docs/tasks.md' : '  ❌ docs/tasks.md');
    items.push(hasAgentsPipeline ? '  ✅ .agents/' : '  ❌ .agents/');
    items.push(hasPackageJson ? '  ✅ package.json' : '  ❌ package.json');
    const summary = items.join('\n');
    return {
        isExistingProject,
        hasDocumentation,
        hasAgentsPipeline,
        hasTasks,
        hasProjectStatus,
        projectStatusContent,
        summary
    };
};
exports.detectProjectState = detectProjectState;
