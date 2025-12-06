import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import { configs, parser } from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
// @ts-expect-error ignore type errors
import pluginPromise from 'eslint-plugin-promise';
import { includeIgnoreFile } from '@eslint/compat';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, '.gitignore');
const eslintConfig = defineConfig({
    ignores: [
        ...(includeIgnoreFile(gitignorePath).ignores || []),
        '**/*.d.ts',
        'src/tsconfig.json',
        'src/stories',
        '**/*.css',
        'node_modules/**/*',
        'out',
        'cdk.out',
        'dist',
        'app',
    ],
}, eslint.configs.recommended, configs.strict, configs.stylistic, pluginPromise.configs['flat/recommended'], {
    files: ['**/*.ts', '*.js'],
    plugins: {
        '@stylistic': stylistic,
    },
    languageOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        parser,
        parserOptions: {
            projectService: true,
            tsconfigRootDir: __dirname,
            allowDefaultProject: ['eslint.config.ts'],
        },
    },
    extends: [
        importPlugin.flatConfigs.recommended,
        importPlugin.flatConfigs.typescript,
    ],
    settings: {
        'import/resolver': {
            // You will also need to install and configure the TypeScript resolver
            // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
            'typescript': true,
            'node': true,
        },
    },
    rules: {
        '@stylistic/semi': ['error', 'always'],
        '@stylistic/indent': ['error', 2],
        '@stylistic/comma-dangle': ['error', 'always-multiline'],
        '@stylistic/arrow-parens': ['error', 'always'],
        '@stylistic/quotes': ['error', 'single'],
    },
});
export default eslintConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXNsaW50LmNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImVzbGludC5jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFVLFlBQVksRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNyRCxPQUFPLE1BQU0sTUFBTSxZQUFZLENBQUM7QUFDaEMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNwRCxPQUFPLFNBQVMsTUFBTSwwQkFBMEIsQ0FBQztBQUNqRCxPQUFPLFlBQVksTUFBTSxzQkFBc0IsQ0FBQztBQUNoRCxzQ0FBc0M7QUFDdEMsT0FBTyxhQUFhLE1BQU0sdUJBQXVCLENBQUM7QUFFbEQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDbkQsT0FBTyxJQUFJLE1BQU0sV0FBVyxDQUFDO0FBQzdCLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFekMsTUFBTSxVQUFVLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUMzQyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUU1RCxNQUFNLFlBQVksR0FBYSxZQUFZLENBQ3pDO0lBQ0UsT0FBTyxFQUFFO1FBQ1AsR0FBRyxDQUFDLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUM7UUFDbkQsV0FBVztRQUNYLG1CQUFtQjtRQUNuQixhQUFhO1FBQ2IsVUFBVTtRQUNWLG1CQUFtQjtRQUNuQixLQUFLO1FBQ0wsU0FBUztRQUNULE1BQU07UUFDTixLQUFLO0tBQ047Q0FDRixFQUNELE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUMxQixPQUFPLENBQUMsTUFBTSxFQUNkLE9BQU8sQ0FBQyxTQUFTLEVBQ2pCLGFBQWEsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsRUFDekM7SUFDRSxLQUFLLEVBQUUsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDO0lBQzFCLE9BQU8sRUFBRTtRQUNQLFlBQVksRUFBRSxTQUFTO0tBQ3hCO0lBQ0QsZUFBZSxFQUFFO1FBQ2YsV0FBVyxFQUFFLFFBQVE7UUFDckIsVUFBVSxFQUFFLFFBQVE7UUFDcEIsTUFBTTtRQUNOLGFBQWEsRUFBRTtZQUNiLGNBQWMsRUFBRSxJQUFJO1lBQ3BCLGVBQWUsRUFBRSxTQUFTO1lBQzFCLG1CQUFtQixFQUFFLENBQUMsa0JBQWtCLENBQUM7U0FDMUM7S0FDRjtJQUNELE9BQU8sRUFBRTtRQUNQLFlBQVksQ0FBQyxXQUFXLENBQUMsV0FBVztRQUNwQyxZQUFZLENBQUMsV0FBVyxDQUFDLFVBQVU7S0FDcEM7SUFDRCxRQUFRLEVBQUU7UUFDUixpQkFBaUIsRUFBRTtZQUNqQixzRUFBc0U7WUFDdEUsd0ZBQXdGO1lBQ3hGLFlBQVksRUFBRSxJQUFJO1lBQ2xCLE1BQU0sRUFBRSxJQUFJO1NBQ2I7S0FDRjtJQUNELEtBQUssRUFBRTtRQUNMLGlCQUFpQixFQUFFLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQztRQUN0QyxtQkFBbUIsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDakMseUJBQXlCLEVBQUUsQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLENBQUM7UUFDeEQseUJBQXlCLEVBQUUsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDO1FBQzlDLG1CQUFtQixFQUFFLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQztLQUN6QztDQUNGLENBQ0YsQ0FBQztBQUVGLGVBQWUsWUFBWSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29uZmlnLCBkZWZpbmVDb25maWcgfSBmcm9tICdlc2xpbnQvY29uZmlnJztcbmltcG9ydCBlc2xpbnQgZnJvbSAnQGVzbGludC9qcyc7XG5pbXBvcnQgeyBjb25maWdzLCBwYXJzZXIgfSBmcm9tICd0eXBlc2NyaXB0LWVzbGludCc7XG5pbXBvcnQgc3R5bGlzdGljIGZyb20gJ0BzdHlsaXN0aWMvZXNsaW50LXBsdWdpbic7XG5pbXBvcnQgaW1wb3J0UGx1Z2luIGZyb20gJ2VzbGludC1wbHVnaW4taW1wb3J0Jztcbi8vIEB0cy1leHBlY3QtZXJyb3IgaWdub3JlIHR5cGUgZXJyb3JzXG5pbXBvcnQgcGx1Z2luUHJvbWlzZSBmcm9tICdlc2xpbnQtcGx1Z2luLXByb21pc2UnO1xuXG5pbXBvcnQgeyBpbmNsdWRlSWdub3JlRmlsZSB9IGZyb20gJ0Blc2xpbnQvY29tcGF0JztcbmltcG9ydCBwYXRoIGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAnbm9kZTp1cmwnO1xuXG5jb25zdCBfX2ZpbGVuYW1lID0gZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpO1xuY29uc3QgX19kaXJuYW1lID0gcGF0aC5kaXJuYW1lKF9fZmlsZW5hbWUpO1xuY29uc3QgZ2l0aWdub3JlUGF0aCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuZ2l0aWdub3JlJyk7XG5cbmNvbnN0IGVzbGludENvbmZpZzogQ29uZmlnW10gPSBkZWZpbmVDb25maWcoXG4gIHtcbiAgICBpZ25vcmVzOiBbXG4gICAgICAuLi4oaW5jbHVkZUlnbm9yZUZpbGUoZ2l0aWdub3JlUGF0aCkuaWdub3JlcyB8fCBbXSksXG4gICAgICAnKiovKi5kLnRzJyxcbiAgICAgICdzcmMvdHNjb25maWcuanNvbicsXG4gICAgICAnc3JjL3N0b3JpZXMnLFxuICAgICAgJyoqLyouY3NzJyxcbiAgICAgICdub2RlX21vZHVsZXMvKiovKicsXG4gICAgICAnb3V0JyxcbiAgICAgICdjZGsub3V0JyxcbiAgICAgICdkaXN0JyxcbiAgICAgICdhcHAnLFxuICAgIF0sXG4gIH0sXG4gIGVzbGludC5jb25maWdzLnJlY29tbWVuZGVkLFxuICBjb25maWdzLnN0cmljdCxcbiAgY29uZmlncy5zdHlsaXN0aWMsXG4gIHBsdWdpblByb21pc2UuY29uZmlnc1snZmxhdC9yZWNvbW1lbmRlZCddLFxuICB7XG4gICAgZmlsZXM6IFsnKiovKi50cycsICcqLmpzJ10sXG4gICAgcGx1Z2luczoge1xuICAgICAgJ0BzdHlsaXN0aWMnOiBzdHlsaXN0aWMsXG4gICAgfSxcbiAgICBsYW5ndWFnZU9wdGlvbnM6IHtcbiAgICAgIGVjbWFWZXJzaW9uOiAnbGF0ZXN0JyxcbiAgICAgIHNvdXJjZVR5cGU6ICdtb2R1bGUnLFxuICAgICAgcGFyc2VyLFxuICAgICAgcGFyc2VyT3B0aW9uczoge1xuICAgICAgICBwcm9qZWN0U2VydmljZTogdHJ1ZSxcbiAgICAgICAgdHNjb25maWdSb290RGlyOiBfX2Rpcm5hbWUsXG4gICAgICAgIGFsbG93RGVmYXVsdFByb2plY3Q6IFsnZXNsaW50LmNvbmZpZy50cyddLFxuICAgICAgfSxcbiAgICB9LFxuICAgIGV4dGVuZHM6IFtcbiAgICAgIGltcG9ydFBsdWdpbi5mbGF0Q29uZmlncy5yZWNvbW1lbmRlZCxcbiAgICAgIGltcG9ydFBsdWdpbi5mbGF0Q29uZmlncy50eXBlc2NyaXB0LFxuICAgIF0sXG4gICAgc2V0dGluZ3M6IHtcbiAgICAgICdpbXBvcnQvcmVzb2x2ZXInOiB7XG4gICAgICAgIC8vIFlvdSB3aWxsIGFsc28gbmVlZCB0byBpbnN0YWxsIGFuZCBjb25maWd1cmUgdGhlIFR5cGVTY3JpcHQgcmVzb2x2ZXJcbiAgICAgICAgLy8gU2VlIGFsc28gaHR0cHM6Ly9naXRodWIuY29tL2ltcG9ydC1qcy9lc2xpbnQtaW1wb3J0LXJlc29sdmVyLXR5cGVzY3JpcHQjY29uZmlndXJhdGlvblxuICAgICAgICAndHlwZXNjcmlwdCc6IHRydWUsXG4gICAgICAgICdub2RlJzogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBydWxlczoge1xuICAgICAgJ0BzdHlsaXN0aWMvc2VtaSc6IFsnZXJyb3InLCAnYWx3YXlzJ10sXG4gICAgICAnQHN0eWxpc3RpYy9pbmRlbnQnOiBbJ2Vycm9yJywgMl0sXG4gICAgICAnQHN0eWxpc3RpYy9jb21tYS1kYW5nbGUnOiBbJ2Vycm9yJywgJ2Fsd2F5cy1tdWx0aWxpbmUnXSxcbiAgICAgICdAc3R5bGlzdGljL2Fycm93LXBhcmVucyc6IFsnZXJyb3InLCAnYWx3YXlzJ10sXG4gICAgICAnQHN0eWxpc3RpYy9xdW90ZXMnOiBbJ2Vycm9yJywgJ3NpbmdsZSddLFxuICAgIH0sXG4gIH0sXG4pO1xuXG5leHBvcnQgZGVmYXVsdCBlc2xpbnRDb25maWc7XG4iXX0=