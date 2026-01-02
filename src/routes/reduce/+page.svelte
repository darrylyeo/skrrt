<script lang="ts">
	import { reduce } from '$lib/RemoteResource.svelte'
	import { getPrice, getUser } from '../demo.remote'
	import PageBoundary from '$lib/components/PageBoundary.svelte'
</script>

<PageBoundary title="reduce()">
	{@const prices = [getPrice(0), getPrice(1), getPrice(2), getPrice(3), getPrice(4)]}
	{@const users = [getUser(1), getUser(2), getUser(3), getUser(4), getUser(5)]}
	{@const total = reduce(prices, (sum, price) => sum + price, 0)}
	{@const average = reduce(prices, (acc, price, i) => {
		const newSum = acc.sum + price
		const count = i + 1
		return { sum: newSum, avg: newSum / count }
	}, { sum: 0, avg: 0 })}
	{@const activeCount = reduce(users, (count, user) => user.active ? count + 1 : count, 0)}
	{@const nameList = reduce(users, (acc, user, i) => i === 0 ? user.name : `${acc}, ${user.name}`, '')}

	<div class="page">
		<a href="/" class="page-back">← Back to Home</a>

		<header class="page-header">
			<h1 class="page-title">reduce()</h1>
			<p class="page-description">
				Reduces an array of RemoteResources to a single value.
				Returns a new RemoteResource containing the reduced result.
			</p>
		</header>

		<section class="section">
			<h2>Usage</h2>
			<div class="code-block">
				<pre><code>{`import { reduce } from '$lib/RemoteResource.svelte'

const prices = [getPrice(0), getPrice(1), getPrice(2), getPrice(3)]
const users = [getUser(1), getUser(2), getUser(3)]

const total = reduce(prices, (sum, price) => sum + price, 0)
const activeCount = reduce(users, (n, u) => u.active ? n + 1 : n, 0)`}</code></pre>
			</div>
		</section>

		<section class="section">
			<div class="section-header">
				<h2>Result</h2>
				{#if total.loading}
					<button class="status status-loading" onclick={() => { prices.forEach(p => p.refresh()); users.forEach(u => u.refresh()) }}><span class="spinner"></span> Loading</button>
				{:else}
					<button class="status status-success" onclick={() => { prices.forEach(p => p.refresh()); users.forEach(u => u.refresh()) }}>↻ Refresh</button>
				{/if}
			</div>

			<div class="demo-box">
				{#if total.ready && activeCount.ready}
					<div class="fade-in">
						<h4 class="subsection-title">Price Calculations</h4>
						<div class="stats-grid">
							<div class="stat">
								<div class="stat-value">${total.current?.toFixed(2)}</div>
								<div class="stat-label">Total</div>
							</div>
							<div class="stat">
								<div class="stat-value">${average.current?.avg.toFixed(2)}</div>
								<div class="stat-label">Average</div>
							</div>
							<div class="stat">
								<div class="stat-value">{prices.length}</div>
								<div class="stat-label">Items</div>
							</div>
						</div>

						<h4 class="subsection-title spaced">User Aggregations</h4>
						<div class="stats-grid">
							<div class="stat">
								<div class="stat-value">{activeCount.current}</div>
								<div class="stat-label">Active Users</div>
							</div>
							<div class="stat">
								<div class="stat-value">{users.length - (activeCount.current ?? 0)}</div>
								<div class="stat-label">Inactive Users</div>
							</div>
						</div>

						<h4 class="subsection-title spaced">Concatenated Names</h4>
						<div class="data-grid">
							<div class="data-row">
								<span class="data-value mono">{nameList.current}</span>
							</div>
						</div>
					</div>
				{:else}
					<p class="loading">Calculating...</p>
				{/if}
			</div>
		</section>
	</div>
</PageBoundary>
