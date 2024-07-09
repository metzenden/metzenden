import * as React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface DetailsModalProps {
  data: Array<{
    /* détails spécifiques */
  }>;
}

const DataRapportAgent = ({ data /* onDataChange */ }: DetailsModalProps) => {
  type CustomGridColDef = GridColDef & {
    headerName: React.ReactNode;
  };

  const columns: CustomGridColDef[] = [
    { field: "index", headerName: "Index", width: 230, flex: 1 },
    { field: "moi", headerName: "Moi(agent)", width: 120 },
    { field: "equipe", headerName: "Mon equipe", width: 120 },
    // { field: 'projet', headerName: 'Tout le projet', width: 330, flex: 1 },
    { field: "meilleur_agent", headerName: "Meilleur Agent", width: 120 },
    // { field: 'NoteCorrigeeMObjectif', headerName: 'Note corrigée m/\nObjectif', width: 330, flex: 1 },
  ];
  return (
    <div style={{ height: 550, width: "100%", backgroundColor: "white", display: "flex", flexDirection: "column" }}>
      {/*  <DataTable headers={headers} dataMatrix={dataMatrix} /> */}
      <DataGrid
        rows={data}
        rowHeight={50}
        getRowId={(row) => row.id}
        columns={columns.map((col) => ({
          ...col,
          headerName: col?.headerName?.toString(), // Convert to string here
          renderHeader: () => (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
            >
              {col?.headerName
                ?.toString()
                .split("\n")
                .map((line, index) => (
                  <span
                    style={{
                      lineHeight: 1.2,
                    }}
                    key={index}
                  >
                    {line}
                  </span>
                ))}
            </div>
          ),
        }))}
        /*   loading={loading} */
        disableRowSelectionOnClick
        //paginationMode="server"
        sx={{
          boxShadow: 2,
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "#D9D9D9",
            color: "black",
            fontSize: "14px",
          },
        }}
      />
    </div>
  );
};

export default DataRapportAgent;
