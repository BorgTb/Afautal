export default function NewsPage() {
    return (
        <div className="py-16 px-6 max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                Noticias
            </h1>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                Aquí encontrarás las últimas noticias y novedades sobre nuestra organización, eventos, actividades y temas de interés para nuestros asociados.
            </p>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {/* Ejemplo de noticia */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <img
                        src="/noticia-ejemplo.jpg"
                        alt="Noticia Ejemplo"
                        className="h-48 w-full object-cover rounded-t-lg"
                    />
                    <div className="p-6">
                        <h2 className="text-2xl font-semibold text-slate-900">
                            Título de la Noticia
                        </h2>
                        <p className="mt-4 text-slate-600">
                            Resumen breve de la
                            noticia para captar la atención del lector y animarlo a leer más.
                        </p>
                        <button className="mt-6 px-4 py-2 border-2 border-[#BF0F0F] text-[#BF0F0F] font-bold hover:bg-[#A61B26] hover:text-white transition-all uppercase tracking-widest text-sm">
                            Leer Más →
                        </button>
                    </div>
                </div>
                {/* Repetir el bloque de noticia para más noticias */}
            </div>
        </div>
    );
}

