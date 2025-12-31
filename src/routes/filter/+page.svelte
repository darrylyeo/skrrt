<script lang="ts">
	import { filter } from '$lib/RemoteResource.svelte'
	import { getUser } from '../demo.remote'

	const users = [getUser(1), getUser(2), getUser(3), getUser(4), getUser(5)]

	const activeUsers = filter(users, u => u.active)
	const inactiveUsers = filter(users, u => !u.active)
	const emailContainsA = filter(users, u => u.email.includes('a'))

	const refresh = () => users.forEach(u => u.refresh())
</script>

<svelte:boundary>
	<div class="page">
		<a href="/" class="page-back">← Back to Home</a>

		<header class="page-header">
			<h1 class="page-title">filter()</h1>
			<p class="page-description">
				Filters an array of RemoteResources based on their resolved values.
				Returns a new RemoteResource containing the filtered array.
			</p>
		</header>

		<section class="section">
			<h2>Usage</h2>
			<div class="code-block">
				<pre><code>{`import { filter } from '$lib/RemoteResource.svelte'

const users = [getUser(1), getUser(2), getUser(3), getUser(4), getUser(5)]

const activeUsers = filter(users, u => u.active)
const inactiveUsers = filter(users, u => !u.active)`}</code></pre>
			</div>
		</section>

		<section class="section">
			<div class="section-header">
				<h2>Result</h2>
				{#if activeUsers.loading}
					<button class="status status-loading" onclick={refresh}><span class="spinner"></span> Loading</button>
				{:else}
					<button class="status status-success" onclick={refresh}>↻ Refresh</button>
				{/if}
			</div>

			<div class="demo-box">
				{#if activeUsers.ready}
					<div class="fade-in">
						<div class="comparison" style="margin-bottom: 1.5rem;">
							<div class="comparison-item">
								<div class="comparison-label">Active Users ({activeUsers.current?.length})</div>
								<div class="item-list">
									{#each activeUsers.current ?? [] as user}
										<div class="item">
											<div class="item-icon" style="background: var(--accent-primary); color: var(--bg-primary);">✓</div>
											<div class="item-content">
												<div class="item-title">{user.name}</div>
												<div class="item-subtitle">{user.email}</div>
											</div>
										</div>
									{/each}
								</div>
							</div>
							<div class="comparison-item">
								<div class="comparison-label">Inactive Users ({inactiveUsers.current?.length})</div>
								<div class="item-list">
									{#each inactiveUsers.current ?? [] as user}
										<div class="item">
											<div class="item-icon" style="background: var(--text-muted); color: var(--bg-primary);">✗</div>
											<div class="item-content">
												<div class="item-title">{user.name}</div>
												<div class="item-subtitle">{user.email}</div>
											</div>
										</div>
									{/each}
								</div>
							</div>
						</div>

						<h4 style="color: var(--text-secondary); margin-bottom: 0.75rem;">
							Emails containing 'a' ({emailContainsA.current?.length})
						</h4>
						<div class="item-list">
							{#each emailContainsA.current ?? [] as user}
								<div class="item">
									<div class="item-content">
										<div class="item-title">{user.name}</div>
										<div class="item-subtitle" style="font-family: var(--font-mono);">{user.email}</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{:else}
					<p class="loading">Loading users...</p>
				{/if}
			</div>
		</section>
	</div>

	{#snippet failed(error, retry)}
		<div class="page">
			<a href="/" class="page-back">← Back to Home</a>
			<h1 class="page-title">filter()</h1>
			<div class="demo-box">
				<p class="error">Error: {error instanceof Error ? error.message : String(error)}</p>
				<button class="btn" onclick={retry}>↻ Retry</button>
			</div>
		</div>
	{/snippet}
</svelte:boundary>
