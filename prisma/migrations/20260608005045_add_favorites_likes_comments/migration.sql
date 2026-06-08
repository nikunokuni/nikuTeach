-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "supporterId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Favorite_supporterId_fkey" FOREIGN KEY ("supporterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Favorite_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EpisodeLike" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "episodeId" TEXT NOT NULL,
    "supporterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EpisodeLike_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EpisodeLike_supporterId_fkey" FOREIGN KEY ("supporterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EpisodeComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "episodeId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EpisodeComment_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EpisodeComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Favorite_supporterId_idx" ON "Favorite"("supporterId");

-- CreateIndex
CREATE INDEX "Favorite_studentId_idx" ON "Favorite"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_supporterId_studentId_key" ON "Favorite"("supporterId", "studentId");

-- CreateIndex
CREATE INDEX "EpisodeLike_episodeId_idx" ON "EpisodeLike"("episodeId");

-- CreateIndex
CREATE UNIQUE INDEX "EpisodeLike_episodeId_supporterId_key" ON "EpisodeLike"("episodeId", "supporterId");

-- CreateIndex
CREATE INDEX "EpisodeComment_episodeId_idx" ON "EpisodeComment"("episodeId");
