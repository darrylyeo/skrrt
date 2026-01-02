<script lang="ts">
	import { allSettled } from '$lib/RemoteResource.svelte'
	import { getMayFail } from '../demo.remote'
	import PageBoundary from '$lib/components/PageBoundary.svelte'
</script>

<PageBoundary title="allSettled()">
	{@const q1 = getMayFail(1)}
	{@const q2 = getMayFail(2)}
	{@const q3 = getMayFail(3)}
	{@const q4 = getMayFail(4)}
	{@const results = allSettled([q1, q2, q3, q4])}

	<div class="page">
		<a href="/" class="page-back">← Back to Home</a>

		<header class="page-header">
			<h1 class="page-title">allSettled()</h1>
			<p class="page-description">
				Combines multiple RemoteResources, resolving when all settle (success or failure).
				Each result mirrors RemoteResource properties: <code>ready</code>, <code>current</code>, <code>error</code>.
			</p>
		</header>

		<section class="section">
			<h2>Usage</h2>
			<div class="code-block">
				<pre><code>{`import { allSettled } from '$lib/RemoteResource.svelte'

// getMayFail fails for even seeds, succeeds for odd
const results = allSettled([
  getMayFail(1),  // succeeds
  getMayFail(2),  // fails
  getMayFail(3),  // succeeds
  getMayFail(4)   // fails
])

// Each result: { ready, current, error }`}</code></pre>
			</div>
		</section>

		<section class="section">
			<div class="section-header">
				<h2>Result</h2>
				{#if results.loading}
					<button class="status status-loading" onclick={() => { q1.refresh(); q2.refresh(); q3.refresh(); q4.refresh() }}><span class="spinner"></span> Settling...</button>
				{:else}
					<button class="status status-success" onclick={() => { q1.refresh(); q2.refresh(); q3.refresh(); q4.refresh() }}>↻ All Settled</button>
				{/if}
			</div>

			<div class="demo-box">
				{#if results.ready}
					<div class="fade-in item-list">
						{#each results.current ?? [] as result, i}
							<div class="item">
								<div class="item-icon" class:primary={result.ready} class:tertiary={!result.ready}>
									{result.ready ? '✓' : '✗'}
								</div>
								<div class="item-content">
									<div class="item-title">Query {i + 1} (seed: {i + 1})</div>
									<div class="item-subtitle">
										{#if result.ready}
											Value: {JSON.stringify(result.current)}
										{:else}
											Error: {result.error instanceof Error ? result.error.message : String(result.error)}
										{/if}
									</div>
								</div>
								<span class="badge {result.ready ? 'badge-success' : 'badge-error'}">
									{result.ready ? 'ready' : 'error'}
								</span>
							</div>
						{/each}
					</div>

					{@const succeeded = (results.current ?? []).filter(r => r.ready).length}
					{@const failed = (results.current ?? []).filter(r => !r.ready).length}
					<div class="stats-grid mt-lg">
						<div class="stat">
							<div class="stat-value text-primary">{succeeded}</div>
							<div class="stat-label">Ready</div>
						</div>
						<div class="stat">
							<div class="stat-value text-error">{failed}</div>
							<div class="stat-label">Errored</div>
						</div>
					</div>
				{:else}
					<p class="loading">Settling queries...</p>
				{/if}
			</div>
		</section>
	</div>
</PageBoundary>
