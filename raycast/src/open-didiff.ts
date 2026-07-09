import { closeMainWindow, getPreferenceValues, open, showHUD } from "@raycast/api";

type Preferences = {
  appUrl: string;
};

export default async function Command() {
  const { appUrl } = getPreferenceValues<Preferences>();
  const url = (appUrl || "https://difdif-production.up.railway.app").replace(/\/$/, "");

  await open(url);
  await closeMainWindow();
  await showHUD("Opened didiff");
}
