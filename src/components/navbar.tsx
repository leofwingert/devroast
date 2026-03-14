import Link from "next/link";

function Navbar() {
	return (
		<nav className="flex h-14 w-full items-center justify-between border-b border-border-primary bg-bg-page px-10">
			<Link href="/" className="flex items-center gap-2">
				<span className="font-mono text-xl font-bold text-accent-green">
					{">"}
				</span>
				<span className="font-mono text-lg font-medium text-text-primary">
					devroast
				</span>
			</Link>

			<div className="flex items-center gap-6">
				<Link
					href="/leaderboard"
					className="font-mono text-[13px] text-text-secondary transition-colors hover:text-text-primary"
				>
					leaderboard
				</Link>
			</div>
		</nav>
	);
}

export { Navbar };
