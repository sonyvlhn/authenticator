import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Em desenvolvimento, o Next bloqueia origens diferentes de "localhost". Sem esta liberação,
  // ao acessar pelo IP da rede (ex.: pelo celular) a página carrega, mas o React não é ativado
  // e nenhum botão funciona. Não tem efeito em produção (next build / next start).
  allowedDevOrigins: ["192.168.1.69"],
};

export default nextConfig;
