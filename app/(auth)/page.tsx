"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [showLogin, setShowLogin] = useState(true); //Controla qual tela será renderizada, Login ou Register através do true ou false
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState<string>("");
  /* Funções de Autenticação */
  async function handleSubmitLogin(e: React.FormEvent): Promise<void> {
    e.preventDefault(); //impede que a página seja recarregada ao enviar o formulário
    setIsLoading(true); //inicia o loading
    setError(""); //limpa o erro

    // Conexão com o banco de dados para login
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data: { error?: string } = await response.json();

      if (!response.ok) {
        setError(data.error || "Algo deu errado :(");
        return;
      }
      router.push("/Welcome");//redireciona para a página de Admin
    } catch {
      setError("Erro na conexão");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmitRegister(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    // Conexão com o banco de dados para registro
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });
      const data: { error?: string } = await res.json();

      if (!res.ok) {
        setError(data.error || "Algo deu errado");
        return;
      }
      router.push("/Produtos");
    } catch {
      setError("Não foi possível conectar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }
  /* Front-end de Autenticação */
  return (
    <main className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="relative overflow-hidden w-[700px] h-[440px] rounded-2xl inset-shadow-sm bg-gray-200">
        {/* Form de Login */}
        <form
          onSubmit={handleSubmitLogin}
          className={`absolute inset-y-0 left-0 w-1/2 h-full flex flex-col items-center justify-center px-10  transition-all duration-500 ease-in-out ${
            showLogin
              ? "opacity-100 pointer-events-auto translate-x-0"
              : "opacity-0 pointer-events-none -translate-x-6"
          }`}
        >
          <h2 className="text-2xl font-bold text-slate-800 transistion-all ease-out duration-200">Faça Login</h2>
          <p className="text-slate-500 text-sm mb-5 transistion-all ease-out duration-200">
            Use seus dados para acessar sua conta.
          </p>
          {error && showLogin && (
            <div className={`grid transition-all duration-300 ease-out ${error && showLogin ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`} >
              <div className="overflow-hidden">
                <div className="animate-slide-auth mb-4 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-red-400 text-sm">
                  {error}
                </div>
              </div>
            </div>
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border-b-2 border-gray-400 text-gray-900 focus:outline-none mb-5"
            placeholder="Email"
            required
          />
          <div className="relative mb-4 w-full">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder="Senha"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              className="w-full px-3 py-2 border-b-2 border-gray-400 text-gray-900 mb-5 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-1 pb-6 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
            >
              {showPassword ? (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.076m3.102-3.007A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21m-2.101-2.101L3 3m5.074 5.074a3 3 0 104.243 4.243"
                  />
                </svg>
              )}
            </button>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-2.5 bg-linear-to-r from-slate-900 to-slate-700 text-white rounded-full font-semibold shadow-lg hover:bg-slate-800 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {/* Form de Cadastro */}
        <form
          onSubmit={handleSubmitRegister}
          className={`absolute inset-y-0 right-0 w-1/2 h-full flex flex-col items-center justify-center px-10  transition-all duration-500 ease-in-out delay-150 ${
            !showLogin
              ? "opacity-100 pointer-events-auto translate-x-0"
              : "opacity-0 pointer-events-none translate-x-6"
          }`}
        >
          <h2 className="text-2xl font-bold text-slate-800 transistion-all ease-out duration-200">Crie sua Conta</h2>
          <p className="text-slate-500 text-sm mb-4 transistion-all ease-out duration-200">Preencha os campos abaixo</p>

            {error && !showLogin && (
            <div className={`grid transition-all duration-300 ease-out ${error && !showLogin ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`} >
              <div className="overflow-hidden">
                <div className="animate-slide-auth mb-4 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-red-400 text-sm">
                  {error}
                </div>
              </div>
            </div>
          )}
          <div className="transistion-all ease-out duration-200">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome"
              className="w-full px-3 py-2 border-b-2 border-gray-400 text-gray-900 mb-5 focus:outline-none"
              required
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-3 py-2 border-b-2 border-gray-400 text-gray-900 mb-5 focus:outline-none"
              required
            />
            <div className="relative w-full mb-4">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="Senha"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                className="w-full px-3 py-2 border-b-2 border-gray-400 text-gray-900 mb-5 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-1 pb-6 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.076m3.102-3.007A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21m-2.101-2.101L3 3m5.074 5.074a3 3 0 104.243 4.243"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-2.5 bg-linear-to-r from-slate-900 to-slate-700 text-white rounded-full font-semibold shadow-lg hover:bg-slate-800 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            {isLoading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        {/* Painel deslizante */}
        <div
          className={`absolute inset-y-0 w-1/2 z-10 bg-linear-to-br from-slate-900 to-slate-600 flex flex-col items-center justify-center text-white text-center px-10 gap-4 rounded-2xl transition-transform duration-500 ease-in-out shadow-slate-500 ${
            showLogin ? "translate-x-full left-0" : "translate-x-0 left-0"
          }`}
        >
          {!showLogin ? (
            <>
              <h2 className="text-2xl font-bold">Olá, amigo!</h2>
              <p className="text-white/80 leading-relaxed">
                Caso você já possua conta, clique no botão abaixo para fazer
                login.
              </p>
              <button
                onClick={() => {
                  setShowLogin(true);
                  setError("");
                }}
                className="px-8 py-2.5 mt-10 bg-white text-slate-900 rounded-full font-semibold shadow-lg hover:bg-slate-100 transition-all duration-300 transform hover:-translate-y-0.5 tracking-widest"
              >
                Fazer login
              </button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold">Junte-se a nós!</h2>
              <p className="text-white/80 leading-relaxed">
                Clique no botão abaixo e faça seu cadastro para começar a usar nossa plataforma.
              </p>
              <button
                onClick={() => {
                  setShowLogin(false);
                  setError("");
                }}
                className="px-8 py-2.5 mt-10 bg-white text-slate-900 rounded-full font-semibold shadow-lg hover:bg-slate-100 transition-all duration-300 transform hover:-translate-y-0.5 tracking-widest"
              >
                Criar conta
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
