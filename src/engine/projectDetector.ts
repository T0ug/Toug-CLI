import fs from 'fs';
import path from 'path';

export interface ProjectState {
    isExistingProject: boolean;
    hasDocumentation: boolean;
    hasAgentsPipeline: boolean;
    hasTasks: boolean;
    hasProjectStatus: boolean;
    projectStatusContent: string | null;
    summary: string;
}

export const detectProjectState = (cwd: string): ProjectState => {
    const docsDir = path.join(cwd, 'docs');
    const projectStatusPath = path.join(docsDir, 'project_status.md');
    const tasksPath = path.join(docsDir, 'tasks.md');
    const agentsDir = path.join(cwd, '.agents');
    const packageJson = path.join(cwd, 'package.json');

    const hasDocumentation = fs.existsSync(docsDir);
    const hasProjectStatus = fs.existsSync(projectStatusPath);
    const hasTasks = fs.existsSync(tasksPath);
    const hasAgentsPipeline = fs.existsSync(agentsDir);
    const hasPackageJson = fs.existsSync(packageJson);

    const isExistingProject = hasDocumentation || hasPackageJson;

    let projectStatusContent: string | null = null;
    if (hasProjectStatus) {
        try {
            projectStatusContent = fs.readFileSync(projectStatusPath, 'utf8');
        } catch {
            projectStatusContent = null;
        }
    }

    const items: string[] = [];
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
