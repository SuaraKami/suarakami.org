<script lang="ts">
	import Icon from '@iconify/svelte';
	import logo from '$lib/assets/logo.png';
</script>

<div class="relative min-h-screen bg-white p-4 font-sans text-black antialiased">
	<div class="absolute right-0 top-0 h-24 w-24 bg-red-600"></div>
	<div class="absolute right-14 top-14 h-12 w-12 bg-black"></div>

	<main class="relative mx-auto max-w-md py-12">
		<header class="mb-12">
			<div class="mb-8 flex items-start">
				<div class="h-12 w-12 rounded-full border-2 border-red-600">
					<img alt="SuaraKami logo" loading="eager" src={logo} width="44" height="44" />
				</div>
			</div>
			<h1 class="mb-4 text-5xl font-bold leading-none tracking-tight sm:text-6xl">
				SUARA<br />KAMI
			</h1>
			<div class="flex items-center gap-2 text-sm">
				<Icon icon="lucide:dot" class="h-4 w-4 text-red-600" />
				<span>AACHEN</span>
				<Icon icon="lucide:dot" class="h-4 w-4" />
				<span>EST. 2019</span>
			</div>
		</header>

		<div class="mb-12 border-l-2 border-black pl-4">
			<p class="text-lg font-medium">
				Pergerakan pemuda non-profit dan non-partisan dibidang sosial politik dalam lingkup
				demokrasi 🇮🇩
			</p>
		</div>

		<div class="mb-12 grid grid-cols-2 gap-4">
			<a
				href="https://tally.so/r/EkzdAr"
				class="group relative col-span-2 flex h-24 items-center justify-center bg-[#8B5CF6] text-white"
			>
				<Icon icon="lucide:file-text" class="mr-2 h-6 w-6" />
				<span class="text-sm font-bold tracking-wider">KKN The Series "tax.talk"</span>
				<Icon
					icon="lucide:external-link"
					class="absolute right-2 top-2 h-4 w-4 transition-transform group-hover:translate-x-1"
				/>
			</a>
			<a
				href="https://www.instagram.com/suarakami"
				class="group relative flex h-24 items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500 text-white"
			>
				<Icon icon="simple-icons:instagram" class="h-6 w-6" />
				<Icon
					icon="lucide:external-link"
					class="absolute right-2 top-2 h-4 w-4 transition-transform group-hover:translate-x-1"
				/>
			</a>
			<a
				href="https://x.com/suarakamiapp"
				class="group relative flex h-24 items-center justify-center bg-black text-white"
			>
				<Icon icon="simple-icons:x" class="h-6 w-6" />
				<Icon
					icon="lucide:external-link"
					class="absolute right-2 top-2 h-4 w-4 transition-transform group-hover:translate-x-1"
				/>
			</a>
			<a
				href="https://www.linkedin.com/company/suarakami"
				class="group relative flex h-24 items-center justify-center bg-[#0A66C2] text-white"
			>
				<Icon icon="simple-icons:linkedin" class="h-6 w-6" />
				<Icon
					icon="lucide:external-link"
					class="absolute right-2 top-2 h-4 w-4 transition-transform group-hover:translate-x-1"
				/>
			</a>
			<a
				href="https://suarakami.id"
				class="group relative flex h-24 items-center justify-center border-2 border-black bg-white"
			>
				<Icon icon="lucide:globe" class="h-6 w-6" />
				<span class="ml-2 text-sm font-bold tracking-wider">WEBSITE</span>
				<Icon
					icon="lucide:external-link"
					class="absolute right-2 top-2 h-4 w-4 transition-transform group-hover:translate-x-1"
				/>
			</a>
		</div>

		<div class="relative">
			<div class="absolute -left-4 bottom-0 top-0 w-1 bg-red-600"></div>
			<button
				class="focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground inline-flex h-9 w-full items-center justify-start gap-4 whitespace-nowrap rounded-md px-4 py-2 text-lg font-medium transition-colors hover:bg-transparent hover:text-red-600 focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
			>
				<Icon icon="lucide:mail" class="h-5 w-5" />
				info@suarakami.id
			</button>
		</div>

		<footer class="mt-12 flex items-center justify-between text-sm">
			<span>© {new Date().getFullYear()} SuaraKami</span>
			<div class="h-px w-12 bg-black"></div>
		</footer>
	</main>
</div>
