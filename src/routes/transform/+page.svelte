<script lang="ts">
	import { transform } from '$lib/RemoteResource.svelte'
	import { getFailure, getSuccess, getMayFail } from '../demo.remote'
	import PageBoundary from '$lib/components/PageBoundary.svelte'
	import Boundary from '$lib/components/Boundary.svelte'

	type TransformResult<T> = { type: 'success'; data: T } | { type: 'error'; message: string }
</script>

<PageBoundary title="transform()">
	<div class="page">
		<a href="/" class="page-back">← Back to Home</a>

		<header class="page-header">
			<h1 class="page-title">transform()</h1>
			<p class="page-description">
				Combines <code>then</code> and <code>catchError</code> in one call.
				Transform data on success and provide a fallback on error.
			</p>
		</header>

		<section class="section">
			<h2>Usage</h2>
			<div class="code-block">
				<pre><code>{`import { transform } from '$lib/RemoteResource.svelte'

const result = transform(getFailure(), {
  onSuccess: data => ({ type: 'success', data }),
  onError: error => ({ type: 'error', message: error.message })
})`}</code></pre>
			</div>
		</section>

		<section class="section">
			<Boundary>
				{@const failureQuery = getFailure()}
				{@const successQuery = getSuccess()}
				{@const maybeQuery = getMayFail(3)}
				{@const failedTransformed = transform<Awaited<typeof failureQuery>, TransformResult<Awaited<typeof failureQuery>>>(failureQuery, {
					onSuccess: data => ({ type: 'success', data }),
					onError: error => ({
						type: 'error',
						message: error instanceof Error ? error.message : 'Unknown error'
					})
				})}
				{@const successTransformed = transform<Awaited<typeof successQuery>, TransformResult<Awaited<typeof successQuery>>>(successQuery, {
					onSuccess: data => ({ type: 'success', data }),
					onError: () => ({ type: 'error', message: 'Failed' })
				})}
				{@const maybeTransformed = transform<Awaited<typeof maybeQuery>, { status: string; value: number }>(maybeQuery, {
					onSuccess: data => ({ status: 'ok', value: data.value }),
					onError: () => ({ status: 'fallback', value: 0 })
				})}
				{@const refresh = () => { failureQuery.refresh(); successQuery.refresh(); maybeQuery.refresh() }}

				<div class="section-header">
					<h2>Result</h2>
					{#if failedTransformed.loading}
						<button class="status status-loading" onclick={refresh}><span class="spinner"></span> Loading</button>
					{:else}
						<button class="status status-success" onclick={refresh}>↻ Refresh</button>
					{/if}
				</div>

				<div class="demo-box">
					{#if failedTransformed.ready && successTransformed.ready}
						<div class="fade-in">
							<div class="comparison">
								<div class="comparison-item">
									<div class="comparison-label">Failed Query → Transformed</div>
									<div class="data-grid">
										<div class="data-row">
											<span class="data-label">Type</span>
											<span class="data-value" style="color: {failedTransformed.current?.type === 'error' ? 'var(--accent-tertiary)' : 'var(--accent-primary)'}">
												{failedTransformed.current?.type}
											</span>
										</div>
										<div class="data-row">
											<span class="data-label">Message</span>
											<span class="data-value">
												{'message' in (failedTransformed.current ?? {}) ? (failedTransformed.current as { message: string }).message : 'N/A'}
											</span>
										</div>
										<div class="data-row">
											<span class="data-label">Has Error?</span>
											<span class="data-value">{failedTransformed.error ? 'yes' : 'no'}</span>
										</div>
									</div>
								</div>

								<div class="comparison-item">
									<div class="comparison-label">Success Query → Transformed</div>
									<div class="data-grid">
										<div class="data-row">
											<span class="data-label">Type</span>
											<span class="data-value" style="color: var(--accent-primary)">
												{successTransformed.current?.type}
											</span>
										</div>
										<div class="data-row">
											<span class="data-label">Status</span>
											<span class="data-value">
												{'data' in (successTransformed.current ?? {}) ? (successTransformed.current as { data: { status: string } }).data.status : 'N/A'}
											</span>
										</div>
										<div class="data-row">
											<span class="data-label">Has Error?</span>
											<span class="data-value">{successTransformed.error ? 'yes' : 'no'}</span>
										</div>
									</div>
								</div>
							</div>

							{#if maybeTransformed.ready}
								<div style="margin-top: 1.5rem;">
									<h4 style="color: var(--text-secondary); margin-bottom: 0.75rem;">Maybe Transformed (seed: 3, should succeed)</h4>
									<div class="data-grid">
										<div class="data-row">
											<span class="data-label">Status</span>
											<span class="data-value">{maybeTransformed.current?.status}</span>
										</div>
										<div class="data-row">
											<span class="data-label">Value</span>
											<span class="data-value">{maybeTransformed.current?.value}</span>
										</div>
									</div>
								</div>
							{/if}
						</div>
					{:else}
						<p class="loading">Transforming...</p>
					{/if}
				</div>
			</Boundary>
		</section>
	</div>
</PageBoundary>
