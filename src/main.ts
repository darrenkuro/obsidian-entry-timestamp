import {
	type App,
	type Editor,
	type MarkdownFileInfo,
	moment,
	normalizePath,
	Plugin,
	TFile,
} from "obsidian";

const TASK_PATTERN = /^- \[(.)] /;
const EMPTY_TASK = "- [ ] ";
const CREATED_FIELD = "[created::";
const DEFAULT_DATE_FORMAT = "YYYY-MM-DD";
const DEFAULT_STATUS = "!";

/** ISO 8601 timestamp with local timezone offset, e.g. 2026-03-09T22:15:00-07:00 */
const timestamp = (): string => moment().format("YYYY-MM-DDTHH:mm:ssZ");

/** Capitalize first character of a string. */
const capitalize = (s: string): string =>
	s.charAt(0).toUpperCase() + s.slice(1);

/** Read daily notes plugin config and return today's note path. */
const getDailyNotePath = (app: App): string => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const config = (app as any).internalPlugins?.getPluginById("daily-notes")
		?.instance?.options;
	const folder: string = config?.folder?.trim() || "";
	const format: string = config?.format?.trim() || DEFAULT_DATE_FORMAT;
	const filename = moment().format(format);
	return normalizePath(folder ? `${folder}/${filename}.md` : `${filename}.md`);
};

/** Get existing TFile or create a new empty file at path. */
const getOrCreateFile = async (app: App, path: string): Promise<TFile> => {
	const existing = app.vault.getFileByPath(path);
	if (existing) return existing;

	const folderPath = path.substring(0, path.lastIndexOf("/"));
	if (folderPath) {
		const folder = app.vault.getFolderByPath(normalizePath(folderPath));
		if (!folder) await app.vault.createFolder(normalizePath(folderPath));
	}
	return app.vault.create(path, "");
};

export default class EntryTimestampPlugin extends Plugin {
	onload(): void {
		this.registerEvent(
			this.app.workspace.on(
				"editor-change",
				this.onEditorChange.bind(this),
			),
		);

		this.registerObsidianProtocolHandler(
			"entry-timestamp",
			this.onProtocolAction.bind(this),
		);
	}

	private onEditorChange(editor: Editor, _info: MarkdownFileInfo): void {
		if (!editor.hasFocus()) return;

		const cursor = editor.getCursor();
		const lineNum = cursor.line;
		const line = editor.getLine(lineNum);

		if (line !== EMPTY_TASK || lineNum === 0) return;

		const prevLine = editor.getLine(lineNum - 1);
		const match = prevLine.match(TASK_PATTERN);
		if (!match) return;

		const statusChar = match[1];

		const prevReplacement = prevLine.includes(CREATED_FIELD)
			? prevLine
			: `${prevLine} [created:: ${timestamp()}]`;

		const newLine = `- [${statusChar}] `;

		editor.transaction({
			changes: [
				{
					from: { line: lineNum - 1, ch: 0 },
					to: { line: lineNum, ch: line.length },
					text: `${prevReplacement}\n${newLine}`,
				},
			],
		});

		editor.setCursor({ line: lineNum, ch: 6 });
	}

	private async onProtocolAction(
		params: Record<string, string>,
	): Promise<void> {
		const rawText = params.text;
		if (!rawText) return;

		const text = capitalize(rawText.trim());
		const status = params.status?.trim() || DEFAULT_STATUS;
		const filePath = params.file
			? normalizePath(
					params.file.endsWith(".md")
						? params.file
						: `${params.file}.md`,
				)
			: getDailyNotePath(this.app);

		const taskLine = `- [${status}] ${text} [created:: ${timestamp()}]`;
		const file = await getOrCreateFile(this.app, filePath);
		await this.app.vault.append(file, `\n${taskLine}`);
	}
}
