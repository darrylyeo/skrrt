<script lang="ts">
	import { pipe, map, mapArray, filterArray, catchError, combineWith } from '$lib/RemoteResourcePipeline.svelte'
	import { getUser, getPrice, getFailure } from '../demo.remote'
	import Boundary from '$lib/components/Boundary.svelte'
</script>

<div class="page">
	<a href="/" class="page-back">← Back to Home</a>

	<header class="page-header">
		<h1 class="page-title">pipe()</h1>
		<p class="page-description">
			Effect-style composition of RemoteResource transformations.
			A clean, functional API for building reactive data pipelines.
		</p>
	</header>

	<section class="section">
		<h2>Usage</h2>
		<div class="code-block">
			<pre><code>{`import { pipe, map, mapArray, filterArray, catchError, combineWith } from '$lib/RemoteResourcePipeline.svelte'

// Transform array of resources
const userNames = pipe(
  users,                         // RemoteResource<User>[]
  mapArray(user => user.name),   // RemoteResource<string[]>
  map(names => names.join(', ')) // RemoteResource<string>
)

// Filter + reduce (filterArray returns RemoteResource<T[]>)
const total = pipe(
  prices,                          // RemoteResource<number>[]
  filterArray(p => p > 30),        // RemoteResource<number[]>
  map(arr => arr.reduce((s,p) => s+p, 0)) // RemoteResource<number>
)

// Error handling
const safe = pipe(
  riskyResource,
  catchError(() => fallbackValue)
)

// Combine with transformation
const combined = combineWith(
  [resource1, resource2, resource3] as const,
  ([a, b, c]) => ({ a, b, c })
)`}</code></pre>
		</div>
	</section>

	<section class="section">
		<Boundary>
			{@const users = [1, 2, 3, 4, 5].map(id => getUser(id))}
			{@const userNames = pipe(users, mapArray(user => user.name), map(names => names.join(', ')))}
			{@const refresh = () => users.forEach(u => u.refresh())}
			<div class="section-header">
				<h2>Example 1: Map Array → Map</h2>
				{#if userNames.loading}
					<button class="status status-loading" onclick={refresh} aria-label="Loading"><span class="spinner"></span></button>
				{:else}
					<button class="status status-success" onclick={refresh} aria-label="Refresh">↻</button>
				{/if}
			</div>
			<p>Transform an array of user resources to a comma-separated string of names.</p>
			<div class="demo-box">
				{#if userNames.loading}
					<p class="loading">Loading users...</p>
				{/if}
				{#if userNames.ready}
					<p class="success">Names: {userNames.current}</p>
				{/if}
				{#if userNames.error}
					<p class="error">Error: {userNames.error}</p>
				{/if}
			</div>
		</Boundary>
	</section>

	<section class="section">
		<Boundary>
			{@const prices = [0, 1, 2, 3, 4].map(id => getPrice(id))}
			{@const expensiveTotal = pipe(prices, filterArray(price => price > 30), map(filtered => filtered.reduce((sum, p) => sum + p, 0)))}
			{@const refresh = () => prices.forEach(p => p.refresh())}
			<div class="section-header">
				<h2>Example 2: Filter Array → Map</h2>
				{#if expensiveTotal.loading}
					<button class="status status-loading" onclick={refresh} aria-label="Loading"><span class="spinner"></span></button>
				{:else}
					<button class="status status-success" onclick={refresh} aria-label="Refresh">↻</button>
				{/if}
			</div>
			<p>Filter prices greater than $30, then sum them.</p>
			<div class="demo-box">
				{#if expensiveTotal.loading}
					<p class="loading">Calculating...</p>
				{/if}
				{#if expensiveTotal.ready}
					<p class="success">Total of expensive items (&gt;$30): ${expensiveTotal.current?.toFixed(2)}</p>
				{/if}
				{#if expensiveTotal.error}
					<p class="error">Error: {expensiveTotal.error}</p>
				{/if}
			</div>
		</Boundary>
	</section>

	<section class="section">
		<Boundary>
			{@const failingResource = getFailure()}
			{@const safeValue = pipe(failingResource, catchError(() => ({ status: 'fallback', message: 'Error was handled' })))}
			{@const refresh = () => failingResource.refresh()}
			<div class="section-header">
				<h2>Example 3: Error Handling</h2>
				{#if safeValue.loading}
					<button class="status status-loading" onclick={refresh} aria-label="Loading"><span class="spinner"></span></button>
				{:else}
					<button class="status status-success" onclick={refresh} aria-label="Refresh">↻</button>
				{/if}
			</div>
			<p>A failing resource recovered with catchError.</p>
			<div class="demo-box">
				{#if safeValue.loading}
					<p class="loading">Loading...</p>
				{/if}
				{#if safeValue.ready}
					<p class="success">
						Status: {safeValue.current?.status}<br>
						Message: {safeValue.current?.message}
					</p>
				{/if}
			</div>
		</Boundary>
	</section>

	<section class="section">
		<Boundary>
			{@const combinedUsers = [getUser(1), getUser(2), getUser(3)] as const}
			{@const combined = combineWith(combinedUsers, ([alice, bob, charlie]) => ({
				team: [alice.name, bob.name, charlie.name],
				allActive: alice.active && bob.active && charlie.active
			}))}
			{@const refresh = () => combinedUsers.forEach(u => u.refresh())}
			<div class="section-header">
				<h2>Example 4: combineWith</h2>
				{#if combined.loading}
					<button class="status status-loading" onclick={refresh} aria-label="Loading"><span class="spinner"></span></button>
				{:else}
					<button class="status status-success" onclick={refresh} aria-label="Refresh">↻</button>
				{/if}
			</div>
			<p>Combine multiple resources with a transformation function.</p>
			<div class="demo-box">
				{#if combined.loading}
					<p class="loading">Loading team...</p>
				{/if}
				{#if combined.ready}
					<p class="success">
						Team: {combined.current?.team.join(', ')}<br>
						All Active: {combined.current?.allActive ? 'Yes' : 'No'}
					</p>
				{/if}
				{#if combined.error}
					<p class="error">Error: {combined.error}</p>
				{/if}
			</div>
		</Boundary>
	</section>

	<section class="section">
		<Boundary>
			{@const prices = [0, 1, 2, 3, 4].map(id => getPrice(id))}
			{@const conditionalPrices = pipe(prices, mapArray(price => price), map(ps => ps.map(p => p > 50 ? p * 0.9 : p)))}
			{@const refresh = () => prices.forEach(p => p.refresh())}
			<div class="section-header">
				<h2>Example 5: Conditional Transformation</h2>
				{#if conditionalPrices.loading}
					<button class="status status-loading" onclick={refresh} aria-label="Loading"><span class="spinner"></span></button>
				{:else}
					<button class="status status-success" onclick={refresh} aria-label="Refresh">↻</button>
				{/if}
			</div>
			<p>Apply a 10% discount to items over $50.</p>
			<div class="demo-box">
				{#if conditionalPrices.loading}
					<p class="loading">Processing prices...</p>
				{/if}
				{#if conditionalPrices.ready}
					<ul>
						{#each conditionalPrices.current ?? [] as price, i}
							<li>Item {i + 1}: ${price.toFixed(2)}</li>
						{/each}
					</ul>
				{/if}
				{#if conditionalPrices.error}
					<p class="error">Error: {conditionalPrices.error}</p>
				{/if}
			</div>
		</Boundary>
	</section>

	<section class="section">
		<h2>Available Operators</h2>
		<div class="operators-grid">
			<div class="operator">
				<h3>map</h3>
				<p>Transform value (pipeable then)</p>
			</div>
			<div class="operator">
				<h3>catchError</h3>
				<p>Handle errors with fallback</p>
			</div>
			<div class="operator">
				<h3>transform</h3>
				<p>Handle success + error</p>
			</div>
			<div class="operator">
				<h3>withDefault</h3>
				<p>Provide default while loading</p>
			</div>
			<div class="operator">
				<h3>chain</h3>
				<p>Chain dependent resources</p>
			</div>
			<div class="operator">
				<h3>flatMapArray</h3>
				<p>Map to arrays and flatten</p>
			</div>
			<div class="operator">
				<h3>mapArray</h3>
				<p>Map over resource array</p>
			</div>
			<div class="operator">
				<h3>filterArray</h3>
				<p>Filter resource array</p>
			</div>
			<div class="operator">
				<h3>reduceArray</h3>
				<p>Reduce resource array</p>
			</div>
			<div class="operator">
				<h3>all</h3>
				<p>Wait for all to succeed</p>
			</div>
			<div class="operator">
				<h3>allSettled</h3>
				<p>Wait for all to settle</p>
			</div>
			<div class="operator">
				<h3>race</h3>
				<p>First to settle wins</p>
			</div>
			<div class="operator">
				<h3>combineWith</h3>
				<p>Combine + transform</p>
			</div>
			<div class="operator">
				<h3>tap</h3>
				<p>Side effects (logging)</p>
			</div>
			<div class="operator">
				<h3>when</h3>
				<p>Conditional transform</p>
			</div>
			<div class="operator">
				<h3>orElse</h3>
				<p>Fallback resource on error</p>
			</div>
			<div class="operator">
				<h3>retry</h3>
				<p>Retry on failure</p>
			</div>
		</div>
	</section>
</div>

<style>
	.operators-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 1rem;
		margin-top: 1rem;
	}

	.operator {
		background: var(--bg-secondary);
		padding: 1rem;
		border-radius: var(--border-radius);
		border: 1px solid var(--border-color);
	}

	.operator h3 {
		font-family: var(--font-mono);
		font-size: 0.9rem;
		color: var(--accent-primary);
		margin: 0 0 0.5rem 0;
	}

	.operator p {
		font-size: 0.85rem;
		color: var(--text-secondary);
		margin: 0;
	}
</style>
