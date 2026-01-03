<script lang="ts">
	import favicon from '$lib/assets/favicon.svg'
	import '../app.css'
	import { page } from '$app/state'

	let { children } = $props()

	const titleLetters = 'SKRRT!'.split('')

	const sections = [
		{
			title: 'Promise-like',
			links: [
				{ href: '/then', label: 'then' },
				{ href: '/catch', label: 'catchError' },
				{ href: '/race', label: 'race' },
				{ href: '/all', label: 'all' },
				{ href: '/all-settled', label: 'allSettled' }
			]
		},
		{
			title: 'Array Helpers',
			links: [
				{ href: '/map', label: 'map' },
				{ href: '/filter', label: 'filter' },
				{ href: '/reduce', label: 'reduce' },
				{ href: '/flatmap', label: 'flatMap' }
			]
		},
		{
			title: 'Utilities',
			links: [
				{ href: '/transform', label: 'transform' },
				{ href: '/with-default', label: 'withDefault' },
				{ href: '/chain', label: 'chain' },
				{ href: '/pipe', label: 'pipe' }
			]
		},
		{
			title: 'Demos',
			links: [
				{ href: '/demo-dashboard', label: 'Showcase' },
				{ href: '/demo-random', label: 'Chaos' },
				{ href: '/demo-polling', label: 'Realtime' },
				{ href: '/demo-pipeline', label: 'Datagrid' }
			]
		}
	]
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>RemoteResource Helpers</title>
</svelte:head>

<div class="layout">
	<aside class="nav">
		<div class="brand">
			<div class="brand-icon">
				<span class="brand-icon-racecar">🏎️</span>
				<span class="brand-icon-wind">💨</span>
			</div>
			<div class="brand-title">
				{#each titleLetters as letter}
					<span class="brand-letter">{letter}</span>
				{/each}
			</div>
			<div class="brand-description">SvelteKit Reactive Resource Tools</div>
		</div>

		<nav>
			<div class="nav-section">
				<div class="nav-links">
					<a
						href="/"
						class="nav-link"
						class:active={page.url.pathname === '/'}
					>
						Overview
					</a>
				</div>
			</div>

			{#each sections as section}
				<div class="nav-section">
					<div class="nav-section-title">{section.title}</div>
					<div class="nav-links">
						{#each section.links as link}
							<a
								href={link.href}
								class="nav-link"
								class:active={page.url.pathname === link.href}
							>
								{link.label}
							</a>
						{/each}
					</div>
				</div>
			{/each}
		</nav>
	</aside>

	<main class="main">
		{@render children()}
	</main>
</div>


<style>
	.brand {
		margin-bottom: 2rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		align-items: center;
		text-align: center;
	}

	.brand-icon {
		display: flex;
		align-items: baseline;
		gap: 0.25rem;
		line-height: 1;
		filter: sepia(100%) hue-rotate(-10deg) saturate(150%);
	}

	.brand-icon-racecar {
		font-size: 3.5rem;
	}

	.brand-icon-wind {
		font-size: 2rem;
	}

	.brand-title {
		font-size: 1.75rem;
		font-weight: 900;
		color: var(--accent-primary);
		letter-spacing: 0.15em;
		text-transform: uppercase;
		paint-order: stroke fill;
		-webkit-text-stroke: 1.5px rgba(0, 0, 0, 0.5);
		text-shadow: 
			-1px -1px 0 rgba(0, 0, 0, 0.8),
			1px -1px 0 rgba(0, 0, 0, 0.8),
			-1px 1px 0 rgba(0, 0, 0, 0.8),
			1px 1px 0 rgba(0, 0, 0, 0.8),
			0 2px 8px rgba(217, 119, 6, 0.3);
		transform: skew(-15deg);
		font-family: var(--font-display);
		display: inline-flex;
	}

	.brand-letter {
		display: inline-block;
		transform-origin: center;
	}

	.brand-letter:nth-child(1) { transform: rotate(-5deg); }
	.brand-letter:nth-child(2) { transform: rotate(3deg); }
	.brand-letter:nth-child(3) { transform: rotate(-4deg); }
	.brand-letter:nth-child(4) { transform: rotate(4deg); }
	.brand-letter:nth-child(5) { transform: rotate(-3deg); }
	.brand-letter:nth-child(6) { transform: rotate(6deg); }

	.brand-description {
		font-size: 0.7rem;
		color: var(--text-muted);
		font-weight: 400;
	}
</style>
