import { useState } from "react";
import {
  Action,
  ActionPanel,
  Clipboard,
  closeMainWindow,
  Form,
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
/** Keep URL-based handoff only for tiny snippets; larger text uses clipboard import. */
const URL_SAFE_LIMIT = 1800;

function b64url(text: string): string {
  return Buffer.from(text, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export default function Command() {
  const { appUrl } = getPreferenceValues<Preferences>();
  const base = (appUrl || "https://difdif-production.up.railway.app").replace(/\/$/, "");
  const [isLoading, setIsLoading] = useState(false);

  async function openDiff(oldText: string, newText: string, language?: string) {
    if (!oldText && !newText) {
      await showToast({ style: Toast.Style.Failure, title: "Paste at least one side" });
      return;
    }

    setIsLoading(true);
    try {
      const total = oldText.length + newText.length;
      let target = `${base}/?from=raycast`;

      if (total > 0 && total <= URL_SAFE_LIMIT) {
        const params = new URLSearchParams();
        params.set("from", "raycast");
        if (oldText) params.set("o", b64url(oldText));
        if (newText) params.set("n", b64url(newText));
        target = `${base}/?${params.toString()}`;
      } else {
        const payload = { oldText, newText, language: language || undefined };
        await Clipboard.copy(`${MARKER}\n${JSON.stringify(payload)}`);
        target = `${base}/?import=1&from=raycast`;
      }

      await open(target);
      await closeMainWindow();
      await showHUD("Opened in didiff");
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to open didiff",
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Open Diff in didiff"
            onSubmit={(values: { oldText: string; newText: string; language: string }) =>
              openDiff(values.oldText ?? "", values.newText ?? "", values.language)
            }
          />
          <Action
            title="Paste Clipboard into Original"
            shortcut={{ modifiers: ["cmd"], key: "1" }}
            onAction={async () => {
              const t = (await Clipboard.readText()) ?? "";
              await Clipboard.copy(t); // no-op keep
              await showToast({ style: Toast.Style.Success, title: "Use ⌘V in Original field" });
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="oldText"
        title="Original"
        placeholder="Paste original text…"
        enableMarkdown={false}
      />
      <Form.TextArea
        id="newText"
        title="Modified"
        placeholder="Paste modified text…"
        enableMarkdown={false}
      />
      <Form.Dropdown id="language" title="Language" defaultValue="auto">
        <Form.Dropdown.Item value="auto" title="Auto-detect" />
        <Form.Dropdown.Item value="text" title="Plain text" />
        <Form.Dropdown.Item value="typescript" title="TypeScript" />
        <Form.Dropdown.Item value="javascript" title="JavaScript" />
        <Form.Dropdown.Item value="json" title="JSON" />
        <Form.Dropdown.Item value="python" title="Python" />
        <Form.Dropdown.Item value="go" title="Go" />
        <Form.Dropdown.Item value="rust" title="Rust" />
        <Form.Dropdown.Item value="html" title="HTML" />
        <Form.Dropdown.Item value="css" title="CSS" />
        <Form.Dropdown.Item value="sql" title="SQL" />
        <Form.Dropdown.Item value="yaml" title="YAML" />
        <Form.Dropdown.Item value="shell" title="Shell" />
        <Form.Dropdown.Item value="markdown" title="Markdown" />
      </Form.Dropdown>
      <Form.Description text="Opens your local didiff PWA. Large texts are handed off via the clipboard." />
    </Form>
  );
}
