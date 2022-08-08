import { useRouter } from "next/router";
import React from "react";

import {
  Configuration,
  head,
  StreamCredentials,
  WindturbineCredentials,
} from "../lib/config";
import { useKeyListener } from "../lib/key-listener";
import { flyToSuppliedId } from "../lib/scene-camera";
import {
  applyAndShowBySuppliedIds,
  applyGroupsBySuppliedIds,
  clearAll,
  handleHit,
  HandleHitReq,
  hideBySuppliedId,
} from "../lib/scene-items";
import {
  Asset,
  getAssets,
  getData,
  getFaults,
  getTimeSeriesData,
  RawSensors,
  sensorsToItemSuppliedIds,
  TimeSeriesData,
} from "../lib/time-series";
import { useViewer } from "../lib/viewer";
import { BottomDrawer, Content } from "./BottomDrawer";
import { Layout, RightDrawerWidth } from "./Layout";
import { encodeCreds } from "../lib/env";
import { RightDrawer } from "./RightDrawer";
import { Viewer } from "./Viewer";

export interface Props {
  readonly config: Configuration;
}

export function Home({ config: { network } }: Props): JSX.Element {
  const keys = useKeyListener();
  const router = useRouter();
  const viewer = useViewer();
  const [asset, setAsset] = React.useState<Asset>("R8071");
  const [content, setContent] = React.useState<Content>(undefined);
  const [credentials, setCredentials] = React.useState<
    StreamCredentials | undefined
  >();
  const [, setData] = React.useState<RawSensors>(getData(asset));
  const [timeSeriesData, setTimeSeriesData] = React.useState<TimeSeriesData>({
    ids: [],
    sensors: {},
    sensorsMeta: [],
  });
  const [ts, setTs] = React.useState("");
  const [sensor, setSensor] = React.useState("");
  const [sensorMapping, setSensorMapping] = React.useState({});
  const [shownSensors, setShownSensors] = React.useState<Set<string>>(
    new Set()
  );
  const [checked, setChecked] = React.useState(false);
  const [faults, setFaults] = React.useState(getFaults(asset));
  const onHighLightSensors = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };
  React.useEffect(() => {
    async function applyAndShowOrHideBySensorId(
      id: string,
      apply: boolean,
      all: boolean
    ): Promise<void> {
      if (!viewer.isReady) {
        return;
      }
      const meta = timeSeriesData.sensors[id].meta;
      const suppliedIds = meta.itemSuppliedIds;

      await (apply
        ? applyAndShowBySuppliedIds({
            all,
            group: { color: meta.tsData[ts].color, suppliedIds },
            viewer: viewer.ref.current,
          })
        : hideBySuppliedId({
            hide: checked,
            suppliedIds,
            viewer: viewer.ref.current,
          }));
    }

    const numSensors = shownSensors.size;
    if (numSensors === 0) {
      clearAll({
        showAll: false,
        viewer: viewer.ref.current,
      });
    } else {
      shownSensors.forEach((id) =>
        applyAndShowOrHideBySensorId(
          id,
          checked,
          shownSensors.size === 0 && numSensors === 1
        )
      );
    }
  }, [
    checked,
    shownSensors,
    timeSeriesData.sensors,
    ts,
    viewer.isReady,
    viewer.ref,
  ]);
  React.useEffect(() => {
    const noShownSensors = new Set<string>();
    if (checked) {
      // set all sensors as "shown"
      const showAllSensors = new Set(
        timeSeriesData.sensorsMeta.map((meta) => meta.id)
      );
      setShownSensors(showAllSensors);
    } else {
      setShownSensors(noShownSensors);
    }
  }, [checked, timeSeriesData.sensorsMeta]);
  // Prefer credentials in URL to enable easy scene sharing. If empty, use defaults.
  React.useEffect(() => {
    if (!router.isReady) return;

    setCredentials({
      clientId: head(router.query.clientId) || WindturbineCredentials.clientId,
      streamKey:
        head(router.query.streamKey) || WindturbineCredentials.streamKey,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);
  React.useEffect(() => {
    if (!credentials) return;

    router.push(encodeCreds(credentials));
    reset();
    const sk = credentials.streamKey;
    const m = sensorsToItemSuppliedIds(sk);
    setSensorMapping(m);
    const a = getAssets(sk)[0];
    setAsset(a);
    const d = getData(a);
    setData(d);
    const tsd = getTimeSeriesData(a, d, m);
    setTimeSeriesData(tsd);
    setTs(
      tsd.sensors[tsd.ids[0]] ? tsd.sensors[tsd.ids[0]].data[0].timestamp : ""
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [credentials]);

  React.useEffect(() => {
    const tsd = timeSeriesData;
    setSensor(tsd.sensorsMeta[0] ? tsd.sensorsMeta[0].id : "");
  }, [timeSeriesData]);

  React.useEffect(() => {
    setFaults(getFaults(asset));
  }, [asset]);

  async function updateTimestamp(timestamp: string): Promise<void> {
    await colorSensors(timestamp);
    setTs(timestamp);
  }

  async function colorSensors(
    timestamp: string,
    tsd: TimeSeriesData = timeSeriesData
  ): Promise<void> {
    if (shownSensors.size === 0) return;

    await applyGroupsBySuppliedIds({
      apply: true,
      groups: [...shownSensors].map((sId) => {
        const meta = tsd.sensors[sId].meta;
        return {
          color: meta.tsData[timestamp].color,
          suppliedIds: meta.itemSuppliedIds,
        };
      }),
      viewer: viewer.ref.current,
    });
  }
  async function reset(): Promise<void> {
    setShownSensors(new Set());
    await clearAll({ showAll: false, viewer: viewer.ref.current });
  }
  return router.isReady && credentials ? (
    <Layout
      bottomDrawer={
        viewer.isReady && (
          <BottomDrawer
            content={content}
            onContent={setContent}
            onSelect={(timestamp) => updateTimestamp(timestamp)}
            sensor={timeSeriesData.sensors[sensor]}
            timestamp={ts}
            onHighLightSensors={onHighLightSensors}
            sensors={timeSeriesData.ids.map((id) => timeSeriesData.sensors[id])}
            overlayIot={checked}
            faultCodes={faults}
          />
        )
      }
      main={
        viewer.isReady && (
          <Viewer
            config={JSON.stringify({ network })}
            credentials={credentials}
            onSelect={(hitItems) => {
              console.info(hitItems);
              const request: HandleHitReq = {
                hit: hitItems,
                viewer: viewer.ref.current,
              };
              return handleHit(request);
            }}
            viewer={viewer.ref}
          />
        )
      }
      rightDrawer={
        <RightDrawer
          assets={{
            assets: getAssets(credentials.streamKey),
            onSelect: async (a: Asset) => {
              setAsset(a);
              console.log(a);
              const d = getData(a);
              setData(d);
              const tsd = getTimeSeriesData(a, d, sensorMapping);
              setTimeSeriesData(tsd);
              await colorSensors(ts, tsd);
            },
            selected: asset,
          }}
          // metadata={metadata}
          open={Boolean(open)}
          sensors={{
            list: timeSeriesData.sensorsMeta,
            onSelect: async (id) => {
              setSensor(id);
              if (shownSensors.has(id) && keys.alt) {
                await flyToSuppliedId({
                  suppliedId:
                    timeSeriesData.sensors[id].meta.itemSuppliedIds[0],
                  viewer: viewer.ref.current,
                });
              }
            },
            selected: sensor,
            selectedTs: ts,
          }}
          faults={{
            faults: faults,
            selected: ts,
            onSelect: (timestamp) => updateTimestamp(timestamp),
          }}
        />
      }
      rightDrawerWidth={RightDrawerWidth}
    ></Layout>
  ) : (
    <></>
  );
}
