<script lang="ts">
	import { withDefault, derive } from '$lib/RemoteResource.svelte'
	import { getUsers, getPrices } from '../demo.remote'
	import PageBoundary from '$lib/components/PageBoundary.svelte'
</script>

<PageBoundary title="withDefault()">
	{@const users = getUsers()}
	{@const usersWithDefault = withDefault(users, [])}
	{@const prices = getPrices()}
	{@const pricesWithDefault = withDefault(prices, [0])}
	{@const total = derive(pricesWithDefault, ps => ps.reduce((a, b) => a + b, 0))}

	<div class="page">
		<a href="/" class="page-back">← Back to Home</a>

		<header class="page-header">
			<h1 class="page-title">withDefault()</h1>
			<p class="page-description">
				Provides a default value while the resource is loading or on error.
				Unlike <code>catchError</code>, this also provides a value during initial load.
			</p>
		</header>

		<section class="section">
			<h2>Usage</h2>
			<div class="code-block">
				<pre><code>{`import { withDefault } from '$lib/RemoteResource.svelte'

const users = withDefault(getUsers(), [])
// users.current is [] while loading, then actual data
// users.ready is always true!`}</code></pre>
			</div>
		</section>

		<section class="section">
			<div class="section-header">
				<h2>Result</h2>
				{#if users.loading}
					<button class="status status-loading" onclick={() => { users.refresh(); prices.refresh() }}><span class="spinner"></span> Loading...</button>
				{:else}
					<button class="status status-success" onclick={() => { users.refresh(); prices.refresh() }}>↻ Refresh</button>
				{/if}
			</div>

			<div class="demo-box">
				<div class="comparison mb-lg">
					<div class="comparison-item">
						<div class="comparison-label">Regular Resource</div>
						<div class="data-grid">
							<div class="data-row">
								<span class="data-label">ready</span>
								<span class="data-value">{users.ready}</span>
							</div>
							<div class="data-row">
								<span class="data-label">loading</span>
								<span class="data-value">{users.loading}</span>
							</div>
							<div class="data-row">
								<span class="data-label">current</span>
								<span class="data-value">{users.current ? `${users.current.length} items` : 'undefined'}</span>
							</div>
						</div>
					</div>

					<div class="comparison-item">
						<div class="comparison-label">With Default</div>
						<div class="data-grid">
							<div class="data-row">
								<span class="data-label">ready</span>
								<span class="data-value text-primary">{usersWithDefault.ready}</span>
							</div>
							<div class="data-row">
								<span class="data-label">loading</span>
								<span class="data-value">{usersWithDefault.loading}</span>
							</div>
							<div class="data-row">
								<span class="data-label">current</span>
								<span class="data-value">{usersWithDefault.current?.length} items</span>
							</div>
						</div>
					</div>
				</div>

				<h4 class="subsection-title">
					Users List (always renderable)
				</h4>
				{#if usersWithDefault.current?.length === 0}
					<div class="item text-muted">
						Loading users...
					</div>
				{:else}
					<div class="item-list">
						{#each usersWithDefault.current ?? [] as user}
							<div class="item">
								<div class="item-icon secondary">
									{user.name[0]}
								</div>
								<div class="item-content">
									<div class="item-title">{user.name}</div>
									<div class="item-subtitle">{user.email}</div>
								</div>
								<span class="badge {user.active ? 'badge-success' : 'badge-inactive'}">
									{user.active ? 'Active' : 'Inactive'}
								</span>
							</div>
						{/each}
					</div>
				{/if}

				<div class="mt-lg">
					<h4 class="subsection-title">
						Price Total (computed from default while loading)
					</h4>
					<div class="stat stat-inline">
						<div class="stat-value">${total.current?.toFixed(2)}</div>
						<div class="stat-label">{prices.loading ? 'Loading...' : 'Total'}</div>
					</div>
				</div>
			</div>
		</section>
	</div>
</PageBoundary>
