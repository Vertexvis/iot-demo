import { useOrdinalColorScale } from "@nivo/colors";
import { ResponsiveLine } from "@nivo/line";
import React from "react";
import { useMemo } from "react";

import { FaultCode, Sensor } from "../lib/time-series";

interface Props {
  readonly sensors: Sensor[];
  readonly timestamp: string;
  readonly faultCodes: FaultCode[];
}

export function TimeSeriesChart({
  sensors,
  timestamp,
  faultCodes,
}: Props): JSX.Element {
  const colors = useOrdinalColorScale({ scheme: "nivo" }, "id");
  const rawData = sensors.map((s) => {
    return {
      id: s.meta.id,
      data: s.data.map((d) => ({
        x: d.timestamp.substring(11, 19), // Ex: 2021-04-01T12:15:07.000Z
        y: d.avg,
      })),
    };
  });
  const [hiddenIds, setHiddenIds] = React.useState<string[]>([]);
  const [markerText, setMarkerText] = React.useState<string>("");
  const data = useMemo(
    () => rawData.filter((item) => !hiddenIds.includes(item.id)),
    [hiddenIds, rawData]
  );
  React.useEffect(() => {
    const faultTimes = faultCodes.find((fault) => {
      return fault.timestamp === timestamp;
    });
    setMarkerText(faultTimes?.title ?? "");
  }, [timestamp, faultCodes]);
  return (
    <ResponsiveLine
      data={data}
      margin={{ top: 10, right: 110, bottom: 75, left: 60 }}
      animate={true}
      enableSlices="x"
      yScale={{
        type: "linear",
        stacked: true,
      }}
      curve="catmullRom"
      useMesh={true}
      markers={[
        {
          axis: "x",
          value: timestamp.substring(11, 19),
          lineStyle: { stroke: "#b0413e", strokeWidth: 10, opacity: 0.2 },
          legend: markerText,
        },
      ]}
      legends={[
        {
          anchor: "right",
          data: rawData.map((item) => {
            const color = colors(item);

            return {
              color: hiddenIds.includes(item.id) ? "rgba(1, 1, 1, .1)" : color,
              id: item.id,
              label: item.id,
            };
          }),
          direction: "column",
          onClick: (datum) => {
            setHiddenIds((state) =>
              state.includes(String(datum.id))
                ? state.filter((item) => item !== datum.id)
                : [...state, String(datum.id)]
            );
          },
          itemHeight: 20,
          itemWidth: 70,
          translateY: 40,
          translateX: -110,
        },
      ]}
    />
  );
}
