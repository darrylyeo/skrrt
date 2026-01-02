<script lang="ts">
	import { timeout, catchError } from 'sveltekit-remote-resources'
	import { getSlow, getVerySlowData } from '../demo.remote'
	import PageBoundary from '$lib/components/PageBoundary.svelte'
	import Boundary from '$lib/components/Boundary.svelte'
</script>

<PageBoundary title="timeout()">
	<div class="page">
		<a href="/" class="page-back">← Back to Home</a>

		<header class="page-header">
			<h1 class="page-title">timeout()</h1>
			<p class="page-description">
				Fails with a timeout error if the resource doesn't settle within the specified time.
				Essential for UX guarantees.
			</p>
		</header>

		<section class="section">
			<h2>Usage</h2>
			<div class="code-block">
				<pre><code>{`import { timeout } from 'sveltekit-remote-resources'

// Fail if not ready in 500ms
const data = timeout(getSlowData(), 500)

// Custom error message
const data = timeout(getSlowData(), 500, 'Request took too long')`}</code></pre>
			</div>
		</section>

		<section class="section">
			<Boundary>
				{@const slowResource = getSlow()}
				{@const timedResource = timeout(slowResource, 500)}
				{@const safeResource = catchError(timedResource, (error) => ({ status: 'timeout', message: error.message }))}

				<div class="section-header">
					<h2>Fast Timeout (500ms limit)</h2>
					{#if slowResource.loading}
						<button class="status status-loading" onclick={() => slowResource.refresh()}><span class="spinner"></span> Loading...</button>
					{:else}
						<button class="status status-success" onclick={() => slowResource.refresh()}>↻ Retry</button>
					{/if}
				</div>

				<p class="section-description">
					The slow query takes 800-1200ms. With a 500ms timeout, it will usually fail.
				</p>

				<div class="demo-box">
					<div class="comparison-grid">
						<div class="comparison-item">
							<h3>Original Resource</h3>
							{#if slowResource.loading}
								<div class="status-indicator loading">
									<span class="spinner"></span> Loading...
								</div>
							{:else if slowResource.ready}
								<div class="status-indicator success">
									✓ Ready: {slowResource.current.source}
								</div>
							{/if}
						</div>

						<div class="comparison-item">
							<h3>With 500ms Timeout</h3>
							{#if timedResource.loading}
								<div class="status-indicator loading">
									<span class="spinner"></span> Loading...
								</div>
							{:else if timedResource.error}
								<div class="status-indicator error">
									✗ {timedResource.error.message}
								</div>
							{:else if timedResource.ready}
								<div class="status-indicator success">
									✓ Ready: {timedResource.current.source}
								</div>
							{/if}
						</div>

						<div class="comparison-item">
							<h3>With Error Fallback</h3>
							{#if safeResource.loading}
								<div class="status-indicator loading">
									<span class="spinner"></span> Loading...
								</div>
							{:else if safeResource.ready}
								{#if safeResource.current.status === 'timeout'}
									<div class="status-indicator warning">
										⚠ {safeResource.current.message}
									</div>
								{:else}
									<div class="status-indicator success">
										✓ Ready: {safeResource.current.source}
									</div>
								{/if}
							{/if}
						</div>
					</div>
				</div>
			</Boundary>
		</section>

		<section class="section">
			<Boundary>
				{@const verySlowResource = getVerySlowData()}
				{@const timedResource = timeout(verySlowResource, 2000, 'Data fetch exceeded 2 second limit')}

				<div class="section-header">
					<h2>Generous Timeout (2000ms limit)</h2>
					{#if verySlowResource.loading}
						<button class="status status-loading" onclick={() => verySlowResource.refresh()}><span class="spinner"></span> Loading...</button>
					{:else}
						<button class="status status-success" onclick={() => verySlowResource.refresh()}>↻ Retry</button>
					{/if}
				</div>

				<p class="section-description">
					Very slow query takes 1500-3000ms. 2 second timeout may or may not fire.
				</p>

				<div class="demo-box">
					<div class="timer-display">
						{#if timedResource.loading}
							<div class="timer-active">
								<span class="spinner large"></span>
								<span class="timer-text">Waiting... (2s limit)</span>
							</div>
						{:else if timedResource.error}
							<div class="timer-failed">
								<span class="timer-icon">⏱️</span>
								<span class="timer-text">{timedResource.error.message}</span>
							</div>
						{:else if timedResource.ready}
							<div class="timer-success">
								<span class="timer-icon">✓</span>
								<span class="timer-text">Completed in time!</span>
								<code class="timer-data">{JSON.stringify(timedResource.current)}</code>
							</div>
						{/if}
					</div>
				</div>
			</Boundary>
		</section>
	</div>
</PageBoundary>

<style>
	.comparison-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}

	@media (max-width: 768px) {
		.comparison-grid {
			grid-template-columns: 1fr;
		}
	}

	.comparison-item {
		padding: 1rem;
		background: var(--bg-secondary);
		border-radius: var(--border-radius);
	}

	.comparison-item h3 {
		font-size: 0.9rem;
		color: var(--text-muted);
		margin: 0 0 0.75rem 0;
	}

	.status-indicator {
		padding: 0.75rem;
		border-radius: 4px;
		font-size: 0.9rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.status-indicator.loading {
		background: var(--bg-tertiary);
		color: var(--text-secondary);
	}

	.status-indicator.success {
		background: rgba(74, 222, 128, 0.1);
		color: var(--success);
	}

	.status-indicator.error {
		background: rgba(248, 113, 113, 0.1);
		color: var(--error);
	}

	.status-indicator.warning {
		background: rgba(251, 191, 36, 0.1);
		color: #fbbf24;
	}

	.timer-display {
		padding: 2rem;
		text-align: center;
	}

	.timer-active,
	.timer-failed,
	.timer-success {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.timer-icon {
		font-size: 3rem;
	}

	.timer-text {
		font-size: 1.25rem;
	}

	.timer-failed .timer-text {
		color: var(--error);
	}

	.timer-success .timer-text {
		color: var(--success);
	}

	.timer-data {
		font-size: 0.85rem;
		background: var(--bg-tertiary);
		padding: 0.5rem 1rem;
		border-radius: 4px;
	}

	.spinner.large {
		width: 48px;
		height: 48px;
		border-width: 4px;
	}
</style>

