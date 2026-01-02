<script lang="ts">
	import { map } from '$lib/RemoteResource.svelte'
	import { getUser, getPrice } from '../demo.remote'
	import PageBoundary from '$lib/components/PageBoundary.svelte'
</script>

<PageBoundary title="map()">
	{@const users = [getUser(1), getUser(2), getUser(3)]}
	{@const prices = [getPrice(0), getPrice(1), getPrice(2), getPrice(3)]}
	{@const userNames = map(users, u => u.name)}
	{@const userEmails = map(users, u => u.email)}
	{@const formattedPrices = map(prices, p => `$${p.toFixed(2)}`)}

	<div class="page">
		<a href="/" class="page-back">← Back to Home</a>

		<header class="page-header">
			<h1 class="page-title">map()</h1>
			<p class="page-description">
				Maps over an array of RemoteResources, transforming each resolved value.
				Returns a new RemoteResource containing the mapped array.
			</p>
		</header>

		<section class="section">
			<h2>Usage</h2>
			<div class="code-block">
				<pre><code>{`import { map } from '$lib/RemoteResource.svelte'

const users = [getUser(1), getUser(2), getUser(3)]
const prices = [getPrice(0), getPrice(1), getPrice(2)]

const userNames = map(users, u => u.name)
const formattedPrices = map(prices, p => \`$\${p.toFixed(2)}\`)`}</code></pre>
			</div>
		</section>

		<section class="section">
			<div class="section-header">
				<h2>Result</h2>
				{#if userNames.loading}
					<button class="status status-loading" onclick={() => { users.forEach(u => u.refresh()); prices.forEach(p => p.refresh()) }}><span class="spinner"></span> Loading</button>
				{:else}
					<button class="status status-success" onclick={() => { users.forEach(u => u.refresh()); prices.forEach(p => p.refresh()) }}>↻ Refresh</button>
				{/if}
			</div>

			<div class="demo-box">
				{#if userNames.ready}
					<div class="fade-in grid-3">
						<div>
							<h4 class="subsection-title">Names</h4>
							<div class="item-list">
								{#each userNames.current ?? [] as name}
									<div class="item">
										<div class="item-content">
											<div class="item-title">{name}</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
						<div>
							<h4 class="subsection-title">Emails</h4>
							<div class="item-list">
								{#each userEmails.current ?? [] as email}
									<div class="item">
										<div class="item-content">
											<div class="item-title mono email-text">{email}</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
						<div>
							<h4 class="subsection-title">Prices</h4>
							<div class="item-list">
								{#each formattedPrices.current ?? [] as price}
									<div class="item">
										<div class="item-content">
											<div class="item-title mono text-primary">{price}</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				{:else}
					<p class="loading">Loading resources...</p>
				{/if}
			</div>
		</section>
	</div>
</PageBoundary>
