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
			icon: '⏱️',
			title: 'timeout',
			description: 'Fail if not ready in time',
			href: '/timeout'
		},
		{
			icon: '⏳',
			title: 'delay',
			description: 'Minimum loading time for smooth UX',
			href: '/delay'
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
		<h1 class="page-title">SvelteKit Reactive Resource Tools</h1>
		<p class="page-description">
			🏎️ 💨 *skrrt skrrt* 🏎️ 💨
		</p>

		<p class="page-description">
			<strong>SvelteKit Reactive Resource Tools</strong> extend the functionality of <a href="https://github.com/sveltejs/kit/blob/0280f4b03bfb48899d9eee212b21499d746c73b9/packages/kit/types/index.d.ts#L2090-L2106" target="_blank" rel="noopener noreferrer"><code>RemoteResource</code></a>, the <strong>reactive <code>Promise</code>-like objects</strong> returned by <a href="https://svelte.dev/docs/kit/remote-functions#query" target="_blank" rel="noopener noreferrer"><code>query()</code> remote functions</a>  in <a href="https://svelte.dev/docs/kit/remote-functions" target="_blank" rel="noopener noreferrer">SvelteKit 2.27+</a>.
		</p>

		<h2>Motivation</h2>

		<p class="page-description">
			<code>RemoteResource</code> implements the JavaScript <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise" target="_blank" rel="noopener noreferrer">Promise</a> interface (<code>then</code>, <code>catch</code>, <code>finally</code>) while also exposing progress and resolved values through reactive properties <code>loading</code>, <code>error</code>, <code>ready</code>, and <code>current</code>.
		</p>

<code><a href="https://github.com/sveltejs/kit/blob/0280f4b03bfb48899d9eee212b21499d746c73b9/packages/kit/types/index.d.ts#L2090-L2106" target="_blank" rel="noopener noreferrer">packages/kit/types/index.d.ts</a></code>:
<pre><code>{`export type RemoteResource<T> = (
	& Promise<Awaited<T>>

	& {
		/** The error in case the query fails. */
		get error(): any

		/** \`true\` before the first result is available and during refreshes */
		get loading(): boolean
	}

	& (
		| {
			/** The current value of the query. Undefined until \`ready\` is \`true\` */
			get current(): undefined

			ready: false
		}
		| {
			/** The current value of the query. Undefined until \`ready\` is \`true\` */
			get current(): Awaited<T>

			ready: true
		}
	)
)`}</code></pre>

		<p class="page-description">
			This design makes consuming these states and values in Svelte markup trivial, especially when paired with <code>&lt;svelte:boundary&gt;</code> + <code>await</code> introduced in <a href="https://svelte.dev/docs/svelte/await-expressions" target="_blank" rel="noopener noreferrer">Svelte 5.36+</a>:
		</p>

		<div class="code-block">
			<pre><code>{`<svelte:boundary>
	{@const users = await getUsers()}

	{#snippet pending()}
		<div>Loading users...</div>
	{/snippet}

	{#snippet failed(error, retry)}
		<div>Error: {error.message}</div>
	{/snippet}

	{#each users as user}
		<div>{user.name}</div>
	{/each}
</svelte:boundary>`}</code></pre>
		</div>

		<p class="page-description">But what if you want to query a resource based on the value of another, or combine values of many resources in parallel, <strong>while tracking reactive updates associated with each step along the way?</strong></p>
		<div class="code-block">
			<pre><code>{`// Chaining queries - need value from first to call second
{@const user = await getUser(userId)}
{@const posts = await getPosts(user.id)}
// Must await user first, so can't show posts.loading
// while user is still loading`}</code></pre>
		</div>
		<div class="code-block">
			<pre><code>{`// Mapping over array - Promise.all returns values
{@const userIds = await getUserIds()}
{@const users = await Promise.all(
  userIds.map(id => getUser(id))
)}
// users is an array of values, not RemoteResources
// Can't show which individual users are still loading`}</code></pre>
		</div>
		<div class="code-block">
			<pre><code>{`// Combining resources - Promise.all returns values
{@const [users, posts] = await Promise.all([
  getUsers(),
  getPosts()
])}
// Result is values, not RemoteResources
// Can't reactively check if users.loading or posts.loading`}</code></pre>
		</div>
		<p class="page-description">
			Each helper creates a new <code>RemoteResource</code> that derives from existing ones using <a href="https://svelte.dev/docs/svelte/what-are-runes" target="_blank" rel="noopener noreferrer">Svelte 5's <code>$derived</code> runes</a>, automatically tracking loading states and reactive updates. Your UI updates incrementally as each resource resolves—you see partial and intermediate states, not just the final result.
		</p>
		<p class="page-description">
			Work with async data in parallel using <code>all</code> or <code>race</code>, or in series using <code>chain</code> for dependent queries. Reactive updates flow through each transformation, keeping your UI synchronized throughout the loading process without manual state management.
		</p>
		<p class="page-description">
			The library includes <strong>Promise-like helpers</strong> for composition, <strong>array helpers</strong> for reactive transformations, <strong>utility helpers</strong> for error handling and chaining, <strong>timing helpers</strong> for delays and timeouts, <strong>composition</strong> via <code>pipe</code>, and interactive <strong>demos</strong>.
		</p>
	</header>

	<section class="section">
		<h2>Promise-like Helpers</h2>
		<p class="section-description">
			Promise composition patterns with reactive updates.
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
			Reactive array operations on RemoteResource collections.
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
			Error handling, chaining dependent queries, and transforming with success/error handlers.
		</p>

		<div class="feature-grid">
			{#each features.slice(9, 12) as feature}
				<a href={feature.href} class="feature-card">
					<div class="feature-icon">{feature.icon}</div>
					<div class="feature-title">{feature.title}</div>
					<div class="feature-description">{feature.description}</div>
				</a>
			{/each}
		</div>
	</section>

	<section class="section">
		<h2>Timing Helpers</h2>
		<p class="section-description">
			Minimum delays to prevent loading flashes, and timeouts for fail-fast behavior.
		</p>

		<div class="feature-grid">
			{#each features.slice(12, 14) as feature}
				<a href={feature.href} class="feature-card">
					<div class="feature-icon">{feature.icon}</div>
					<div class="feature-title">{feature.title}</div>
					<div class="feature-description">{feature.description}</div>
				</a>
			{/each}
		</div>
	</section>

	<section class="section">
		<h2>Composition</h2>
		<p class="section-description">
			Effect-style composition for chaining transformations with reactive updates.
		</p>

		<div class="feature-grid">
			{#each features.slice(14, 15) as feature}
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
			Interactive examples: dashboards, chaos testing, real-time polling, and data pipelines.
		</p>

		<div class="feature-grid">
			{#each features.slice(15) as feature}
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
			<pre><code>{`import { derive, all, map, filter } from 'skrrt'
import { getUsers, getPosts } from './demo.remote'

// Transform a single resource
const userNames = derive(getUsers(), users => users.map(u => u.name))

// Combine multiple resources
const data = all([getUsers(), getPosts(1)])

// Array operations on resource data
const activeUsers = filter(getUsers(), user => user.active)
const userIds = map(getUsers(), user => user.id)`}</code></pre>
		</div>

		<h3>Effect-Style Pipeable API</h3>
		<div class="code-block">
			<pre><code>{`import { pipe, map, mapArray, catchError, combineWith } from 'skrrt'
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
