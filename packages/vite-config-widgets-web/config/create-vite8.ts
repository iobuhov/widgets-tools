import { copyFileSync, existsSync, mkdirSync } from "fs";
import { join, resolve } from "path";
import type { ConfigEnv, UserConfig } from "vite";
import type { WidgetViteConfigOptions } from "../types";
import { createMPK, deployMPKToMxProject } from "../build/mpk";
import { toPackagePathDir, readWidgetPackageJson } from "../helpers/package-json";
import { getResolveAlias, isBuildDev, resolveConfig } from "./resolve";

export function createVite8Config(options: WidgetViteConfigOptions, env: ConfigEnv): UserConfig {
    const { mode } = env;

    const isDev = isBuildDev(mode);
    const resolvedConfig = resolveConfig(options, isDev);
    const alias = getResolveAlias();
    const sourcemapMode = isDev ? "inline" : false;

    // Override required artifacts to only check for .mjs (ES format only)
    const widgetPackageJson = readWidgetPackageJson();
    const packagePathDir = toPackagePathDir(widgetPackageJson.packagePath);
    const buildDirectoryName = options.buildDirectoryName ?? resolvedConfig.widgetName.toLowerCase();
    const editorArtifacts = resolvedConfig.editorBuilds.map(editorBuild => editorBuild.outputFile);
    const vite8RequiredArtifacts = [
        ...editorArtifacts,
        `${packagePathDir}/${buildDirectoryName}/${resolvedConfig.widgetName}.mjs`
    ];

    return {
        define: resolvedConfig.define,
        resolve: {
            alias
        },
        build: {
            target: "es2019",
            minify: false,
            sourcemap: sourcemapMode,
            lib: {
                entry: resolvedConfig.buildEntry,
                formats: ["es"]
            },
            outDir: resolvedConfig.buildOutDir,
            rolldownOptions: {
                output: {
                    entryFileNames: `${resolvedConfig.widgetName}.mjs`
                },
                external: resolvedConfig.buildExternals
            }
        },
        plugins: [
            {
                name: "vite-plugin-copy-metadata",
                apply: "build",
                enforce: "post",
                async closeBundle() {
                    const distPath = resolve(process.cwd(), "dist");
                    const stagingDir = join(distPath, "tmp", "widgets");

                    mkdirSync(stagingDir, { recursive: true });

                    // Copy metadata files
                    for (const file of resolvedConfig.metadataFiles) {
                        const srcPath = resolve(process.cwd(), file.src);
                        const destPath = join(stagingDir, file.dest);
                        const destDir = join(stagingDir, file.dest.split("/").slice(0, -1).join("/"));

                        mkdirSync(destDir, { recursive: true });

                        if (existsSync(srcPath)) {
                            copyFileSync(srcPath, destPath);
                        }
                    }
                }
            },
            {
                name: "vite-plugin-mpk-builder",
                apply: "build",
                enforce: "post",
                async closeBundle() {
                    console.log("Building MPK...");
                    const mpkPath = await createMPK({
                        ...resolvedConfig,
                        requiredArtifacts: vite8RequiredArtifacts
                    });
                    await deployMPKToMxProject(mpkPath);
                }
            }
        ]
    };
}
