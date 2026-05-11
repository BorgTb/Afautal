import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const documentId = searchParams.get("documentId");

  // Verificar el secreto para evitar accesos no autorizados al modo borrador
  if (secret !== process.env.PREVIEW_SECRET) {
    return new Response("Invalid token", { status: 401 });
  }

  // Se requiere el documentId para saber a qué página redirigir
  if (!documentId) {
    return new Response("Missing documentId", { status: 400 });
  }

  // Activar el Draft Mode
  const draft = await draftMode();
  draft.enable();

  // Redirigir a la página de la noticia
  redirect(`/news/${documentId}`);
}
