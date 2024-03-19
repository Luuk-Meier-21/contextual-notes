import { Howl, Howler } from "howler";

export async function handleSucces() {
  const sound = new Howl({
    src: ["audio/succes.mp3"],
  });
  sound.play();
}

export async function handleError(message: string) {
  console.error(message);
  const sound = new Howl({
    src: ["audio/error.mp3"],
  });
  sound.play();
}