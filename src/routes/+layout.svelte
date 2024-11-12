<script lang="ts">
	import '@fontsource-variable/plus-jakarta-sans';
	import '../app.css';

	let { children } = $props();
	const isProd = import.meta.env.PROD;
</script>

<svelte:head>
	{#if isProd}
		<script
			defer
			data-domain="bio.suarakami.id"
			src="https://analytics.suarakami.id/js/script.js"
		></script>
	{/if}
</svelte:head>

{@render children()}
