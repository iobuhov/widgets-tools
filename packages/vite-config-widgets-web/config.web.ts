import { defineConfig, type ConfigEnv } from "vite";
import { createConfig } from "./config/create";
import { createVite8Config } from "./config/create-vite8";
import type { WidgetViteConfigOptions } from "./types";

export function createWidgetViteConfig(options: WidgetViteConfigOptions = {}) {
    return defineConfig((env: ConfigEnv) => createConfig(options, env));
}

export function createWidgetVite8Config(options: WidgetViteConfigOptions = {}) {
    return defineConfig((env: ConfigEnv) => createVite8Config(options, env));
}

// Default export supports direct CLI usage:
export default defineConfig((env: ConfigEnv) => createConfig({}, env));
