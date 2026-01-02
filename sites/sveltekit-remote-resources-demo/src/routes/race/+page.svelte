<script lang="ts">
	import { race } from '$lib/RemoteResource.svelte'
	import { getRandomNumberById } from '../demo.remote'
	import PageBoundary from '$lib/components/PageBoundary.svelte'
	import Boundary from '$lib/components/Boundary.svelte'

	const RACER_NAMES = ['🐇 Rabbit', '🐢 Turtle', '🦊 Fox', '🐻 Bear', '🦅 Eagle']
</script>

<PageBoundary title="race()">
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

const winner = race([racer1, racer2, racer3, racer4, racer5])
// winner.current shows the first one to complete
// Each racer has random latency (50-1500ms)`}</code></pre>
			</div>
		</section>

		<section class="section">
			<Boundary>
				{@const racers = RACER_NAMES.map((_, i) => getRandomNumberById(i + 1))}
				{@const winner = race(racers)}
				{@const refresh = () => racers.forEach(r => r.refresh())}

				<div class="section-header">
					<h2>Result</h2>
					{#if winner.loading}
						<button class="status status-loading" onclick={refresh}><span class="spinner"></span> Racing...</button>
					{:else}
						<button class="status status-success" onclick={refresh}>↻ Race Again!</button>
					{/if}
				</div>

				<div class="demo-box">
					<div class="racers-grid">
						{#each racers as racer, i}
							<div class="racer" class:finished={racer.ready} class:winner={winner.ready && winner.current?.id === i + 1}>
								<span class="racer-name">{RACER_NAMES[i]}</span>
								{#if racer.ready}
									<span class="racer-time">{racer.current?.value}ms</span>
									{#if winner.current?.id === i + 1}
										<span class="trophy">🏆</span>
									{/if}
								{:else}
									<span class="racer-progress"><span class="spinner"></span></span>
								{/if}
							</div>
						{/each}
					</div>

					{#if winner.ready}
						<div class="fade-in winner-announcement">
							<div class="winner-text">
								🎉 <strong>{RACER_NAMES[(winner.current?.id ?? 1) - 1]}</strong> wins!
							</div>
							<div class="winner-details">
								Value: {winner.current?.value} · Timestamp: {new Date(winner.current?.timestamp ?? 0).toLocaleTimeString()}
							</div>
						</div>
					{:else}
						<p class="loading">Racing... who will win?</p>
					{/if}
				</div>
			</Boundary>
		</section>
	</div>
</PageBoundary>

<style>
	.racers-grid {
		display: grid;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}

	.racer {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem 1rem;
		background: var(--bg-secondary);
		border-radius: var(--border-radius);
		border: 2px solid transparent;
		transition: all 0.3s ease;
	}

	.racer.finished {
		background: var(--bg-tertiary);
	}

	.racer.winner {
		border-color: var(--accent-primary);
		background: rgba(var(--accent-primary-rgb), 0.1);
	}

	.racer-name {
		font-size: 1.1rem;
		min-width: 120px;
	}

	.racer-time {
		color: var(--text-secondary);
		font-family: var(--font-mono);
	}

	.racer-progress {
		display: flex;
		align-items: center;
	}

	.trophy {
		margin-left: auto;
		font-size: 1.5rem;
		animation: bounce 0.5s ease infinite alternate;
	}

	@keyframes bounce {
		from { transform: translateY(0); }
		to { transform: translateY(-4px); }
	}

	.winner-announcement {
		text-align: center;
		padding: 1.5rem;
		background: linear-gradient(135deg, rgba(var(--accent-primary-rgb), 0.1), rgba(var(--accent-secondary-rgb), 0.1));
		border-radius: var(--border-radius);
	}

	.winner-text {
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
	}

	.winner-details {
		color: var(--text-secondary);
		font-size: 0.9rem;
	}
</style>
