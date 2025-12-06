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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXNsaW50LmNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImVzbGludC5jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFVLFlBQVksRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNyRCxPQUFPLE1BQU0sTUFBTSxZQUFZLENBQUM7QUFDaEMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNwRCxPQUFPLFNBQVMsTUFBTSwwQkFBMEIsQ0FBQztBQUNqRCxPQUFPLFlBQVksTUFBTSxzQkFBc0IsQ0FBQztBQUNoRCxzQ0FBc0M7QUFDdEMsT0FBTyxhQUFhLE1BQU0sdUJBQXVCLENBQUM7QUFFbEQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDbkQsT0FBTyxJQUFJLE1BQU0sV0FBVyxDQUFDO0FBQzdCLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFekMsTUFBTSxVQUFVLEdBQUcsYUFBYSxDQUFDLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDM0MsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFFNUQsTUFBTSxZQUFZLEdBQWEsWUFBWSxDQUN6QztJQUNFLE9BQU8sRUFBRTtRQUNQLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDO1FBQ25ELFdBQVc7UUFDWCxtQkFBbUI7UUFDbkIsYUFBYTtRQUNiLFVBQVU7UUFDVixtQkFBbUI7UUFDbkIsS0FBSztRQUNMLFNBQVM7UUFDVCxNQUFNO1FBQ04sS0FBSztRQUNMLFNBQVM7S0FDVjtDQUNGLEVBQ0QsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQzFCLE9BQU8sQ0FBQyxNQUFNLEVBQ2QsT0FBTyxDQUFDLFNBQVMsRUFDakIsYUFBYSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxFQUN6QztJQUNFLEtBQUssRUFBRSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUM7SUFDMUIsT0FBTyxFQUFFO1FBQ1AsWUFBWSxFQUFFLFNBQVM7S0FDeEI7SUFDRCxlQUFlLEVBQUU7UUFDZixXQUFXLEVBQUUsUUFBUTtRQUNyQixVQUFVLEVBQUUsUUFBUTtRQUNwQixNQUFNO1FBQ04sYUFBYSxFQUFFO1lBQ2IsY0FBYyxFQUFFLElBQUk7WUFDcEIsZUFBZSxFQUFFLFNBQVM7WUFDMUIsbUJBQW1CLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQztTQUMxQztLQUNGO0lBQ0QsT0FBTyxFQUFFO1FBQ1AsWUFBWSxDQUFDLFdBQVcsQ0FBQyxXQUFXO1FBQ3BDLFlBQVksQ0FBQyxXQUFXLENBQUMsVUFBVTtLQUNwQztJQUNELFFBQVEsRUFBRTtRQUNSLGlCQUFpQixFQUFFO1lBQ2pCLHNFQUFzRTtZQUN0RSx3RkFBd0Y7WUFDeEYsWUFBWSxFQUFFLElBQUk7WUFDbEIsTUFBTSxFQUFFLElBQUk7U0FDYjtLQUNGO0lBQ0QsS0FBSyxFQUFFO1FBQ0wsaUJBQWlCLEVBQUUsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDO1FBQ3RDLG1CQUFtQixFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUNqQyx5QkFBeUIsRUFBRSxDQUFDLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQztRQUN4RCx5QkFBeUIsRUFBRSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUM7UUFDOUMsbUJBQW1CLEVBQUUsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDO0tBQ3pDO0NBQ0YsQ0FDRixDQUFDO0FBRUYsZUFBZSxZQUFZLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb25maWcsIGRlZmluZUNvbmZpZyB9IGZyb20gJ2VzbGludC9jb25maWcnO1xuaW1wb3J0IGVzbGludCBmcm9tICdAZXNsaW50L2pzJztcbmltcG9ydCB7IGNvbmZpZ3MsIHBhcnNlciB9IGZyb20gJ3R5cGVzY3JpcHQtZXNsaW50JztcbmltcG9ydCBzdHlsaXN0aWMgZnJvbSAnQHN0eWxpc3RpYy9lc2xpbnQtcGx1Z2luJztcbmltcG9ydCBpbXBvcnRQbHVnaW4gZnJvbSAnZXNsaW50LXBsdWdpbi1pbXBvcnQnO1xuLy8gQHRzLWV4cGVjdC1lcnJvciBpZ25vcmUgdHlwZSBlcnJvcnNcbmltcG9ydCBwbHVnaW5Qcm9taXNlIGZyb20gJ2VzbGludC1wbHVnaW4tcHJvbWlzZSc7XG5cbmltcG9ydCB7IGluY2x1ZGVJZ25vcmVGaWxlIH0gZnJvbSAnQGVzbGludC9jb21wYXQnO1xuaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICdub2RlOnVybCc7XG5cbmNvbnN0IF9fZmlsZW5hbWUgPSBmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCk7XG5jb25zdCBfX2Rpcm5hbWUgPSBwYXRoLmRpcm5hbWUoX19maWxlbmFtZSk7XG5jb25zdCBnaXRpZ25vcmVQYXRoID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy5naXRpZ25vcmUnKTtcblxuY29uc3QgZXNsaW50Q29uZmlnOiBDb25maWdbXSA9IGRlZmluZUNvbmZpZyhcbiAge1xuICAgIGlnbm9yZXM6IFtcbiAgICAgIC4uLihpbmNsdWRlSWdub3JlRmlsZShnaXRpZ25vcmVQYXRoKS5pZ25vcmVzIHx8IFtdKSxcbiAgICAgICcqKi8qLmQudHMnLFxuICAgICAgJ3NyYy90c2NvbmZpZy5qc29uJyxcbiAgICAgICdzcmMvc3RvcmllcycsXG4gICAgICAnKiovKi5jc3MnLFxuICAgICAgJ25vZGVfbW9kdWxlcy8qKi8qJyxcbiAgICAgICdvdXQnLFxuICAgICAgJ2Nkay5vdXQnLFxuICAgICAgJ2Rpc3QnLFxuICAgICAgJ2FwcCcsXG4gICAgICAnKiovKi5qcycsXG4gICAgXSxcbiAgfSxcbiAgZXNsaW50LmNvbmZpZ3MucmVjb21tZW5kZWQsXG4gIGNvbmZpZ3Muc3RyaWN0LFxuICBjb25maWdzLnN0eWxpc3RpYyxcbiAgcGx1Z2luUHJvbWlzZS5jb25maWdzWydmbGF0L3JlY29tbWVuZGVkJ10sXG4gIHtcbiAgICBmaWxlczogWycqKi8qLnRzJywgJyouanMnXSxcbiAgICBwbHVnaW5zOiB7XG4gICAgICAnQHN0eWxpc3RpYyc6IHN0eWxpc3RpYyxcbiAgICB9LFxuICAgIGxhbmd1YWdlT3B0aW9uczoge1xuICAgICAgZWNtYVZlcnNpb246ICdsYXRlc3QnLFxuICAgICAgc291cmNlVHlwZTogJ21vZHVsZScsXG4gICAgICBwYXJzZXIsXG4gICAgICBwYXJzZXJPcHRpb25zOiB7XG4gICAgICAgIHByb2plY3RTZXJ2aWNlOiB0cnVlLFxuICAgICAgICB0c2NvbmZpZ1Jvb3REaXI6IF9fZGlybmFtZSxcbiAgICAgICAgYWxsb3dEZWZhdWx0UHJvamVjdDogWydlc2xpbnQuY29uZmlnLnRzJ10sXG4gICAgICB9LFxuICAgIH0sXG4gICAgZXh0ZW5kczogW1xuICAgICAgaW1wb3J0UGx1Z2luLmZsYXRDb25maWdzLnJlY29tbWVuZGVkLFxuICAgICAgaW1wb3J0UGx1Z2luLmZsYXRDb25maWdzLnR5cGVzY3JpcHQsXG4gICAgXSxcbiAgICBzZXR0aW5nczoge1xuICAgICAgJ2ltcG9ydC9yZXNvbHZlcic6IHtcbiAgICAgICAgLy8gWW91IHdpbGwgYWxzbyBuZWVkIHRvIGluc3RhbGwgYW5kIGNvbmZpZ3VyZSB0aGUgVHlwZVNjcmlwdCByZXNvbHZlclxuICAgICAgICAvLyBTZWUgYWxzbyBodHRwczovL2dpdGh1Yi5jb20vaW1wb3J0LWpzL2VzbGludC1pbXBvcnQtcmVzb2x2ZXItdHlwZXNjcmlwdCNjb25maWd1cmF0aW9uXG4gICAgICAgICd0eXBlc2NyaXB0JzogdHJ1ZSxcbiAgICAgICAgJ25vZGUnOiB0cnVlLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHJ1bGVzOiB7XG4gICAgICAnQHN0eWxpc3RpYy9zZW1pJzogWydlcnJvcicsICdhbHdheXMnXSxcbiAgICAgICdAc3R5bGlzdGljL2luZGVudCc6IFsnZXJyb3InLCAyXSxcbiAgICAgICdAc3R5bGlzdGljL2NvbW1hLWRhbmdsZSc6IFsnZXJyb3InLCAnYWx3YXlzLW11bHRpbGluZSddLFxuICAgICAgJ0BzdHlsaXN0aWMvYXJyb3ctcGFyZW5zJzogWydlcnJvcicsICdhbHdheXMnXSxcbiAgICAgICdAc3R5bGlzdGljL3F1b3Rlcyc6IFsnZXJyb3InLCAnc2luZ2xlJ10sXG4gICAgfSxcbiAgfSxcbik7XG5cbmV4cG9ydCBkZWZhdWx0IGVzbGludENvbmZpZztcbiJdfQ==