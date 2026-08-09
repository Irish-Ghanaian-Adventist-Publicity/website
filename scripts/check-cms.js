/**
 * Checks that admin/config.yml and the content files agree with each other.
 *
 * The CMS saves whatever fields config.yml defines. If a field is renamed there
 * but not in the content (or the other way round), nothing errors — edits just
 * silently stop appearing on the page. This catches that.
 *
 *   npm run check
 */

import fs from "node:fs";
import path from "node:path";
import * as yaml from "js-yaml";

const root = process.cwd();
const problems = [];

const readFrontMatter = (file) => {
  const raw = fs.readFileSync(file, "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  return yaml.load(match[1]) || {};
};

let config;
try {
  config = yaml.load(fs.readFileSync(path.join(root, "admin/config.yml"), "utf8"));
} catch (error) {
  console.error(`admin/config.yml is not valid YAML — the CMS will not load.\n${error.message}`);
  process.exit(1);
}

const compare = (label, defined, actual) => {
  const missingFromCms = [...actual].filter((k) => !defined.has(k));
  const missingFromFile = [...defined].filter((k) => !actual.has(k));
  if (missingFromCms.length || missingFromFile.length) {
    problems.push(
      `${label}\n` +
        (missingFromCms.length ? `   in the file but NOT editable in the CMS: ${missingFromCms.join(", ")}\n` : "") +
        (missingFromFile.length ? `   in the CMS but missing from the file:   ${missingFromFile.join(", ")}` : "")
    );
  }
};

for (const collection of config.collections) {
  // Folder collections — one file per entry
  if (collection.folder) {
    const defined = new Set(collection.fields.map((f) => f.name).filter((n) => n !== "body"));
    const dir = path.join(root, collection.folder);
    if (!fs.existsSync(dir)) {
      problems.push(`${collection.name}: folder ${collection.folder} does not exist`);
      continue;
    }
    for (const entry of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
      const data = readFrontMatter(path.join(dir, entry));
      if (!data) {
        problems.push(`${collection.folder}/${entry}: no front matter`);
        continue;
      }
      compare(`${collection.folder}/${entry}`, defined, new Set(Object.keys(data)));
    }
    continue;
  }

  // File collections — one fixed file per entry
  for (const file of collection.files || []) {
    const defined = new Set(file.fields.map((f) => f.name).filter((n) => n !== "body"));
    const target = path.join(root, file.file);
    if (!fs.existsSync(target)) {
      problems.push(`${file.file}: does not exist`);
      continue;
    }
    let keys;
    if (file.file.endsWith(".json")) {
      keys = new Set(Object.keys(JSON.parse(fs.readFileSync(target, "utf8"))));
    } else {
      const data = readFrontMatter(target);
      keys = new Set(Object.keys(data || {}));
      // These are set by the template, not by an editor.
      keys.delete("permalink");
      keys.delete("layout");
    }
    compare(file.file, defined, keys);
  }
}

if (problems.length) {
  console.error("CMS config and content do not agree:\n");
  console.error(problems.join("\n\n"));
  process.exit(1);
}

console.log("CMS config and content agree — every editable field lines up.");
