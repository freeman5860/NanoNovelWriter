# NanoNovelWriter

AI 辅助小说写作工具 — 小说/章节管理 + TipTap 富文本编辑器 + Gemini/Claude 流式生成。

## 技术栈

- **框架**: Next.js 16 (App Router) + TypeScript
- **UI**: Tailwind CSS v4 + shadcn/ui (new-york / zinc)
- **编辑器**: TipTap (StarterKit + Placeholder + CharacterCount)
- **数据库**: PostgreSQL + Prisma 7 ORM
- **AI 默认**: Gemini 2.0 Flash (@google/generative-ai)
- **AI 备用**: Claude Sonnet 4.6 (@anthropic-ai/sdk)
- **流式**: SSE via fetch + ReadableStream

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写：

```env
DATABASE_URL="postgresql://user:password@localhost:5432/nanonovelwriter"
AI_PROVIDER="gemini"       # 或 "claude"
GEMINI_API_KEY="..."
ANTHROPIC_API_KEY="..."
```

### 3. 初始化数据库

```bash
# 确保 PostgreSQL 已启动，并创建数据库
createdb nanonovelwriter

# 运行迁移
pnpm prisma migrate dev --name init
```

### 4. 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) — 自动跳转到 `/novels`。

---

## 功能

- **小说管理**: 创建、浏览、删除小说（标题、类型、简介）
- **章节管理**: 自动排序、侧边栏导航
- **富文本编辑**: 加粗、斜体、标题、列表、引用、撤销/重做
- **自动保存**: 1500ms debounce，状态栏显示保存状态
- **字数统计**: 实时显示当前章节字数
- **AI 生成**:
  - 生成开头
  - 续写（基于最后 500 字）
  - 润色（选中文字后操作）
- **SSE 流式输出**: token 逐字出现，可插入编辑器或丢弃
- **Provider 切换**: 通过 `AI_PROVIDER` 环境变量选择 Gemini 或 Claude

## 项目结构

```
src/
├── app/
│   ├── api/novels/          # CRUD API
│   ├── api/ai/generate/     # SSE 生成端点
│   ├── novels/              # 小说列表、详情
│   └── novels/[id]/chapters/[id]/  # 编辑器页
├── components/
│   ├── novels/              # NovelCard, NovelList, CreateNovelDialog
│   ├── chapters/            # ChapterSidebar, ChapterListItem, CreateChapterDialog
│   ├── editor/              # EditorPage, EditorToolbar
│   └── ai/                  # AISidebar, AiActionButton, StreamingText
├── lib/
│   ├── prisma.ts            # 单例 PrismaClient (with pg adapter)
│   └── ai/                  # Provider 抽象 + Gemini/Claude 实现
├── hooks/                   # use-novels, use-chapters, use-ai-stream
└── types/index.ts
```

## 数据库管理

```bash
pnpm prisma studio         # 可视化管理数据
pnpm prisma migrate dev    # 应用新迁移
pnpm prisma generate       # 重新生成客户端
```
