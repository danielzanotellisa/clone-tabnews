import useSWR from "swr";

async function fetchApi(key) {
  const response = await fetch(key);
  const responseBody = response.json();

  return responseBody;
}

function UpdatedAt() {
  const { data, isLoading } = useSWR("/api/v1/status", fetchApi, {
    refreshInterval: 2000,
  });

  let updatedAtText = "Carregando...";
  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
  }

  return <div>Última atualização: {updatedAtText}</div>;
}

function DatabaseInfo() {
  const { data, isLoading } = useSWR("/api/v1/status", fetchApi);
  let dataBaseinfo = {
    dbVersion: "Carregando...",
    maxConnections: "Carregando...",
    activeConnections: "Carregando...",
  };

  if (!isLoading && data) {
    dataBaseinfo = {
      dbVersion: data.dependencies?.database?.db_version,
      maxConnections: data.dependencies?.database?.max_connections,
      activeConnections: data.dependencies?.database?.active_connections,
    };
  }

  return (
    <>
      <UpdatedAt />
      <ul>
        <li>Versão do banco: {dataBaseinfo.dbVersion}</li>
        <li>Número máximo de conexões: {dataBaseinfo.maxConnections}</li>
        <li>Conexões ativas: {dataBaseinfo.activeConnections}</li>
      </ul>
    </>
  );
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <DatabaseInfo />
    </>
  );
}
