<script lang="ts">
	import { catchError } from '$lib/RemoteResource.svelte'
	import { getFailure, getSuccess } from '../demo.remote'
	import PageBoundary from '$lib/components/PageBoundary.svelte'
</script>

<PageBoundary title="catchError()">
	{@const failingQuery = getFailure()}
	{@const successQuery = getSuccess()}
	{@const recovered = catchError(failingQuery, error => ({
		status: 'recovered',
		message: `Caught error: ${error instanceof Error ? error.message : String(error)}`
	}))}
	{@const successUnchanged = catchError(successQuery, () => ({
		status: 'fallback',
		message: 'This should not appear'
	}))}

	<div class="page">
		<a href="/" class="page-back">← Back to Home</a>

		<header class="page-header">
			<h1 class="page-title">catchError()</h1>
			<p class="page-description">
				Provides a fallback value if the RemoteResource errors.
				Equivalent to <code>Promise.prototype.catch</code>.
			</p>
		</header>

		<section class="section">
			<h2>Usage</h2>
			<div class="code-block">
				<pre><code>{`import { catchError } from '$lib/RemoteResource.svelte'

const failingQuery = getFailure()
const recovered = catchError(failingQuery, error => ({
  status: 'recovered',
  message: \`Caught: \${error.message}\`
}))`}</code></pre>
			</div>
		</section>

		<section class="section">
			<div class="section-header">
				<h2>Result</h2>
				{#if recovered.loading}
					<button class="status status-loading" onclick={() => { failingQuery.refresh(); successQuery.refresh() }}><span class="spinner"></span> Loading</button>
				{:else}
					<button class="status status-success" onclick={() => { failingQuery.refresh(); successQuery.refresh() }}>↻ Refresh</button>
				{/if}
			</div>

			<div class="comparison">
				<div class="demo-box">
					<h4 style="color: var(--text-secondary); margin-bottom: 1rem;">Failing Query (Recovered)</h4>
					{#if recovered.ready}
						<div class="fade-in data-grid">
							<div class="data-row">
								<span class="data-label">Status</span>
								<span class="data-value">{recovered.current?.status}</span>
							</div>
							<div class="data-row">
								<span class="data-label">Message</span>
								<span class="data-value">{recovered.current?.message}</span>
							</div>
							<div class="data-row">
								<span class="data-label">Has Error</span>
								<span class="data-value">{recovered.error ? 'yes' : 'no'}</span>
							</div>
						</div>
					{:else}
						<p class="loading">Loading...</p>
					{/if}
				</div>

				<div class="demo-box">
					<h4 style="color: var(--text-secondary); margin-bottom: 1rem;">Success Query (Unchanged)</h4>
					{#if successUnchanged.ready}
						<div class="fade-in data-grid">
							<div class="data-row">
								<span class="data-label">Status</span>
								<span class="data-value">{successUnchanged.current?.status}</span>
							</div>
							<div class="data-row">
								<span class="data-label">Message</span>
								<span class="data-value">{successUnchanged.current?.message}</span>
							</div>
						</div>
					{:else}
						<p class="loading">Loading...</p>
					{/if}
				</div>
			</div>
		</section>
	</div>
</PageBoundary>
