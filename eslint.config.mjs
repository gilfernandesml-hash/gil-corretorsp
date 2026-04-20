import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';

export default [
	{ ignores: ['node_modules/**', 'dist/**', 'build/**', 'vite.config.js', '**/*.timestamp-*'] },
	{
		files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
		plugins: { react, 'react-hooks': reactHooks, import: importPlugin },
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			parserOptions: { ecmaFeatures: { jsx: true } },
			globals: { ...globals.browser, React: 'readonly', Intl: 'readonly' },
		},
		settings: {
			react: { version: 'detect' },
			'import/resolver': {
				node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
				alias: { map: [['@', './src']], extensions: ['.js', '.jsx', '.ts', '.tsx'] },
			},
		},
		rules: {
			...react.configs.recommended.rules,
			...reactHooks.configs.recommended.rules,
			...importPlugin.flatConfigs.recommended.rules,

			// ============================================
			// CRITICAL RULES - Prevent runtime errors
			// ============================================
			'no-undef': 'error',
			'no-const-assign': 'error',
			'no-class-assign': 'error',
			'no-this-before-super': 'error',
			'no-unreachable': 'error',
			'no-shadow-restricted-names': 'error',

			// ============================================
			// REACT RULES
			// ============================================
			'react/jsx-key': 'error',
			'react/jsx-no-target-blank': 'error',
			'react/jsx-no-duplicate-props': 'error',
			'react/no-direct-mutation-state': 'error',
			'react/no-is-mounted': 'error',
			'react/no-string-refs': 'warn',
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',

			// Disabled: Not needed in React 17+
			'react/prop-types': 'off',
			'react/no-unescaped-entities': 'off',
			'react/display-name': 'off',
			'react/jsx-uses-react': 'off',
			'react/react-in-jsx-scope': 'off',
			'react/jsx-uses-vars': 'off',

			// ============================================
			// IMPORTS & MODULE QUALITY
			// ============================================
			'import/no-named-as-default': 'off',
			'import/no-named-as-default-member': 'off',
			'import/no-self-import': 'error',
			'import/no-cycle': 'off', // Disabled: expensive rule, rarely needed

			// ============================================
			// QUALITY OF LIFE (disabled for performance)
			// ============================================
			'no-unused-vars': 'off', // Covered by TypeScript later
		},
	},
	{ files: ['tools/**/*.js', 'tailwind.config.js'], languageOptions: { globals: globals.node } },
];
