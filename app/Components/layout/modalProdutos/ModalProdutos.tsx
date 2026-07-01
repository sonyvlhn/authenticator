"use client"
import { useState } from "react"

export default function ModalProdutos() {

  const [open, setOpen] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <dialog className="bg-white p-4 rounded-lg">
        <h1>Crie seu Produto</h1>
        <input type="text" placeholder="Nome" />
        <input type="text" placeholder="Categoria" />
        <input type="text" placeholder="Preço" />
        <input type="text" placeholder="Imagem" />
        <button onClick={handleClose} className="bg-slate-800 hover:bg-slate-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200">fechar</button>
      </dialog>
    </div>
  )
}
