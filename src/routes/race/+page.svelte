<script lang="ts">
	import { race } from '$lib/RemoteResource.svelte'
	import { getFast, getMedium, getSlow } from '../demo.remote'
	import PageBoundary from '$lib/components/PageBoundary.svelte'
</script>

<PageBoundary title="race()">
	{@const fast = getFast()}
	{@const medium = getMedium()}
	{@const slow = getSlow()}
	{@const winner = race([fast, medium, slow])}

	<div class="page">
		<a href="/" class="page-back">← Back to Home</a>

		<header class="page-header">
			<h1 class="page-title">race()</h1>
			<p class="page-description">
				Returns the first RemoteResource to settle (resolve or reject).
				Equivalent to <code>Promise.race</code>.
			</p>
		</header>

		<section class="section">
			<h2>Usage</h2>
			<div class="code-block">
				<pre><code>{`import { race } from '$lib/RemoteResource.svelte'

const winner = race([getFast(), getMedium(), getSlow()])
// winner.current shows the first one to complete`}</code></pre>
			</div>
		</section>

		<section class="section">
			<div class="section-header">
				<h2>Result</h2>
				{#if winner.loading}
					<button class="status status-loading" onclick={() => { fast.refresh(); medium.refresh(); slow.refresh() }}><span class="spinner"></span> Racing...</button>
				{:else}
					<button class="status status-success" onclick={() => { fast.refresh(); medium.refresh(); slow.refresh() }}>↻ Winner!</button>
				{/if}
			</div>

			<div class="demo-box">
				<div class="comparison" style="grid-template-columns: 1fr 1fr 1fr; margin-bottom: 1.5rem;">
					<div class="comparison-item">
						<div class="comparison-label">Fast (200ms)</div>
						{#if fast.ready}
							<span class="badge badge-success">✓ {fast.current?.source}</span>
						{:else}
							<span class="status status-loading"><span class="spinner"></span></span>
						{/if}
					</div>
					<div class="comparison-item">
						<div class="comparison-label">Medium (500ms)</div>
						{#if medium.ready}
							<span class="badge badge-success">✓ {medium.current?.source}</span>
						{:else}
							<span class="status status-loading"><span class="spinner"></span></span>
						{/if}
					</div>
					<div class="comparison-item">
						<div class="comparison-label">Slow (1000ms)</div>
						{#if slow.ready}
							<span class="badge badge-success">✓ {slow.current?.source}</span>
						{:else}
							<span class="status status-loading"><span class="spinner"></span></span>
						{/if}
					</div>
				</div>

				{#if winner.ready}
					<div class="fade-in">
						<div class="data-grid">
							<div class="data-row">
								<span class="data-label">Winner</span>
								<span class="data-value">🏆 {winner.current?.source}</span>
							</div>
							<div class="data-row">
								<span class="data-label">Timestamp</span>
								<span class="data-value">{winner.current?.timestamp}</span>
							</div>
						</div>
					</div>
				{:else}
					<p class="loading">Racing...</p>
				{/if}
			</div>
		</section>
	</div>
</PageBoundary>
