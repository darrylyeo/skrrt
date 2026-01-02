<script lang="ts">
	import { delay } from 'sveltekit-remote-resources'
	import { getFast, getMedium } from '../demo.remote'
	import PageBoundary from '$lib/components/PageBoundary.svelte'
	import Boundary from '$lib/components/Boundary.svelte'
</script>

<PageBoundary title="delay()">
	<div class="page">
		<a href="/" class="page-back">← Back to Home</a>

		<header class="page-header">
			<h1 class="page-title">delay()</h1>
			<p class="page-description">
				Adds a minimum delay before the resource is considered ready.
				Prevents flash of loading state for fast queries.
			</p>
		</header>

		<section class="section">
			<h2>Usage</h2>
			<div class="code-block">
				<pre><code>{`import { delay } from 'sveltekit-remote-resources'

// Always show loading for at least 500ms
const data = delay(getFastData(), 500)

// Prevents jarring flash when data loads too quickly`}</code></pre>
			</div>
		</section>

		<section class="section">
			<Boundary>
				{@const fastResource = getFast()}
				{@const delayedResource = delay(fastResource, 800)}

				<div class="section-header">
					<h2>Fast Query with 800ms Minimum</h2>
					{#if delayedResource.loading}
						<button class="status status-loading" onclick={() => fastResource.refresh()}><span class="spinner"></span> Loading...</button>
					{:else}
						<button class="status status-success" onclick={() => fastResource.refresh()}>↻ Refresh</button>
					{/if}
				</div>

				<p class="section-description">
					The fast query resolves in ~200ms, but we delay showing results for 800ms minimum
					to prevent a jarring flash of loading state.
				</p>

				<div class="demo-box">
					<div class="comparison-grid">
						<div class="comparison-item">
							<h3>Without Delay</h3>
							<div class="timing-bar">
								<div class="timing-fill" class:active={fastResource.loading} class:complete={fastResource.ready}>
									{#if fastResource.loading}
										<span class="spinner small"></span>
									{:else}
										✓
									{/if}
								</div>
							</div>
							<div class="timing-label">
								{#if fastResource.ready}
									Ready (fast!)
								{:else}
									Loading...
								{/if}
							</div>
						</div>

						<div class="comparison-item">
							<h3>With 800ms Delay</h3>
							<div class="timing-bar">
								<div class="timing-fill delayed" class:active={delayedResource.loading} class:complete={delayedResource.ready}>
									{#if delayedResource.loading}
										<span class="spinner small"></span>
									{:else}
										✓
									{/if}
								</div>
							</div>
							<div class="timing-label">
								{#if delayedResource.ready}
									Ready (smooth)
								{:else}
									Loading...
								{/if}
							</div>
						</div>
					</div>

					{#if delayedResource.ready}
						<div class="fade-in result-box">
							<div class="result-label">Data</div>
							<code>{JSON.stringify(delayedResource.current)}</code>
						</div>
					{/if}
				</div>
			</Boundary>
		</section>

		<section class="section">
			<Boundary>
				{@const resources = [
					{ label: 'No delay', resource: getFast(), minDelay: 0 },
					{ label: '300ms', resource: getFast(), minDelay: 300 },
					{ label: '600ms', resource: getFast(), minDelay: 600 },
					{ label: '1000ms', resource: getFast(), minDelay: 1000 }
				].map(r => ({ ...r, delayed: r.minDelay > 0 ? delay(r.resource, r.minDelay) : r.resource }))}
				{@const refresh = () => resources.forEach(r => r.resource.refresh())}

				<div class="section-header">
					<h2>Delay Comparison</h2>
					<button class="status" class:status-loading={resources.some(r => r.delayed.loading)} class:status-success={resources.every(r => r.delayed.ready)} onclick={refresh}>
						{#if resources.some(r => r.delayed.loading)}
							<span class="spinner"></span> Loading...
						{:else}
							↻ Refresh All
						{/if}
					</button>
				</div>

				<p class="section-description">
					Compare different delay durations side by side. Notice how longer delays
					create a smoother, more intentional loading experience.
				</p>

				<div class="demo-box">
					<div class="delay-grid">
						{#each resources as { label, delayed }}
							<div class="delay-item">
								<div class="delay-label">{label}</div>
								<div class="delay-indicator" class:loading={delayed.loading} class:ready={delayed.ready}>
									{#if delayed.loading}
										<span class="spinner"></span>
									{:else}
										✓
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			</Boundary>
		</section>

		<section class="section">
			<Boundary>
				{@const mediumResource = getMedium()}
				{@const delayedMedium = delay(mediumResource, 300)}

				<div class="section-header">
					<h2>Already Slow Query</h2>
					{#if delayedMedium.loading}
						<button class="status status-loading" onclick={() => mediumResource.refresh()}><span class="spinner"></span> Loading...</button>
					{:else}
						<button class="status status-success" onclick={() => mediumResource.refresh()}>↻ Refresh</button>
					{/if}
				</div>

				<p class="section-description">
					When the query is already slower than the delay, the delay has no visible effect.
					Medium query takes ~500ms, delay is 300ms.
				</p>

				<div class="demo-box">
					<div class="comparison-grid">
						<div class="comparison-item">
							<h3>Original (~500ms)</h3>
							<div class="timing-bar">
								<div class="timing-fill" class:active={mediumResource.loading} class:complete={mediumResource.ready}>
									{#if mediumResource.loading}
										<span class="spinner small"></span>
									{:else}
										✓
									{/if}
								</div>
							</div>
						</div>

						<div class="comparison-item">
							<h3>With 300ms Delay</h3>
							<div class="timing-bar">
								<div class="timing-fill" class:active={delayedMedium.loading} class:complete={delayedMedium.ready}>
									{#if delayedMedium.loading}
										<span class="spinner small"></span>
									{:else}
										✓
									{/if}
								</div>
							</div>
							<div class="timing-note">
								No added wait — query is already slower
							</div>
						</div>
					</div>
				</div>
			</Boundary>
		</section>
	</div>
</PageBoundary>

<style>
	.comparison-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.5rem;
		margin-bottom: 1.5rem;
	}

	@media (max-width: 600px) {
		.comparison-grid {
			grid-template-columns: 1fr;
		}
	}

	.comparison-item {
		padding: 1.25rem;
		background: var(--bg-secondary);
		border-radius: var(--border-radius);
	}

	.comparison-item h3 {
		font-size: 0.9rem;
		color: var(--text-muted);
		margin: 0 0 1rem 0;
	}

	.timing-bar {
		height: 40px;
		background: var(--bg-tertiary);
		border-radius: 4px;
		overflow: hidden;
	}

	.timing-fill {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
		background: var(--bg-tertiary);
		color: var(--text-muted);
	}

	.timing-fill.active {
		background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
		animation: pulse 1s ease infinite;
	}

	.timing-fill.complete {
		background: var(--success);
		color: white;
	}

	@keyframes pulse {
		0%, 100% { opacity: 0.7; }
		50% { opacity: 1; }
	}

	.timing-label {
		margin-top: 0.5rem;
		font-size: 0.85rem;
		color: var(--text-secondary);
		text-align: center;
	}

	.timing-note {
		margin-top: 0.5rem;
		font-size: 0.8rem;
		color: var(--text-muted);
		font-style: italic;
	}

	.result-box {
		margin-top: 1.5rem;
		padding: 1rem;
		background: var(--bg-secondary);
		border-radius: var(--border-radius);
	}

	.result-label {
		font-size: 0.8rem;
		color: var(--text-muted);
		margin-bottom: 0.5rem;
	}

	.result-box code {
		font-size: 0.85rem;
	}

	.delay-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
	}

	@media (max-width: 600px) {
		.delay-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.delay-item {
		text-align: center;
	}

	.delay-label {
		font-size: 0.85rem;
		color: var(--text-muted);
		margin-bottom: 0.75rem;
	}

	.delay-indicator {
		width: 60px;
		height: 60px;
		margin: 0 auto;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		transition: all 0.3s ease;
	}

	.delay-indicator.loading {
		background: var(--bg-tertiary);
	}

	.delay-indicator.ready {
		background: var(--success);
		color: white;
	}

	.spinner.small {
		width: 16px;
		height: 16px;
		border-width: 2px;
	}
</style>

