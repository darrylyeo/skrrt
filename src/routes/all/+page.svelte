<script lang="ts">
	import { all } from '$lib/RemoteResource.svelte'
	import { getUsers, getProducts, getStocks } from '../demo.remote'
	import PageBoundary from '$lib/components/PageBoundary.svelte'
</script>

<PageBoundary title="all()">
	{@const usersQuery = getUsers()}
	{@const productsQuery = getProducts()}
	{@const stocksQuery = getStocks()}
	{@const combined = all([usersQuery, productsQuery, stocksQuery])}

	<div class="page">
		<a href="/" class="page-back">← Back to Home</a>

		<header class="page-header">
			<h1 class="page-title">all()</h1>
			<p class="page-description">
				Combines multiple RemoteResources, resolving when all succeed.
				Equivalent to <code>Promise.all</code>.
			</p>
		</header>

		<section class="section">
			<h2>Usage</h2>
			<div class="code-block">
				<pre><code>{`import { all } from '$lib/RemoteResource.svelte'

const combined = all([getUsers(), getProducts(), getStocks()])
// combined.current is [users, products, stocks] when all are ready`}</code></pre>
			</div>
		</section>

		<section class="section">
			<div class="section-header">
				<h2>Result</h2>
				{#if combined.loading}
					<button class="status status-loading" onclick={() => { usersQuery.refresh(); productsQuery.refresh(); stocksQuery.refresh() }}><span class="spinner"></span> Waiting for all...</button>
				{:else if combined.error}
					<button class="status status-error" onclick={() => { usersQuery.refresh(); productsQuery.refresh(); stocksQuery.refresh() }}>↻ Error</button>
				{:else}
					<button class="status status-success" onclick={() => { usersQuery.refresh(); productsQuery.refresh(); stocksQuery.refresh() }}>↻ All Ready</button>
				{/if}
			</div>

			<div class="demo-box">
				{#if combined.ready}
					{@const [users, products, stocks] = combined.current ?? [[], [], []]}
					<div class="fade-in">
						<div class="stats-grid">
							<div class="stat">
								<div class="stat-value">{users.length}</div>
								<div class="stat-label">Users</div>
							</div>
							<div class="stat">
								<div class="stat-value">{products.length}</div>
								<div class="stat-label">Products</div>
							</div>
							<div class="stat">
								<div class="stat-value">{stocks.length}</div>
								<div class="stat-label">Stocks</div>
							</div>
						</div>

						<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem; margin-top: 1.5rem;">
							<div>
								<h4 style="color: var(--text-secondary); margin-bottom: 0.75rem;">Users</h4>
								<div class="item-list">
									{#each users.slice(0, 3) as user}
										<div class="item">
											<div class="item-content">
												<div class="item-title">{user.name}</div>
											</div>
										</div>
									{/each}
								</div>
							</div>
							<div>
								<h4 style="color: var(--text-secondary); margin-bottom: 0.75rem;">Products</h4>
								<div class="item-list">
									{#each products.slice(0, 3) as product}
										<div class="item">
											<div class="item-content">
												<div class="item-title">{product.name}</div>
												<div class="item-subtitle">${product.price}</div>
											</div>
										</div>
									{/each}
								</div>
							</div>
							<div>
								<h4 style="color: var(--text-secondary); margin-bottom: 0.75rem;">Stocks</h4>
								<div class="item-list">
									{#each stocks as stock}
										<div class="item">
											<div class="item-content">
												<div class="item-title">{stock.symbol}</div>
												<div class="item-subtitle" style="color: {stock.change > 0 ? 'var(--accent-primary)' : 'var(--accent-tertiary)'}">
													{stock.change > 0 ? '+' : ''}{stock.change}%
												</div>
											</div>
										</div>
									{/each}
								</div>
							</div>
						</div>
					</div>
				{:else}
					<p class="loading">Loading all data...</p>
				{/if}
			</div>
		</section>
	</div>
</PageBoundary>
