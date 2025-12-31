import js from '@eslint/js'
import ts from 'typescript-eslint'
import svelte from 'eslint-plugin-svelte'
import importPlugin from 'eslint-plugin-import'

export default ts.config(
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	{
		plugins: {
			import: importPlugin
		},
		settings: {
			'import/resolver': {
				typescript: true,
				node: true
			}
		},
		rules: {
			'import/extensions': ['error', 'always', {
				ignorePackages: true
			}]
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser
			}
		}
	},
	{
		ignores: [
			'.svelte-kit/',
			'node_modules/',
			'build/',
			'dist/'
		]
	}
)



