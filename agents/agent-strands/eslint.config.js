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
        '**/*.js',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXNsaW50LmNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImVzbGludC5jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFVLFlBQVksRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNyRCxPQUFPLE1BQU0sTUFBTSxZQUFZLENBQUM7QUFDaEMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNwRCxPQUFPLFNBQVMsTUFBTSwwQkFBMEIsQ0FBQztBQUNqRCxPQUFPLFlBQVksTUFBTSxzQkFBc0IsQ0FBQztBQUNoRCxzQ0FBc0M7QUFDdEMsT0FBTyxhQUFhLE1BQU0sdUJBQXVCLENBQUM7QUFFbEQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDbkQsT0FBTyxJQUFJLE1BQU0sV0FBVyxDQUFDO0FBQzdCLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFekMsTUFBTSxVQUFVLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUMzQyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUU1RCxNQUFNLFlBQVksR0FBYSxZQUFZLENBQ3pDO0lBQ0UsT0FBTyxFQUFFO1FBQ1AsR0FBRyxDQUFDLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUM7UUFDbkQsV0FBVztRQUNYLG1CQUFtQjtRQUNuQixhQUFhO1FBQ2IsVUFBVTtRQUNWLG1CQUFtQjtRQUNuQixLQUFLO1FBQ0wsU0FBUztRQUNULE1BQU07UUFDTixLQUFLO1FBQ0wsU0FBUztLQUNWO0NBQ0YsRUFDRCxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFDMUIsT0FBTyxDQUFDLE1BQU0sRUFDZCxPQUFPLENBQUMsU0FBUyxFQUNqQixhQUFhLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLEVBQ3pDO0lBQ0UsS0FBSyxFQUFFLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQztJQUMxQixPQUFPLEVBQUU7UUFDUCxZQUFZLEVBQUUsU0FBUztLQUN4QjtJQUNELGVBQWUsRUFBRTtRQUNmLFdBQVcsRUFBRSxRQUFRO1FBQ3JCLFVBQVUsRUFBRSxRQUFRO1FBQ3BCLE1BQU07UUFDTixhQUFhLEVBQUU7WUFDYixjQUFjLEVBQUUsSUFBSTtZQUNwQixlQUFlLEVBQUUsU0FBUztZQUMxQixtQkFBbUIsRUFBRSxDQUFDLGtCQUFrQixDQUFDO1NBQzFDO0tBQ0Y7SUFDRCxPQUFPLEVBQUU7UUFDUCxZQUFZLENBQUMsV0FBVyxDQUFDLFdBQVc7UUFDcEMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxVQUFVO0tBQ3BDO0lBQ0QsUUFBUSxFQUFFO1FBQ1IsaUJBQWlCLEVBQUU7WUFDakIsc0VBQXNFO1lBQ3RFLHdGQUF3RjtZQUN4RixZQUFZLEVBQUUsSUFBSTtZQUNsQixNQUFNLEVBQUUsSUFBSTtTQUNiO0tBQ0Y7SUFDRCxLQUFLLEVBQUU7UUFDTCxpQkFBaUIsRUFBRSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUM7UUFDdEMsbUJBQW1CLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ2pDLHlCQUF5QixFQUFFLENBQUMsT0FBTyxFQUFFLGtCQUFrQixDQUFDO1FBQ3hELHlCQUF5QixFQUFFLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQztRQUM5QyxtQkFBbUIsRUFBRSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUM7S0FDekM7Q0FDRixDQUNGLENBQUM7QUFFRixlQUFlLFlBQVksQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbmZpZywgZGVmaW5lQ29uZmlnIH0gZnJvbSAnZXNsaW50L2NvbmZpZyc7XG5pbXBvcnQgZXNsaW50IGZyb20gJ0Blc2xpbnQvanMnO1xuaW1wb3J0IHsgY29uZmlncywgcGFyc2VyIH0gZnJvbSAndHlwZXNjcmlwdC1lc2xpbnQnO1xuaW1wb3J0IHN0eWxpc3RpYyBmcm9tICdAc3R5bGlzdGljL2VzbGludC1wbHVnaW4nO1xuaW1wb3J0IGltcG9ydFBsdWdpbiBmcm9tICdlc2xpbnQtcGx1Z2luLWltcG9ydCc7XG4vLyBAdHMtZXhwZWN0LWVycm9yIGlnbm9yZSB0eXBlIGVycm9yc1xuaW1wb3J0IHBsdWdpblByb21pc2UgZnJvbSAnZXNsaW50LXBsdWdpbi1wcm9taXNlJztcblxuaW1wb3J0IHsgaW5jbHVkZUlnbm9yZUZpbGUgfSBmcm9tICdAZXNsaW50L2NvbXBhdCc7XG5pbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ25vZGU6dXJsJztcblxuY29uc3QgX19maWxlbmFtZSA9IGZpbGVVUkxUb1BhdGgoaW1wb3J0Lm1ldGEudXJsKTtcbmNvbnN0IF9fZGlybmFtZSA9IHBhdGguZGlybmFtZShfX2ZpbGVuYW1lKTtcbmNvbnN0IGdpdGlnbm9yZVBhdGggPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLmdpdGlnbm9yZScpO1xuXG5jb25zdCBlc2xpbnRDb25maWc6IENvbmZpZ1tdID0gZGVmaW5lQ29uZmlnKFxuICB7XG4gICAgaWdub3JlczogW1xuICAgICAgLi4uKGluY2x1ZGVJZ25vcmVGaWxlKGdpdGlnbm9yZVBhdGgpLmlnbm9yZXMgfHwgW10pLFxuICAgICAgJyoqLyouZC50cycsXG4gICAgICAnc3JjL3RzY29uZmlnLmpzb24nLFxuICAgICAgJ3NyYy9zdG9yaWVzJyxcbiAgICAgICcqKi8qLmNzcycsXG4gICAgICAnbm9kZV9tb2R1bGVzLyoqLyonLFxuICAgICAgJ291dCcsXG4gICAgICAnY2RrLm91dCcsXG4gICAgICAnZGlzdCcsXG4gICAgICAnYXBwJyxcbiAgICAgICcqKi8qLmpzJyxcbiAgICBdLFxuICB9LFxuICBlc2xpbnQuY29uZmlncy5yZWNvbW1lbmRlZCxcbiAgY29uZmlncy5zdHJpY3QsXG4gIGNvbmZpZ3Muc3R5bGlzdGljLFxuICBwbHVnaW5Qcm9taXNlLmNvbmZpZ3NbJ2ZsYXQvcmVjb21tZW5kZWQnXSxcbiAge1xuICAgIGZpbGVzOiBbJyoqLyoudHMnLCAnKi5qcyddLFxuICAgIHBsdWdpbnM6IHtcbiAgICAgICdAc3R5bGlzdGljJzogc3R5bGlzdGljLFxuICAgIH0sXG4gICAgbGFuZ3VhZ2VPcHRpb25zOiB7XG4gICAgICBlY21hVmVyc2lvbjogJ2xhdGVzdCcsXG4gICAgICBzb3VyY2VUeXBlOiAnbW9kdWxlJyxcbiAgICAgIHBhcnNlcixcbiAgICAgIHBhcnNlck9wdGlvbnM6IHtcbiAgICAgICAgcHJvamVjdFNlcnZpY2U6IHRydWUsXG4gICAgICAgIHRzY29uZmlnUm9vdERpcjogX19kaXJuYW1lLFxuICAgICAgICBhbGxvd0RlZmF1bHRQcm9qZWN0OiBbJ2VzbGludC5jb25maWcudHMnXSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBleHRlbmRzOiBbXG4gICAgICBpbXBvcnRQbHVnaW4uZmxhdENvbmZpZ3MucmVjb21tZW5kZWQsXG4gICAgICBpbXBvcnRQbHVnaW4uZmxhdENvbmZpZ3MudHlwZXNjcmlwdCxcbiAgICBdLFxuICAgIHNldHRpbmdzOiB7XG4gICAgICAnaW1wb3J0L3Jlc29sdmVyJzoge1xuICAgICAgICAvLyBZb3Ugd2lsbCBhbHNvIG5lZWQgdG8gaW5zdGFsbCBhbmQgY29uZmlndXJlIHRoZSBUeXBlU2NyaXB0IHJlc29sdmVyXG4gICAgICAgIC8vIFNlZSBhbHNvIGh0dHBzOi8vZ2l0aHViLmNvbS9pbXBvcnQtanMvZXNsaW50LWltcG9ydC1yZXNvbHZlci10eXBlc2NyaXB0I2NvbmZpZ3VyYXRpb25cbiAgICAgICAgJ3R5cGVzY3JpcHQnOiB0cnVlLFxuICAgICAgICAnbm9kZSc6IHRydWUsXG4gICAgICB9LFxuICAgIH0sXG4gICAgcnVsZXM6IHtcbiAgICAgICdAc3R5bGlzdGljL3NlbWknOiBbJ2Vycm9yJywgJ2Fsd2F5cyddLFxuICAgICAgJ0BzdHlsaXN0aWMvaW5kZW50JzogWydlcnJvcicsIDJdLFxuICAgICAgJ0BzdHlsaXN0aWMvY29tbWEtZGFuZ2xlJzogWydlcnJvcicsICdhbHdheXMtbXVsdGlsaW5lJ10sXG4gICAgICAnQHN0eWxpc3RpYy9hcnJvdy1wYXJlbnMnOiBbJ2Vycm9yJywgJ2Fsd2F5cyddLFxuICAgICAgJ0BzdHlsaXN0aWMvcXVvdGVzJzogWydlcnJvcicsICdzaW5nbGUnXSxcbiAgICB9LFxuICB9LFxuKTtcblxuZXhwb3J0IGRlZmF1bHQgZXNsaW50Q29uZmlnO1xuIl19