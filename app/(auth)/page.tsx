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
  const [success, setSuccess] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState<string>("");
  // Alterna entre a tela de login e a de cadastro, limpando as mensagens
  function alternarTela(login: boolean): void {
    setShowLogin(login);
    setError("");
    setSuccess("");
  }

  /* Funções de Autenticação */
  async function handleSubmitLogin(e: React.FormEvent): Promise<void> {
    e.preventDefault(); //impede que a página seja recarregada ao enviar o formulário
    setIsLoading(true); //inicia o loading
    setError(""); //limpa o erro
    setSuccess("");

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
    setSuccess("");
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
      const data: { error?: string; message?: string } = await res.json();

      if (!res.ok) {
        setError(data.error || "Algo deu errado");
        return;
      }
      // O novo usuário não entra no sistema: volta para o login e aguarda a liberação do admin
      setPassword("");
      setShowLogin(true);
      setSuccess(data.message || "Conta criada! Aguarde a liberação do seu acesso por um administrador.");
    } catch {
      setError("Não foi possível conectar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }
  /* Front-end de Autenticação */
  return (
    <main className="min-h-dvh bg-zinc-50 flex items-center justify-center px-4 py-6">
      <div className="relative overflow-hidden w-full max-w-md md:max-w-none md:w-[700px] md:h-[440px] rounded-2xl inset-shadow-sm bg-gray-200">
        {/* Cabeçalho mobile: substitui o painel deslizante em telas pequenas */}
        <div className="md:hidden bg-linear-to-br from-slate-900 to-slate-600 text-white text-center px-6 pt-8 pb-6 rounded-b-2xl">
          <h1 className="text-2xl font-bold">{showLogin ? "Bem-vindo de volta!" : "Junte-se a nós!"}</h1>
          <p className="text-white/80 text-sm mt-1">
            {showLogin ? "Use seus dados para acessar sua conta." : "Preencha os campos abaixo para se cadastrar."}
          </p>
          <div role="tablist" className="mt-5 grid grid-cols-2 gap-1 rounded-full bg-white/10 p-1">
            <button
              type="button"
              role="tab"
              aria-selected={showLogin}
              onClick={() => alternarTela(true)}
              className={`rounded-full py-2 text-sm font-semibold transition-colors duration-300 ${showLogin ? "bg-white text-slate-900 shadow" : "text-white/80"}`}
            >
              Entrar
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!showLogin}
              onClick={() => alternarTela(false)}
              className={`rounded-full py-2 text-sm font-semibold transition-colors duration-300 ${!showLogin ? "bg-white text-slate-900 shadow" : "text-white/80"}`}
            >
              Criar conta
            </button>
          </div>
        </div>

        {/* Form de Login */}
        <form
          onSubmit={handleSubmitLogin}
          className={`${showLogin ? "flex" : "hidden md:flex"} w-full flex-col items-center justify-center px-6 py-8 md:absolute md:inset-y-0 md:left-0 md:w-1/2 md:h-full md:px-10 md:py-0 transition-all duration-500 ease-in-out ${
            showLogin
              ? "opacity-100 pointer-events-auto translate-x-0"
              : "opacity-0 pointer-events-none -translate-x-6"
          }`}
        >
          <h2 className="hidden md:block text-2xl font-bold text-slate-800 transition-all ease-out duration-200">Faça Login</h2>
          <p className="hidden md:block text-slate-500 text-sm mb-5 transition-all ease-out duration-200">
            Use seus dados para acessar sua conta.
          </p>
          {success && showLogin && (
            <div className="w-full animate-slide-auth mb-4 rounded-lg bg-green-500/10 border border-green-500/30 px-3 py-2 text-green-700 text-sm">
              {success}
            </div>
          )}
          {error && showLogin && (
            <div className={`w-full grid transition-all duration-300 ease-out ${error && showLogin ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`} >
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
            autoComplete="email"
            inputMode="email"
            className="w-full px-3 py-2 border-b-2 border-gray-400 text-gray-900 focus:outline-none mb-5"
            placeholder="Email"
            required
          />
          <div className="relative mb-4 w-full">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder="Senha"
              autoComplete="current-password"
              required
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              className="w-full px-3 py-2 border-b-2 border-gray-400 text-gray-900 mb-5 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              className="absolute inset-y-0 right-0 flex items-center px-2 pb-6 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
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
            className="w-full md:w-auto px-8 py-3 md:py-2.5 bg-linear-to-r from-slate-900 to-slate-700 text-white rounded-full font-semibold shadow-lg hover:bg-slate-800 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {/* Form de Cadastro */}
        <form
          onSubmit={handleSubmitRegister}
          className={`${!showLogin ? "flex" : "hidden md:flex"} w-full flex-col items-center justify-center px-6 py-8 md:absolute md:inset-y-0 md:right-0 md:w-1/2 md:h-full md:px-10 md:py-0 transition-all duration-500 ease-in-out delay-150 ${
            !showLogin
              ? "opacity-100 pointer-events-auto translate-x-0"
              : "opacity-0 pointer-events-none translate-x-6"
          }`}
        >
          <h2 className="hidden md:block text-2xl font-bold text-slate-800 transition-all ease-out duration-200">Crie sua Conta</h2>
          <p className="hidden md:block text-slate-500 text-sm mb-4 transition-all ease-out duration-200">Preencha os campos abaixo</p>

            {error && !showLogin && (
            <div className={`w-full grid transition-all duration-300 ease-out ${error && !showLogin ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`} >
              <div className="overflow-hidden">
                <div className="animate-slide-auth mb-4 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-red-400 text-sm">
                  {error}
                </div>
              </div>
            </div>
          )}
          <div className="w-full transition-all ease-out duration-200">
            <input
              type="text" //type define o tipo de input
              value={name} //value recebe o valor do input
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="Nome"
              className="w-full px-3 py-2 border-b-2 border-gray-400 text-gray-900 mb-5 focus:outline-none"
              required
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
              placeholder="Email"
              className="w-full px-3 py-2 border-b-2 border-gray-400 text-gray-900 mb-5 focus:outline-none"
              required //impede que o formulário seja enviado sem o campo preenchido
            />
            <div className="relative w-full mb-4">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="Senha"
                autoComplete="new-password"
                required
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                className="w-full px-3 py-2 border-b-2 border-gray-400 text-gray-900 mb-5 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                className="absolute inset-y-0 right-0 flex items-center px-2 pb-6 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
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
            className="w-full md:w-auto px-8 py-3 md:py-2.5 bg-linear-to-r from-slate-900 to-slate-700 text-white rounded-full font-semibold shadow-lg hover:bg-slate-800 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        {/* Painel deslizante */}
        <div
          className={`hidden md:flex absolute inset-y-0 w-1/2 z-10 bg-linear-to-br from-slate-900 to-slate-600 flex-col items-center justify-center text-white text-center px-10 gap-4 rounded-2xl transition-transform duration-500 ease-in-out shadow-slate-500 ${
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
                onClick={() => alternarTela(true)}
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
                onClick={() => alternarTela(false)}
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
