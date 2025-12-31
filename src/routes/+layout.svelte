<script lang="ts">
	import favicon from '$lib/assets/favicon.svg'
	import '../app.css'
	import { page } from '$app/state'

	let { children } = $props()

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
	<aside class="sidebar">
		<div class="sidebar-title">
			⚡ RemoteResource
		</div>

		<nav>
			<div class="sidebar-section">
				<div class="sidebar-nav">
					<a
						href="/"
						class="sidebar-link"
						class:active={page.url.pathname === '/'}
					>
						Overview
					</a>
				</div>
			</div>

			{#each sections as section}
				<div class="sidebar-section">
					<div class="sidebar-section-title">{section.title}</div>
					<div class="sidebar-nav">
						{#each section.links as link}
							<a
								href={link.href}
								class="sidebar-link"
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
