// @ts-check
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import starlightLlmsTxt from 'starlight-llms-txt';

/**
 * The public URL the site is deployed to. `llms.txt` and `llms-full.txt` embed absolute
 * links, so this has to be the real origin in any build that gets published — set
 * `DOCS_SITE` in the deploy environment. The localhost default keeps `npm run docs:build`
 * working locally without inventing a production URL here.
 */
const site = process.env.DOCS_SITE ?? 'http://localhost:4321';

export default defineConfig( {
	site,
	integrations: [
		starlight( {
			title: '@isudev/gutenberg',
			description:
				'Standalone components, controls, fields and hooks for the WordPress Gutenberg editor.',
			/**
			 * Emits /llms.txt, /llms-full.txt and /llms-small.txt. Coding agents in Cursor,
			 * Copilot, Claude Code and others fetch these when pointed at a docs site, so
			 * they are the reason this site exists as much as the HTML is.
			 */
			plugins: [
				starlightLlmsTxt( {
					projectName: '@isudev/gutenberg',
					description:
						'Components, controls, fields and hooks for building WordPress Gutenberg blocks. Consumed per component via subpath exports; nothing but @wordpress/* and React at runtime.',
					details:
						'Import from the narrowest public subpath. Nothing is read from a global registry — icons, option lists and configuration are passed in as props.',
				} ),
			],
			sidebar: [
				{ label: 'Overview', link: '/' },
				{ label: 'Guide for coding agents', link: '/agents/' },
				{
					label: 'Reference',
					items: [ { autogenerate: { directory: 'reference' } } ],
				},
			],
			customCss: [ './src/styles/docs.css' ],
			lastUpdated: true,
		} ),
	],
} );
