import { resolve } from "path";
import type { ResolvedConfig, WidgetViteConfigOptions } from "../types";
import { readWidgetPackageJson, resolveWidgetName } from "../helpers/package-json";
import {
    inferEditorBuilds,
    inferMetadataFiles,
    inferPrimaryRuntimeFormat,
    inferRemoveBeforeCopy,
    inferRequiredArtifacts,
    inferBuildOutDir
} from "./infer";

export function getResolveAlias(): { find: RegExp; replacement: string }[] {
    return [
        {
            find: /^~(.+)/,
            replacement: "$1"
        },
        {
            find: /^src\//,
            replacement: `${resolve(process.cwd(), "src")}/`
        }
    ];
}

export function isBuildDev(mode: string): boolean {
    return mode === "dev";
}

export function resolveConfig(options: WidgetViteConfigOptions, isDev: boolean = false): ResolvedConfig {
    const widgetPackageJson = readWidgetPackageJson();
    const widgetName = resolveWidgetName(options.widgetName, widgetPackageJson.widgetName);
    const primaryRuntimeFormat = inferPrimaryRuntimeFormat();
    const editorBuilds = inferEditorBuilds(widgetName);
    const buildDirectoryName = options.buildDirectoryName ?? widgetName.toLowerCase();

    return {
        widgetName,
        widgetVersion: widgetPackageJson.version,
        mpkName: widgetPackageJson.mxpackage?.mpkName ?? `${widgetName}.mpk`,
        sourceDir: resolve(process.cwd(), "src"),
        buildEntry: `src/${widgetName}.tsx`,
        buildOutDir: inferBuildOutDir(widgetPackageJson.packagePath, buildDirectoryName),
        buildOutputs: [
            {
                format: primaryRuntimeFormat,
                entryFileName: `${widgetName}.js`
            },
            {
                format: "es",
                entryFileName: `${widgetName}.mjs`
            }
        ],
        buildExternals: ["react", "react-dom", "@mendix/widget-plugin-component-kit", "big.js", /^mendix($|\/)/],
        metadataFiles: inferMetadataFiles(widgetName),
        editorBuilds,
        requiredArtifacts: inferRequiredArtifacts(
            widgetName,
            widgetPackageJson.packagePath,
            buildDirectoryName,
            editorBuilds
        ),
        removeBeforeCopy: inferRemoveBeforeCopy(widgetPackageJson.name),
        define: {
            "process.env.NODE_ENV": JSON.stringify(isDev ? "development" : "production")
        }
    };
}
