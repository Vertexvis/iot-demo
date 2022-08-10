import { vertexvis } from "@vertexvis/frame-streaming-protos";
import { ColorMaterial, Components } from "@vertexvis/viewer";

import { SelectColor } from "./colors";

export interface Req {
  readonly viewer: Components.VertexViewer | null;
}

interface ColorGroup {
  readonly color: string;
  readonly suppliedIds: string[];
}

interface MaterialOverrideOpacity {
  readonly opacity: number;
}

interface ApplyReq extends Req {
  readonly apply: boolean;
}

interface ApplyGroupsBySuppliedIdsReq extends ApplyReq, MaterialOverrideOpacity {
  readonly groups: ColorGroup[];
}

interface ApplyAndShowBySuppliedIdsReq extends Req, MaterialOverrideOpacity {
  readonly all: boolean;
  readonly group: ColorGroup;
}

interface HideSuppliedIdReq extends Req {
  readonly hide: boolean;
  readonly suppliedIds: string[];
}

export interface HandleHitReq extends Req {
  readonly hit?: vertexvis.protobuf.stream.IHit;
}

export async function applyGroupsBySuppliedIds({
  apply,
  groups,
  viewer,
  opacity,
}: ApplyGroupsBySuppliedIdsReq): Promise<void> {
  if (viewer == null) return;

  const scene = await viewer.scene();
  if (scene == null) return;

  await scene
    .items((op) =>
      groups.map((g) => {
        const w = op.where((q) => q.withSuppliedIds(g.suppliedIds));
        return apply
          ? w.materialOverride(ColorMaterial.fromHex(g.color, opacity ?? 255))
          : w.clearMaterialOverrides();
      })
    )
    ?.execute();
}

export async function applyAndShowBySuppliedIds({
  all,
  group: { color, suppliedIds },
  viewer,
  opacity
}: ApplyAndShowBySuppliedIdsReq): Promise<void> {
  if (viewer == null || viewer === undefined) {
    return;
  }
  const scene = await viewer.scene();
  if (scene == null) return;

  await scene
    .items((op) => [
      ...(all ? [op.where((q) => q.all()).hide()] : []),
      op
        .where((q) => q.withSuppliedIds(suppliedIds))
        .materialOverride(ColorMaterial.fromHex(color, opacity ?? 255))
        .show(),
    ])
    .execute();
}

export async function hideBySuppliedId({
  hide,
  suppliedIds,
  viewer,
}: HideSuppliedIdReq): Promise<void> {
  if (viewer == null) return;

  const scene = await viewer.scene();
  if (scene == null) return;

  await scene
    .items((op) => {
      const w = op.where((q) => q.withSuppliedIds(suppliedIds));
      return hide
        ? w.clearMaterialOverrides().hide()
        : w.clearMaterialOverrides();
    })
    .execute();
}

export async function handleHit(request: HandleHitReq): Promise<void> {
  if (request.viewer == null) return;
  const scene = await request.viewer.scene();
  if (scene == null) return;
  const itemId = request.hit?.itemId?.hex;

  if (itemId) {
    await scene
      .items((op) => {
        return [
          op.where((q) => q.all()).deselect(),
          op.where((q) => q.withItemId(itemId)).select(SelectColor),
        ];
      })
      .execute();
  } else {
    await scene.items((op) => op.where((q) => q.all()).deselect()).execute();
  }
}

export async function clearAll({
  showAll,
  viewer,
}: Req & { showAll: boolean }): Promise<void> {
  if (viewer == null) return;
  viewer?.stream?.update({
    streamAttributes: {
      experimentalGhosting: {
        enabled: { value: showAll },
        opacity: { value: 0.7 },
      }
    }
  })
  const scene = await viewer.scene();
  if (scene == null) return;

  await scene
    .items((op) => {
      const w = op.where((q) => q.all());
      return showAll
        ? w.clearMaterialOverrides().show()
        : w.clearMaterialOverrides();
    })
    .execute();
}
