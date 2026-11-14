import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const script = resolve(__dirname, "../scripts/secret-scan.mjs");
const dirs: string[] = [];

function git(cwd: string, ...args: string[]) {
	return execFileSync("git", ["-c", "user.name=t", "-c", "user.email=t@example.com", ...args], { cwd, encoding: "utf8", stdio: "pipe" });
}

function repo() {
	const dir = mkdtempSync(join(tmpdir(), "secret-scan-"));
	dirs.push(dir);
	git(dir, "init", "-q", "-b", "work");
	return dir;
}

function commit(dir: string, file: string, body: string) {
	writeFileSync(join(dir, file), body);
	git(dir, "add", file);
	git(dir, "commit", "-q", "-m", file);
}

function scan(dir: string, ...args: string[]) {
	const r = spawnSync("node", [script, ...args], { cwd: dir, encoding: "utf8" });
	return { code: r.status, out: r.stdout, err: r.stderr };
}

// 実際の鍵の形に見えないよう、テストの中で組み立てる
const leaked = `ghp_${"a1".repeat(20)}`;

afterEach(() => {
	for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("secret-scan base selection", () => {
	it("scans every tracked file, without a stack trace, when no candidate shares an ancestor with HEAD", () => {
		const dir = repo();
		commit(dir, "clean.txt", "hello\n");
		// origin/develop は存在するが HEAD と共通の祖先が無い（orphan ブランチ）
		git(dir, "checkout", "-q", "--orphan", "unrelated");
		commit(dir, "other.txt", "other\n");
		git(dir, "update-ref", "refs/remotes/origin/develop", "unrelated");
		git(dir, "checkout", "-q", "-b", "feature", "work");
		commit(dir, "leak.txt", `token ${leaked}\n`);

		const r = scan(dir);
		expect(r.err).not.toMatch(/at .*\(|node:internal|Error: Command failed/);
		expect(r.err).toContain("共通の祖先を持つ基準が見つからない");
		expect(r.out).toContain("base (none, all files)");
		expect(r.out).toContain("leak.txt:1: GitHub token");
		expect(r.code).toBe(1);
	});

	it("falls through to a later candidate that does share an ancestor", () => {
		const dir = repo();
		commit(dir, "clean.txt", "hello\n");
		git(dir, "update-ref", "refs/remotes/origin/main", "HEAD");
		git(dir, "checkout", "-q", "--orphan", "unrelated");
		commit(dir, "other.txt", "other\n");
		git(dir, "update-ref", "refs/remotes/origin/develop", "unrelated");
		git(dir, "checkout", "-q", "-b", "feature", "work");
		mkdirSync(join(dir, "sub"));
		commit(dir, "sub/ok.txt", "fine\n");

		const r = scan(dir);
		expect(r.out).toContain("base origin/main, 1 file(s) scanned, 0 finding(s)");
		expect(r.code).toBe(0);
	});

	it("stops with one line when the explicitly given base has no common ancestor", () => {
		const dir = repo();
		commit(dir, "clean.txt", "hello\n");
		git(dir, "checkout", "-q", "--orphan", "unrelated");
		commit(dir, "other.txt", "other\n");
		git(dir, "checkout", "-q", "work");

		const r = scan(dir, "unrelated");
		expect(r.code).toBe(2);
		expect(r.err.trim().split("\n")).toHaveLength(1);
		expect(r.err).not.toMatch(/node:internal|Error: Command failed/);
	});
});
