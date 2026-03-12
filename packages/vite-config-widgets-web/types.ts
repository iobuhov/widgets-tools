export type EditorBuild = {
    entry: string;
    outputFile: string;
    externals: Array<string | RegExp>;
    format?: "cjs" | "es";
};

export type BuildOutput = {
    format: "cjs" | "es";
    entryFileName: string;
};

export type FileCopy = {
    src: string;
    dest: string;
};

export type WidgetPackageJson = {
    name: string;
    widgetName?: string;
    version: string;
    packagePath: string;
    mxpackage?: {
        mpkName?: string;
    };
};

export type WidgetViteConfigOptions = {
    widgetName?: string;
    buildDirectoryName?: string;
};

export type ResolvedConfig = {
    widgetName: string;
    widgetVersion: string;
    mpkName: string;
    sourceDir: string;
    buildEntry: string;
    buildOutDir: string;
    buildOutputs: BuildOutput[];
    buildExternals: Array<string | RegExp>;
    metadataFiles: FileCopy[];
    editorBuilds: EditorBuild[];
    requiredArtifacts: string[];
    removeBeforeCopy: string[];
    define: Record<string, string>;
};
