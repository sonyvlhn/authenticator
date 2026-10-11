-- CreateTable
CREATE TABLE "ProdutoImagem" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "produtoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProdutoImagem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProdutoImagem_produtoId_idx" ON "ProdutoImagem"("produtoId");

-- AddForeignKey
ALTER TABLE "ProdutoImagem" ADD CONSTRAINT "ProdutoImagem_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produtos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Copia a imagem que cada produto já tinha para a galeria (ela continua sendo a foto de destaque)
INSERT INTO "ProdutoImagem" ("id", "url", "ordem", "produtoId")
SELECT gen_random_uuid()::text, "imagemUrl", 0, "id"
FROM "Produtos"
WHERE "imagemUrl" IS NOT NULL;
