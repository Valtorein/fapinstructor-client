import { createNotification } from "@/engine/notification";
import { playCommand } from "@/engine/audio";
import delay from "@/utils/delay";
import { StrokeService } from "@/game/xstate/services";
import { setStrokeSpeed } from "@/game/utils/strokeSpeed";
import getRandomDuration from "@/game/utils/getRandomDuration";

export const doubleStrokes = async () => {
  const previousStrokeSpeed = StrokeService.strokeSpeed;

  const duration = getRandomDuration(5, 30);

  createNotification({
    message: "Double your stroke speed!",
    duration: duration,
    showProgress: true,
    delay: true,
  });

  playCommand("faster");
  setStrokeSpeed(StrokeService.strokeSpeed * 2);

  await delay(duration);
  setStrokeSpeed(previousStrokeSpeed);
};
doubleStrokes.label = "Double Strokes";
