<script lang="ts">
	import type { Snippet } from 'svelte'

	interface Props {
		title: string
		children: Snippet
	}

	let { title, children }: Props = $props()
</script>

<svelte:boundary>
	{@render children()}

	{#snippet failed(error, retry)}
		<div class="page">
			<a href="/" class="page-back">← Back to Home</a>
			<h1 class="page-title">{title}</h1>
			<div class="error-controls">
				<button class="status status-error" onclick={retry}>
					✕ Error - Click to Retry
				</button>
			</div>
			<div class="error-boundary">
				<p>An error occurred while loading the page.</p>
				<pre>{error instanceof Error ? error.message : String(error)}</pre>
			</div>
		</div>
	{/snippet}
</svelte:boundary>

<style>
	.error-controls {
		margin: 1rem 0;
	}

	.error-boundary {
		padding: 2rem;
		background: rgba(255, 107, 107, 0.1);
		border: 1px solid var(--error-color);
		border-radius: var(--border-radius);
		margin-top: 1.5rem;
	}

	.error-boundary p {
		color: var(--error-color);
		margin-bottom: 1rem;
	}

	.error-boundary pre {
		background: var(--bg-tertiary);
		padding: 1rem;
		border-radius: 4px;
		overflow-x: auto;
		margin-bottom: 1rem;
		font-size: 0.85rem;
	}
</style>
