<script lang="ts">
	import { filter } from 'sveltekit-remote-resources'
	import { getUser } from '../demo.remote'
	import PageBoundary from '$lib/components/PageBoundary.svelte'
</script>

<PageBoundary title="filter()">
	{@const users = [getUser(1), getUser(2), getUser(3), getUser(4), getUser(5)]}
	{@const activeUsers = filter(users, u => u.active)}
	{@const inactiveUsers = filter(users, u => !u.active)}
	{@const emailContainsA = filter(users, u => u.email.includes('a'))}

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
				<pre><code>{`import { filter } from 'sveltekit-remote-resources'

const users = [getUser(1), getUser(2), getUser(3), getUser(4), getUser(5)]

const activeUsers = filter(users, u => u.active)
const inactiveUsers = filter(users, u => !u.active)`}</code></pre>
			</div>
		</section>

		<section class="section">
			<div class="section-header">
				<h2>Result</h2>
				{#if activeUsers.loading}
					<button class="status status-loading" onclick={() => users.forEach(u => u.refresh())}><span class="spinner"></span> Loading</button>
				{:else}
					<button class="status status-success" onclick={() => users.forEach(u => u.refresh())}>↻ Refresh</button>
				{/if}
			</div>

			<div class="demo-box">
				{#if activeUsers.ready}
					<div class="fade-in">
						<div class="comparison mb-lg">
							<div class="comparison-item">
								<div class="comparison-label">Active Users ({activeUsers.current?.length})</div>
								<div class="item-list">
									{#each activeUsers.current ?? [] as user}
										<div class="item">
											<div class="item-icon primary">✓</div>
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
											<div class="item-icon muted">✗</div>
											<div class="item-content">
												<div class="item-title">{user.name}</div>
												<div class="item-subtitle">{user.email}</div>
											</div>
										</div>
									{/each}
								</div>
							</div>
						</div>

						<h4 class="subsection-title">
							Emails containing 'a' ({emailContainsA.current?.length})
						</h4>
						<div class="item-list">
							{#each emailContainsA.current ?? [] as user}
								<div class="item">
									<div class="item-content">
										<div class="item-title">{user.name}</div>
										<div class="item-subtitle mono">{user.email}</div>
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
</PageBoundary>
