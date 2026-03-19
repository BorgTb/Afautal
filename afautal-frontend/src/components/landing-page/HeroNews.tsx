// components/home/HeroNoticia.tsx
export default function HeroNoticia({ noticia }: { noticia: { titulo: string; resumen: string; imagenUrl: string } }) {
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
          {noticia.titulo}
        </h1>
        <p className="mt-6 text-lg text-slate-600 leading-relaxed">
          {noticia.resumen}
        </p>
        <button className="mt-8 px-8 py-3 border-2 border-pink-500 text-pink-500 font-bold hover:bg-pink-500 hover:text-white transition-all uppercase tracking-widest text-sm">
          Ver Más →
        </button>
      </div>
      <div className="rounded-2xl overflow-hidden shadow-2xl">
        <img src={noticia.imagenUrl} alt="Estudio" className="w-full h-auto object-cover" />
      </div>
    </section>
  );
}