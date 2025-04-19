import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';

export function Navbar() {
	const { theme, setTheme } = useTheme();

	return (
		<header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
			<div className='container flex h-14 items-center'>
				<div className='mr-4 flex'>
					<a href='/' className='mr-6 flex items-center space-x-2'>
						<div className='h-6 w-6 bg-foreground rotate-45'></div>
						<span className='hidden font-bold sm:inline-block'>
							Artic Catalog
						</span>
					</a>
				</div>
				<nav className='flex flex-1 items-center justify-between space-x-2 md:justify-end'>
					<Button
						variant='ghost'
						size='icon'
						onClick={() =>
							setTheme(theme === 'light' ? 'dark' : 'light')
						}
						className='h-9 w-9 rounded-none'
					>
						<Sun className='h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
						<Moon className='absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
						<span className='sr-only'>Toggle theme</span>
					</Button>
				</nav>
			</div>
		</header>
	);
}
