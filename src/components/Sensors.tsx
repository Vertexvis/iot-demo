import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";

import { formatValue, SensorMeta } from "../lib/time-series";
import { NoData } from "./NoData";

export interface SensorProps {
  readonly list: SensorMeta[];
  readonly onSelect: (sensorId: string) => Promise<void>;
  readonly selected: string;
  readonly selectedTs: string;
}

export function Sensors({
  list,
  onSelect,
  selected,
  selectedTs,
}: SensorProps): JSX.Element {
  return list.length > 0 ? (
    <Box mb={2}>
      <TableContainer>
        <Table size="small">
          <TableBody>
            {list.map((s) => {
              const isSelected = s.id === selected;
              const td = s.tsData[selectedTs] ?? {
                color: "#fff",
                value: 0,
              };
              return (
                <TableRow
                  key={s.id}
                  onClick={() => onSelect(s.id)}
                  selected={isSelected}
                >
                  <TableCell>{formatValue(td.value)}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        backgroundColor: td.color,
                        borderRadius: 2,
                        height: "1rem",
                        width: "1rem",
                      }}
                    ></Box>
                  </TableCell>
                  <TableCell>{s.name}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  ) : (
    <NoData />
  );
}
