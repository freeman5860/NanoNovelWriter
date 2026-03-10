import { NovelList } from "@/components/novels/novel-list";

export const metadata = { title: "我的小说 | NanoNovelWriter" };

export default function NovelsPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <NovelList />
    </main>
  );
}
