-- CreateEnum
CREATE TYPE "TipoAcesso" AS ENUM ('VISUALIZADOR', 'EDITOR', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tipoAcesso" "TipoAcesso" NOT NULL DEFAULT 'VISUALIZADOR';
