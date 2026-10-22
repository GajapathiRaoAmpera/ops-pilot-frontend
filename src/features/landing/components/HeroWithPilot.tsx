"use client";

import { useState } from "react";
import { STORY } from "../story";
import { LandingPilot, type PilotVoice } from "./LandingPilot";
import { PipelineHero } from "./PipelineHero";

/** The hero scene and the Pilot that narrates it (and then follows the reader down the page). */
export function HeroWithPilot({ heroId }: { heroId: string }) {
  const [voice, setVoice] = useState<PilotVoice>(STORY[0].pilot);
  return (
    <>
      <PipelineHero onPilot={setVoice} />
      <LandingPilot hero={voice} heroId={heroId} />
    </>
  );
}
