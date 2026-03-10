-- CreateTable
CREATE TABLE "novels" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "genre" TEXT,
    "aiProvider" TEXT,
    "aiModel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "novels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapters" (
    "id" TEXT NOT NULL,
    "novelId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chapters_novelId_idx" ON "chapters"("novelId");

-- CreateIndex
CREATE UNIQUE INDEX "chapters_novelId_order_key" ON "chapters"("novelId", "order");

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_novelId_fkey" FOREIGN KEY ("novelId") REFERENCES "novels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
