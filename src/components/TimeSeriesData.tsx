import { Box } from "@mui/material";
import { DataGrid, GridColDef, GridSelectionModel } from "@mui/x-data-grid";
import React, { useCallback, useRef } from "react";

import { formatValue, Sensor } from "../lib/time-series";

interface Props {
  readonly onSelect: (timestamp: string) => Promise<void>;
  readonly sensor: Sensor;
  readonly timestamp: string;
}

const columns: GridColDef[] = [
  { field: "id", headerName: "Timestamp", flex: 1 },
  { field: "min", headerName: "Minimum", flex: 1 },
  { field: "max", headerName: "Maximum", flex: 1 },
  { field: "avg", headerName: "Average", flex: 1 },
  {
    field: "std",
    headerName: "Standard Deviation",
    flex: 1,
  },
];

export function TimeSeriesDataGrid({
  sensor,
  timestamp,
onSelect}: Props): JSX.Element {
  const [selectionModel, setSelectionModel] = React.useState<GridSelectionModel>([timestamp]); 
  const gridRef = useRef(null);
  const scrollToRow = useCallback(
    (i) => {
      const rowEl = gridRef?.current?.querySelector(`div[data-id="${i}"]`);
      if (rowEl != null) rowEl.scrollIntoView();
    },
    [gridRef]
  );
  React.useEffect(()=>{
   setSelectionModel(timestamp)
  },[timestamp])
  return (
    <Box display="flex" flexGrow={1}>
      <DataGrid
        ref={gridRef}
        disableColumnMenu
        disableColumnSelector
        disableDensitySelector
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        disableMultipleSelection
        hideFooter
        columns={columns}
        onStateChange={(e) => {
          const ts = e.selection;
          if (ts === undefined || ts.length == 0) return;

          scrollToRow(ts[0])
        }}
        onSelectionModelChange={(e)=>{
          setSelectionModel(e);
          onSelect(e[0] as string)
        }}
        rows={sensor.data.map((d) => ({
          id: d.timestamp,
          min: formatValue(d.min),
          max: formatValue(d.max),
          avg: formatValue(d.avg),
          std: formatValue(d.std),
        }))}
        selectionModel={selectionModel}
      />
    </Box>
  );
}
