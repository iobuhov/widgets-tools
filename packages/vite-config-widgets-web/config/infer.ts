import { existsSync } from "fs";
import { toPackagePathDir } from "../helpers/package-json";
import type { EditorBuild, FileCopy } from "../types";

export function inferPrimaryRuntimeFormat(): "cjs" | "es" {
    if (process.env.VITE_RUNTIME_FORMAT === "es") {
        return "es";
    }

    return "cjs";
}

export function inferMetadataFiles(widgetName: string): FileCopy[] {
    return [
        { src: `src/${widgetName}.xml`, dest: `${widgetName}.xml` },
        { src: `src/${widgetName}.icon.png`, dest: `${widgetName}.icon.png` },
        { src: `src/${widgetName}.icon.dark.png`, dest: `${widgetName}.icon.dark.png` },
        { src: `src/${widgetName}.tile.png`, dest: `${widgetName}.tile.png` },
        { src: `src/${widgetName}.tile.dark.png`, dest: `${widgetName}.tile.dark.png` },
        { src: "LICENSE", dest: "LICENSE" },
        { src: "src/package.xml", dest: "package.xml" }
    ];
}

export function inferRequiredArtifacts(
    widgetName: string,
    packagePath: string,
    buildDirectoryName: string,
    editorBuilds: EditorBuild[]
): string[] {
    const packagePathDir = toPackagePathDir(packagePath);
    const widgetDir = buildDirectoryName;

    const editorArtifacts = editorBuilds.map(editorBuild => editorBuild.outputFile);

    return [
        ...editorArtifacts,
        `${packagePathDir}/${widgetDir}/${widgetName}.js`,
        `${packagePathDir}/${widgetDir}/${widgetName}.mjs`
    ];
}

export function inferBuildOutDir(packagePath: string, buildDirectoryName: string): string {
    const packagePathDir = toPackagePathDir(packagePath);
    return `dist/tmp/widgets/${packagePathDir}/${buildDirectoryName}`;
}

export function inferEditorBuilds(widgetName: string): EditorBuild[] {
    const editorBuilds: EditorBuild[] = [];

    const editorPreviewEntry = `src/${widgetName}.editorPreview.tsx`;
    if (existsSync(editorPreviewEntry)) {
        editorBuilds.push({
            entry: editorPreviewEntry,
            outputFile: `${widgetName}.editorPreview.js`,
            externals: [/^mendix($|\/)/, /^react$/, /^react-dom$/]
        });
    }

    const editorConfigEntry = `src/${widgetName}.editorConfig.ts`;
    if (existsSync(editorConfigEntry)) {
        editorBuilds.push({
            entry: editorConfigEntry,
            outputFile: `${widgetName}.editorConfig.js`,
            externals: [/^mendix($|\/)/, /^react$/, /^react-dom$/]
        });
    }

    return editorBuilds;
}

export function inferRemoveBeforeCopy(packageName: string): string[] {
    const widgetPackageName = packageName.split("/").pop();
    return widgetPackageName ? [`${widgetPackageName}.css`] : [];
}
