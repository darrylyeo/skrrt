<script lang="ts">
	import type { Snippet } from 'svelte'

	interface Props {
		children: Snippet
	}

	let { children }: Props = $props()
</script>

<svelte:boundary>
	{@render children()}

	{#snippet failed(error, retry)}
		<div class="error-inline">
			<span class="error-message">{error instanceof Error ? error.message : String(error)}</span>
			<button class="retry-btn" onclick={retry}>↻ Retry</button>
		</div>
	{/snippet}
</svelte:boundary>

<style>
	.error-inline {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: rgba(255, 107, 107, 0.1);
		border: 1px solid var(--error-color);
		border-radius: var(--border-radius);
	}

	.error-message {
		color: var(--error-color);
		font-size: 0.9rem;
		flex: 1;
	}

	.retry-btn {
		padding: 0.4rem 0.8rem;
		background: var(--error-color);
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.85rem;
	}

	.retry-btn:hover {
		opacity: 0.9;
	}
</style>
