"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import React from 'react'

export default function Login() {

const router = useRouter();
const [email, setEmail] = useState<string>('');
const [password, setPassword] = useState<string>('');
const [isLoading, setIsLoading] = useState<boolean>(false);
const [error, setError] = useState<string>('');
const [showPassword, setShowPassword] = useState(false);

async function handleSubmit(): Promise<void> {
  setIsLoading(true);
  setError("");

  try {
    //A função fetch é usada para fazer requisições HTTP.
    const response = await fetch("/api/auth/login", {
        method: 'POST', // "POST" é o método HTTP que será usado para enviar os dados para o servidor. "GET" é o método HTTP que será usado para receber os dados do servidor.
        headers: {
            'Content-Type': 'application/json', // Define o tipo de conteúdo que será enviado para o servidor. Converte as informações em JSON
        },
        body: JSON.stringify({email, password}), // Converte as informações em JSON e envia para o servidor.
    })

    //Aqui está ocorrendo a tipagem da resposta do back-end da requisição feita nas linhas acima. 
    //Nesta linha o "error" está como "optional" (opcional) por isso usa-se o "?" 
    //pois em caso de erro a mensagem vem como "data.error", mas em caso de sucesso a "data.error" virá como "undefined" (indefinido). 
    const data: {error?: string } = await response.json();

    if(!response.ok){
        setError(data.error || "Algo deu errado :(");
        return
    }
    router.push("/");// Direcionamento após o login para a página desejada
  } catch {
    setError("Erro na conexão");
  } finally{
    setIsLoading(false);
  }
}
  return (
    <div className="flex justify-center items-center min-h-screen bg-zinc-50">
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="w-full max-w-sm bg-gray-200 rounded-xl inset-shadow-sm p-8">
            <h1 className="flex justify-center text-gray-900 text-2xl font-bold mb-2">Login</h1>
            <p className="text-slate-400 text-xs mb-5 text-center">Preencha seus dados para entrar</p>
            {error &&(
                <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-red-400 text-sm">
                    {error}
                </div>
            )}
            <input type="email"
                   value={email}
                   placeholder="E-mail"
                   onChange={(e: React.ChangeEvent<HTMLInputElement>)=> setEmail(e.target.value)}
                   className="w-full px-3 py-2 border-b-2 border-gray-400 text-gray-900 mb-5 focus:outline-none" />
            <div className="relative mb-4">
                <input type={showPassword ? "text" : "password"}
                       value={password}
                       placeholder="Senha"
                       onChange={(e: React.ChangeEvent<HTMLInputElement>)=> setPassword(e.target.value)}
                       className="w-full px-3 py-2 border-b-2 border-gray-400 text-gray-900 mb-5 focus:outline-none" />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-2 pb-5 text-gray-400 hover:text-gray-600 transition focus:outline-none">
                    {showPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.076m3.102-3.007A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21m-2.101-2.101L3 3m5.074 5.074a3 3 0 104.243 4.243" />
                        </svg>
                    )}
                </button>
            </div>
            <button
                type="submit"
                id = "btnEntrar"
                disabled={isLoading}
                className="w-full rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                {isLoading ? "Enviando..." : "Entrar"}
            </button>
            <p className="text-slate-400 text-sm mt-5 text-center">Não tem conta?{" "}
                <a href="/Register" className="text-sky-600 hover:underline">Cadastre-se</a>
            </p>
        </form>
    </div>
  )
}
