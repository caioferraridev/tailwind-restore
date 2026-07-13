import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import { useMemo, useState } from "react";

import PortalLayout from "@/components/client-portal/PortalLayout";
import PortalHeader from "@/components/client-portal/PortalHeader";

import {
  FileText,
  FileImage,
  FileVideo,
  FileArchive,
  Search,
  Download
} from "lucide-react";

export const Route = createFileRoute("/portal/files")({
  component: PortalFilesPage,
});

function getFileIcon(type?: string) {

  if (!type) return FileText;

  if (type.includes("image")) return FileImage;

  if (type.includes("video")) return FileVideo;

  if (type.includes("zip")) return FileArchive;

  if (type.includes("rar")) return FileArchive;

  if (type.includes("pdf")) return FileText;

  return FileText;
}

export default function PortalFilesPage() {

  const portalUser = JSON.parse(
    localStorage.getItem("portalUser") || "{}"
  );

  const clientId = portalUser.client_id;

  const [search, setSearch] = useState("");

  const { data: client } = useQuery({

    queryKey: ["portal-client", clientId],

    enabled: !!clientId,

    queryFn: async () => {

      const { data } = await supabase

        .from("clients")

        .select("*")

        .eq("id", clientId)

        .single();

      return data;

    },

  });

  const { data: files = [] } = useQuery<any[]>({

    queryKey: ["portal-files", clientId],

    enabled: !!clientId,

    queryFn: async () => {

      const { data } = await supabase

        .from("client_files")

        .select("*")

        .eq("client_id", clientId)

        .order("created_at", {
          ascending: false,
        });

      return data ?? [];

    },

  });

  const filteredFiles = useMemo(() => {

    return files.filter((file) =>

      file.file_name
        ?.toLowerCase()
        .includes(search.toLowerCase())

    );

  }, [files, search]);

  const images = files.filter((f)=>
    f.mime_type?.includes("image")
  ).length;

  const documents = files.filter((f)=>
    f.mime_type?.includes("pdf") ||
    f.mime_type?.includes("word") ||
    f.mime_type?.includes("document")
  ).length;

  const videos = files.filter((f)=>
    f.mime_type?.includes("video")
  ).length;

  return (

    <PortalLayout>

      <div className="space-y-8">

        <PortalHeader
          companyName={client?.company_name}
        />

        <div>

          <h2 className="text-3xl font-bold">

            Arquivos

          </h2>

          <p className="text-muted-foreground mt-2">

            Todos os materiais enviados pela agência.

          </p>

        </div>
                {/* Cards */}

        <div className="grid md:grid-cols-4 gap-5">

          <div className="rounded-xl border p-5">

            <p className="text-sm text-muted-foreground">

              Total

            </p>

            <h2 className="text-4xl font-bold mt-3">

              {files.length}

            </h2>

          </div>

          <div className="rounded-xl border p-5">

            <p className="text-sm text-muted-foreground">

              Documentos

            </p>

            <h2 className="text-4xl font-bold mt-3 text-blue-600">

              {documents}

            </h2>

          </div>

          <div className="rounded-xl border p-5">

            <p className="text-sm text-muted-foreground">

              Imagens

            </p>

            <h2 className="text-4xl font-bold mt-3 text-green-600">

              {images}

            </h2>

          </div>

          <div className="rounded-xl border p-5">

            <p className="text-sm text-muted-foreground">

              Vídeos

            </p>

            <h2 className="text-4xl font-bold mt-3 text-red-600">

              {videos}

            </h2>

          </div>

        </div>

        {/* Pesquisa */}

        <div className="rounded-xl border p-6">

          <div className="relative">

            <Search
              className="absolute left-4 top-3.5 text-muted-foreground"
              size={18}
            />

            <input

              value={search}

              onChange={(e) =>
                setSearch(e.target.value)
              }

              placeholder="Pesquisar arquivo..."

              className="w-full h-11 rounded-lg border bg-background pl-11 pr-4"

            />

          </div>

        </div>

        {/* Grid */}

        <div className="rounded-xl border overflow-hidden">

          <div className="border-b p-6">

            <h3 className="text-xl font-semibold">

              Arquivos Disponíveis

            </h3>

            <p className="text-sm text-muted-foreground mt-1">

              Clique em Download para baixar qualquer arquivo enviado pela agência.

            </p>

          </div>

          {filteredFiles.length === 0 ? (

            <div className="p-12 text-center text-muted-foreground">

              Nenhum arquivo encontrado.

            </div>

          ) : (

            <div className="grid xl:grid-cols-2 gap-5 p-6">

              {filteredFiles.map((file: any) => {

                const Icon = getFileIcon(file.mime_type);

                return (

                  <div
                    key={file.id}
                    className="rounded-xl border bg-background hover:shadow-md transition-all duration-300 p-5 flex items-center justify-between"
                  >

                    <div className="flex gap-4 items-center">

                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">

                        <Icon
                          className="text-primary"
                          size={28}
                        />

                      </div>

                      <div>

                        <h3 className="font-semibold">

                          {file.file_name}

                        </h3>

                        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">

                          <span>

                            {file.mime_type ?? "Arquivo"}

                          </span>

                          <span>

                            {file.created_at
                              ? new Date(
                                  file.created_at
                                ).toLocaleDateString("pt-BR")
                              : "-"}

                          </span>

                        </div>

                      </div>

                    </div>

                    <div className="flex items-center gap-3">

                      {file.file_size && (

                        <span className="text-xs text-muted-foreground">

                          {(file.file_size / 1024 / 1024).toFixed(2)}
                          {" "}MB

                        </span>

                      )}

                      <a
                        href={file.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 hover:opacity-90 transition"
                      >

                        <Download size={16} />

                        Download

                      </a>

                    </div>

                  </div>

                );

              })}

            </div>

          )}

        </div>

      </div>

    </PortalLayout>

  );

}