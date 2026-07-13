import { useMemo, useState } from "react";
import {
  File,
  FileText,
  Image,
  FileSpreadsheet,
  Archive,
  Download,
  Search,
} from "lucide-react";

type PortalFile = {
  id: string;
  file_name: string;
  mime_type: string | null;
  file_size: number | null;
  created_at: string | null;
  file_path: string;
};

type Props = {
  files: PortalFile[];
};

function formatSize(size?: number | null) {
  if (!size) return "-";

  if (size < 1024)
    return `${size} B`;

  if (size < 1024 * 1024)
    return `${(size / 1024).toFixed(1)} KB`;

  if (size < 1024 * 1024 * 1024)
    return `${(size / 1024 / 1024).toFixed(1)} MB`;

  return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

function getIcon(type?: string | null) {
  if (!type) return File;

  if (type.includes("pdf"))
    return FileText;

  if (type.includes("image"))
    return Image;

  if (
    type.includes("excel") ||
    type.includes("spreadsheet")
  )
    return FileSpreadsheet;

  if (
    type.includes("zip") ||
    type.includes("rar")
  )
    return Archive;

  return File;
}

export default function PortalFiles({
  files,
}: Props) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return files;

    return files.filter((f) =>
      f.file_name
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [files, search]);

  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">

      <div className="border-b p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <div>

          <h2 className="text-xl font-semibold">
            Arquivos
          </h2>

          <p className="text-sm text-muted-foreground mt-1">
            Todos os arquivos enviados pela agência.
          </p>

        </div>

        <div className="relative w-full lg:w-80">

          <Search
            size={18}
            className="absolute left-3 top-3 text-muted-foreground"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Pesquisar arquivo..."
            className="w-full rounded-xl border py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary"
          />

        </div>

      </div>

      {filtered.length === 0 ? (

        <div className="p-12 text-center text-muted-foreground">

          Nenhum arquivo encontrado.

        </div>

      ) : (

        <div className="divide-y">

          {filtered.map((file) => {

            const Icon = getIcon(file.mime_type);

            return (

              <div
                key={file.id}
                className="flex items-center justify-between p-5 hover:bg-muted/30 transition"
              >

                <div className="flex items-center gap-4">

                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">

                    <Icon
                      className="text-primary"
                      size={22}
                    />

                  </div>

                  <div>

                    <h3 className="font-medium">

                      {file.file_name}

                    </h3>

                    <p className="text-sm text-muted-foreground">

                      {formatSize(file.file_size)}

                      {" • "}

                      {file.created_at
                        ? new Date(
                            file.created_at
                          ).toLocaleDateString(
                            "pt-BR"
                          )
                        : "-"}

                    </p>

                  </div>

                </div>

                <button
                  onClick={() =>
                    window.open(
                      file.file_path,
                      "_blank"
                    )
                  }
                  className="flex items-center gap-2 rounded-xl border px-4 py-2 hover:bg-primary hover:text-white transition"
                >

                  <Download size={16} />

                  Download

                </button>

              </div>

            );
          })}

        </div>

      )}

      <div className="border-t bg-muted/20 p-4 flex justify-between">

        <span className="text-sm text-muted-foreground">
          Total de arquivos
        </span>

        <span className="font-semibold">
          {filtered.length}
        </span>

      </div>

    </div>
  );
}