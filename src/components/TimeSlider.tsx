import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import Button from "@mui/material/Button";
import MobileStepper from "@mui/material/MobileStepper";
import { useTheme } from "@mui/material/styles";
import * as React from "react";

import { Sensor } from "../lib/time-series";
interface Props {
  readonly onSelect: (timestamp: string) => Promise<void>;
  readonly sensor: Sensor;
  readonly timestamp: string;
}
export default function TimeSlider({
  sensor,
  onSelect,
  timestamp,
}: Props): JSX.Element {
  const theme = useTheme();
  const [activeStep, setActiveStep] = React.useState(0);
  const [maxSteps, setMaxSteps] = React.useState(0);
  const [maxTimestamp, setMaxTimestamp] = React.useState("");
  const [minTimestamp, setMinTimestamp] = React.useState("");

  React.useEffect(() => {
    if (!sensor) {
      return;
    }
    setMaxSteps(sensor.data.length);
    setMinTimestamp(sensor.data[0].timestamp);
    setMaxTimestamp(sensor.data[sensor.data.length - 1].timestamp);
  }, [sensor]);
  React.useEffect(() => {
    if (sensor === undefined) {
      return;
    }
    const step = sensor.data.findIndex((x) => x.timestamp === timestamp);
    setActiveStep(step);
    // }
  }, [sensor, timestamp]);

  const handleNext = () => {
    const nextStep = Math.min(activeStep + 1, maxSteps - 1);
    setActiveStep(nextStep);
    onSelect(sensor.data[nextStep].timestamp);
  };

  const handleBack = () => {
    const nextStep = Math.max(0, activeStep - 1);
    setActiveStep(nextStep);
    onSelect(sensor.data[nextStep].timestamp);
  };

  return (
    <MobileStepper
      variant="progress"
      steps={maxSteps}
      position="static"
      activeStep={activeStep}
      sx={{ flexGrow: 1 }}
      nextButton={
        <Button
          size="small"
          onClick={handleNext}
          disabled={activeStep === maxSteps - 1}
        >
          {theme.direction === "rtl" ? (
            <KeyboardArrowLeft />
          ) : (
            <KeyboardArrowRight />
          )}
          {maxTimestamp}
        </Button>
      }
      backButton={
        <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
          {theme.direction === "rtl" ? (
            <KeyboardArrowRight />
          ) : (
            <KeyboardArrowLeft />
          )}
          {minTimestamp}
        </Button>
      }
    />
  );
}
