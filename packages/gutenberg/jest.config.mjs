/**
 * Jest runs against TypeScript sources via @swc/jest — no Babel config, and fast enough
 * that the whole suite stays in the edit loop. JSX uses the automatic runtime with
 * react as the import source, matching tsconfig.base.json and decision 0002.
 */
export default {
	testEnvironment: 'jsdom',
	setupFilesAfterEnv: [ '<rootDir>/tests/setup.ts' ],
	testMatch: [ '<rootDir>/src/**/*.test.ts', '<rootDir>/src/**/*.test.tsx', '<rootDir>/tests/**/*.test.ts' ],
	transform: {
		'^.+\\.(t|j)sx?$': [
			'@swc/jest',
			{
				jsc: {
					parser: { syntax: 'typescript', tsx: true },
					transform: { react: { runtime: 'automatic', importSource: 'react' } },
					target: 'es2021',
				},
			},
		],
	},
};
