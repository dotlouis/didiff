import {
  Clipboard,
  closeMainWindow,
  getPreferenceValues,
  open,
  showHUD,
  showToast,
  Toast,
} from "@raycast/api";

type Preferences = {
  appUrl: string;
};

const MARKER = "__DIDIFF_V1__";

export default async function Command() {
  const { appUrl } = getPreferenceValues<Preferences>();
  const url = (appUrl || "http://localhost:4173").replace(/\/$/, "");

  const clip = (await Clipboard.readText()) ?? "";
  if (!clip.trim()) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Clipboard is empty",
    });
    return;
  }

  // Place clipboard into original; leave modified empty for the user to paste next.
  const payload = {
    oldText: clip,
    newText: "",
  };

  await Clipboard.copy(`${MARKER}\n${JSON.stringify(payload)}`);
  await open(`${url}/?import=1&from=raycast`);
  await closeMainWindow();
  await showHUD("didiff · paste modified next");
}
