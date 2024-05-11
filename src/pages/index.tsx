import { trpc } from '../utils/trpc';
import { fetchStoriesFromPage } from '../utils/cheerio';
import type { NextPageWithLayout } from './_app';
import type { inferProcedureInput } from '@trpc/server';
import Link from 'next/link';
import { Fragment } from 'react';
import type { AppRouter } from '@/server/routers/_app';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { SunIcon, MoonIcon, CheckIcon } from '@radix-ui/react-icons';
import { cn } from '@/utils/shadcn';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';

function ThemeSetPopover({
  selectedTheme,
  setSelectedTheme,
}: {
  selectedTheme: string;
  setSelectedTheme: (theme: string) => void;
}) {
  const themes = ['dark', 'light'];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        {selectedTheme === 'dark' ? <MoonIcon className="" /> : <SunIcon />}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {themes.map((item) => (
          <DropdownMenuCheckboxItem
            onSelect={() => setSelectedTheme(item)}
            key={item}
          >
            {item}
            {item === selectedTheme && <CheckIcon />}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
export function CommandMenu({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: any;
}) {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open: boolean) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="请输入故事关键词..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>Calendar</CommandItem>
          <CommandItem>Search Emoji</CommandItem>
          <CommandItem>Calculator</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
const IndexPage: NextPageWithLayout = () => {
  const [openSearch, setOpenSearch] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('light');
  const utils = trpc.useUtils();
  const postsQuery = trpc.post.list.useInfiniteQuery(
    {
      limit: 5,
    },
    {
      getNextPageParam(lastPage) {
        return lastPage.nextCursor;
      },
    },
  );

  const addPost = trpc.post.add.useMutation({
    async onSuccess() {
      // refetches posts after a post is added
      await utils.post.list.invalidate();
    },
  });
  const handleSearch = () => {
    setOpenSearch(true);
  };

  const addManyStorys = trpc.post.addMany.useMutation({
    async onSuccess() {
      // refetches posts after a post is added
      await utils.post.list.invalidate();
    },
  });
  // prefetch all posts for instant navigation
  // useEffect(() => {
  //   const allPosts = postsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  //   for (const { id } of allPosts) {
  //     void utils.post.byId.prefetch({ id });
  //   }
  // }, [postsQuery.data, utils]);

  return (
    // 所以，主体色的核心实际上就是bg-background text-foreground这两个样式
    <div
      className={cn(
        'relative flex min-h-screen flex-col bg-background text-foreground',
        selectedTheme,
      )}
    >
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="mr-4 hidden md:flex">
            <a href="/">
              <img className="w-36" src="/logo.png" alt="" />
            </a>
          </div>
          <button
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground h-9 py-2 mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            type="button"
            aria-haspopup="dialog"
            aria-expanded="false"
            aria-controls="radix-:R16u6la:"
            data-state="closed"
          >
            <svg
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
            >
              <path
                d="M3 5H11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
              <path
                d="M3 12H16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
              <path
                d="M3 19H21"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
            <span className="sr-only">Toggle Menu</span>
          </button>
          <p className="text-[24px] font-bold hidden md:flex">故事列表</p>
          <Button
            onClick={() => {
              addManyStorys.mutateAsync();
            }}
            className="ml-8"
          >
            抓取故事
          </Button>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <CommandMenu open={openSearch} setOpen={setOpenSearch} />
            <button
              onClick={handleSearch}
              className="inline-flex items-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground px-4 py-2 relative h-8 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
            >
              <span className="hidden lg:inline-flex">搜索故事</span>
              <span className="inline-flex lg:hidden">搜索...</span>
              <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
            <ThemeSetPopover
              selectedTheme={selectedTheme}
              setSelectedTheme={setSelectedTheme}
            />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="border-b">
          <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
            <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
              xxx
            </aside>
            <main className="">
              <div className="flex flex-col py-8 items-start gap-y-2">
                {/* <video
                  controls
                  src="https://img.myysq.com.cn/retesting/ownerfile/2024/05/11/9a1f98d0-d197-c325-2e17-83ffaf6cb8c4.mov"
                ></video> */}
                <div className="flex flex-col"></div>
                <h2 className="text-3xl font-semibold">
                  Latest Posts
                  {postsQuery.status === 'pending' && '(loading)'}
                </h2>

                <Button
                  onClick={() => postsQuery.fetchNextPage()}
                  disabled={
                    !postsQuery.hasNextPage || postsQuery.isFetchingNextPage
                  }
                >
                  {postsQuery.isFetchingNextPage
                    ? 'Loading more...'
                    : postsQuery.hasNextPage
                    ? 'Load More'
                    : 'Nothing more to load'}
                </Button>

                {postsQuery.data?.pages.map((page, index) => (
                  <Fragment key={page.items[0]?.id ?? index}>
                    {page.items.map((item) => (
                      <article key={item.id}>
                        <h3 className="text-2xl font-semibold">{item.title}</h3>
                        <Link
                          className="text-gray-400"
                          href={`/post/${item.id}`}
                        >
                          View more
                        </Link>
                      </article>
                    ))}
                  </Fragment>
                ))}
              </div>

              <hr />

              <div className="flex flex-col py-8 items-center">
                <h2 className="text-3xl font-semibold pb-2">Add a Post</h2>

                <form
                  className="py-2 w-4/6"
                  onSubmit={async (e) => {
                    /**
                     * In a real app you probably don't want to use this manually
                     * Checkout React Hook Form - it works great with tRPC
                     * @link https://react-hook-form.com/
                     * @link https://kitchen-sink.trpc.io/react-hook-form
                     */
                    e.preventDefault();
                    const $form = e.currentTarget;
                    const values = Object.fromEntries(new FormData($form));
                    type Input = inferProcedureInput<AppRouter['post']['add']>;
                    //    ^?
                    const input: Input = {
                      title: values.title as string,
                      text: values.text as string,
                    };
                    try {
                      await addPost.mutateAsync(input);

                      $form.reset();
                    } catch (cause) {
                      console.error({ cause }, 'Failed to add post');
                    }
                  }}
                >
                  <div className="flex flex-col gap-y-4 font-semibold">
                    <input
                      id="title"
                      name="title"
                      type="text"
                      placeholder="Title"
                      disabled={addPost.isPending}
                    />
                    <textarea
                      className="resize-none focus-visible:outline-dashed outline-offset-4 outline-2 outline-gray-700 rounded-xl px-4 py-3"
                      id="text"
                      name="text"
                      placeholder="Text"
                      disabled={addPost.isPending}
                      rows={6}
                    />

                    <div className="flex justify-center">
                      <Button disabled={addPost.isPending}>提交</Button>

                      {addPost.error && (
                        <p style={{ color: 'red' }}>{addPost.error.message}</p>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </main>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IndexPage;

/**
 * If you want to statically render this page
 * - Export `appRouter` & `createContext` from [trpc].ts
 * - Make the `opts` object optional on `createContext()`
 *
 * @link https://trpc.io/docs/v11/ssg
 */
// export const getStaticProps = async (
//   context: GetStaticPropsContext<{ filter: string }>,
// ) => {
//   const ssg = createServerSideHelpers({
//     router: appRouter,
//     ctx: await createContext(),
//   });
//
//   await ssg.post.all.fetch();
//
//   return {
//     props: {
//       trpcState: ssg.dehydrate(),
//       filter: context.params?.filter ?? 'all',
//     },
//     revalidate: 1,
//   };
// };
