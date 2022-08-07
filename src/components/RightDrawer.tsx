import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, Link } from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import Drawer, { drawerClasses } from "@mui/material/Drawer";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";

import { Metadata } from "../lib/metadata";
import { AssetProps, Assets } from "./Assets";
import { FaultProps, Faults } from "./Faults";
import { RightDrawerWidth } from "./Layout";
import { MetadataProperties } from "./MetadataProperties";
import { SensorProps, Sensors } from "./Sensors";

interface Props {
  readonly assets: AssetProps;
  readonly metadata?: Metadata;
  readonly open: boolean;
  readonly sensors: SensorProps;
  readonly faults: FaultProps;
}

interface TitleProps {
  readonly children: React.ReactNode | React.ReactNode[];
}

const Title = styled((props: TitleProps) => (
  <Typography variant="body2" {...props} />
))(() => ({ textTransform: "uppercase" }));

export function RightDrawer({
  assets,
  metadata,
  open,
  sensors,
  faults,
}: Props): JSX.Element {
  return (
    <Drawer
      anchor="right"
      open={open}
      sx={{
        display: { sm: "block", xs: "none" },
        flexShrink: 0,
        width: RightDrawerWidth,
        [`& .${drawerClasses.paper}`]: { width: RightDrawerWidth },
      }}
      variant="persistent"
    >
      {" "}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ textTransform: "uppercase" }} variant="body2">
            Assets
          </Typography>
        </AccordionSummary>
        <Assets {...assets} />
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ textTransform: "uppercase" }} variant="body2">
            Fault Codes
          </Typography>
        </AccordionSummary>
        <Faults {...faults} />
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ textTransform: "uppercase" }} variant="body2">
            Sensors
          </Typography>
        </AccordionSummary>
        <Sensors {...sensors} />
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography sx={{ textTransform: "uppercase" }} variant="body2">
            Source Code
          </Typography>
        </AccordionSummary>
        <Box>
          <Link
            href="https://github.com/Vertexvis/iot-demo"
            rel="noreferrer"
            sx={{ alignSelf: "center", mr: 2 }}
            target="_blank"
          >
            View on GitHub
          </Link>
        </Box>
      </Accordion>
    </Drawer>
  );
}
