<script lang="ts">
	const features = [
		{
			icon: '🔄',
			title: 'then',
			description: 'Transform RemoteResource values reactively',
			href: '/then'
		},
		{
			icon: '🛡️',
			title: 'catchError',
			description: 'Handle errors with fallback values',
			href: '/catch'
		},
		{
			icon: '🏎️',
			title: 'race',
			description: 'Use the first resource to settle',
			href: '/race'
		},
		{
			icon: '📦',
			title: 'all',
			description: 'Combine multiple resources together',
			href: '/all'
		},
		{
			icon: '✅',
			title: 'allSettled',
			description: 'Wait for all resources to settle',
			href: '/all-settled'
		},
		{
			icon: '🗺️',
			title: 'map',
			description: 'Transform array items reactively',
			href: '/map'
		},
		{
			icon: '🔍',
			title: 'filter',
			description: 'Filter array items reactively',
			href: '/filter'
		},
		{
			icon: '📊',
			title: 'reduce',
			description: 'Reduce arrays to computed values',
			href: '/reduce'
		},
		{
			icon: '📋',
			title: 'flatMap',
			description: 'Map to arrays and flatten results',
			href: '/flatmap'
		},
		{
			icon: '⚡',
			title: 'transform',
			description: 'Transform with success and error handlers',
			href: '/transform'
		},
		{
			icon: '🎯',
			title: 'withDefault',
			description: 'Provide default values during loading',
			href: '/with-default'
		},
		{
			icon: '🔗',
			title: 'chain',
			description: 'Chain dependent resources together',
			href: '/chain'
		},
		{
			icon: '🧪',
			title: 'pipe',
			description: 'Effect-style composition',
			href: '/pipe'
		},
		{
			icon: '🎯',
			title: 'showcase',
			description: 'All helpers in a realistic e-commerce dashboard',
			href: '/demo-dashboard'
		},
		{
			icon: '🌀',
			title: 'chaos',
			description: 'Stress test with random delays and failures',
			href: '/demo-random'
		},
		{
			icon: '📡',
			title: 'realtime',
			description: 'Live data with continuous polling',
			href: '/demo-polling'
		},
		{
			icon: '📊',
			title: 'datagrid',
			description: 'Reactive sortable table with parallel loading',
			href: '/demo-pipeline'
		}
	]
</script>

<div class="page">
	<header class="hero">
		<h1 class="page-title">RemoteResource Helpers</h1>
		<p class="page-description">
			A collection of reactive helper functions for working with SvelteKit's RemoteResource.
			Compose, transform, and combine remote queries with full Svelte 5 reactivity.
		</p>
	</header>

	<section class="section">
		<h2>Promise-like Helpers</h2>
		<p class="section-description">
			These helpers mirror the familiar Promise API, but work reactively with RemoteResource.
		</p>

		<div class="feature-grid">
			{#each features.slice(0, 5) as feature}
				<a href={feature.href} class="feature-card">
					<div class="feature-icon">{feature.icon}</div>
					<div class="feature-title">{feature.title}</div>
					<div class="feature-description">{feature.description}</div>
				</a>
			{/each}
		</div>
	</section>

	<section class="section">
		<h2>Array Helpers</h2>
		<p class="section-description">
			Operate on arrays of RemoteResources with reactive versions of map, filter, reduce, and flatMap.
		</p>

		<div class="feature-grid">
			{#each features.slice(5, 9) as feature}
				<a href={feature.href} class="feature-card">
					<div class="feature-icon">{feature.icon}</div>
					<div class="feature-title">{feature.title}</div>
					<div class="feature-description">{feature.description}</div>
				</a>
			{/each}
		</div>
	</section>

	<section class="section">
		<h2>Utility Helpers</h2>
		<p class="section-description">
			Additional utilities for common patterns when working with remote data.
		</p>

		<div class="feature-grid">
			{#each features.slice(9, 13) as feature}
				<a href={feature.href} class="feature-card">
					<div class="feature-icon">{feature.icon}</div>
					<div class="feature-title">{feature.title}</div>
					<div class="feature-description">{feature.description}</div>
				</a>
			{/each}
		</div>
	</section>

	<section class="section">
		<h2>Demos</h2>
		<p class="section-description">
			Interactive demonstrations showcasing reactive helpers under various conditions.
		</p>

		<div class="feature-grid">
			{#each features.slice(13) as feature}
				<a href={feature.href} class="feature-card">
					<div class="feature-icon">{feature.icon}</div>
					<div class="feature-title">{feature.title}</div>
					<div class="feature-description">{feature.description}</div>
				</a>
			{/each}
		</div>
	</section>

	<section class="section">
		<h2>Usage</h2>

		<h3>Data-First API</h3>
		<div class="code-block">
			<pre><code>{`import { then, all, map, filter } from '$lib/RemoteResource.svelte'
import { getUsers, getPosts } from './demo.remote'

// Transform a single resource
const userNames = then(getUsers(), users => users.map(u => u.name))

// Combine multiple resources
const data = all([getUsers(), getPosts(1)])

// Array operations on resource data
const activeUsers = filter(getUsers(), user => user.active)
const userIds = map(getUsers(), user => user.id)`}</code></pre>
		</div>

		<h3>Effect-Style Pipeable API</h3>
		<div class="code-block">
			<pre><code>{`import { pipe, map, mapArray, catchError, combineWith } from '$lib/RemoteResourcePipeline.svelte'
import { getUser } from './demo.remote'

// Compose transformations with pipe
const result = pipe(
  [getUser(1), getUser(2), getUser(3)],
  mapArray(user => user.name),
  map(names => names.join(', '))
)

// Error handling in pipeline
const safe = pipe(
  riskyResource,
  catchError(() => fallback),
  map(v => v.data)
)

// Combine with transformation
const combined = combineWith(
  [userResource, profileResource] as const,
  ([user, profile]) => ({ ...user, avatar: profile.avatar })
)`}</code></pre>
		</div>
	</section>
</div>
