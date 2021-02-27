/* eslint-disable no-use-before-define, import/no-extraneous-dependencies, import/no-unresolved */
const os = require("os");
const { promises: fs, readFileSync } = require("fs");
const { sep, join, normalize, basename, dirname, parse } = require("path");
const childProcess = require("child_process");
const readmeasy = require("readmeasy").default;

const cwd = process.env.INIT_CWD || process.cwd();
const pkg = JSON.parse(readFileSync(join(cwd, "package.json"), { encoding: "utf8" })); // eslint-disable-line no-use-before-define

const walk = hasDependency("typedoc") ? require("walkdir") : undefined;
const concatMd = hasDependency("typedoc") ? require("concat-md").default : undefined;

/**
 * Returns entry file for TypeDoc. Uses basename of main entry in 'package.json' file and prefixes it with 'src'.
 */
function getTypeDocEntry() {
  const { name } = parse(pkg.main);
  return normalize(`src/${name}.ts`);
}

function hasDependency(moduleName) {
  const hasNormalDependency = pkg.dependencies && pkg.dependencies[moduleName];
  const hasDevDependency = pkg.devDependencies && pkg.devDependencies[moduleName];
  return hasNormalDependency || hasDevDependency;
}

async function createTempDir() {
  const path = await fs.mkdtemp(`${os.tmpdir()}${sep}`);
  await fs.mkdir(path, { recursive: true });
  return path;
}

async function spawn(cmd, args, options) {
  const ps = await childProcess.spawn(cmd, args, options);
  return new Promise((resolve, reject) =>
    ps.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ps process exited with code ${code}`))))
  );
}

/** Remove directory recursively, but don't throw if it does not exist. */
async function rmdir(path) {
  try {
    await fs.rmdir(path, { recursive: true });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

/**
 * Creates TypeDoc multiple or single markdown from TypeScript source files.
 *
 * @param out is output directory or file for generated markdown.
 * @param singleFile is whether to combine all output into single markdown file.
 */
async function md({ out, singleFile = false }) {
  // rm -rf api-docs-md && typedoc  --plugin typedoc-plugin-example-tag,typedoc-plugin-markdown --excludeExternals --excludePrivate --excludeProtected --exclude 'src/bin/**/*' --theme markdown --readme none --out api-docs-md src/index.ts && find api-docs-md -name \"index.md\" -exec sh -c 'mv \"$1\" \"${1%index.md}\"index2.md' - {} \\;
  // const cwd = getCwd();
  const bin = join(cwd, "node_modules/.bin/typedoc");

  const outDir = singleFile ? await createTempDir() : out;
  if (!singleFile) await rmdir(outDir);

  const options = [
    "--plugin",
    "typedoc-plugin-example-tag,typedoc-plugin-markdown,typedoc-plugin-param-names",
    "--excludeExternals",
    "--excludePrivate",
    "--excludeProtected",
    "--exclude",
    "'src/bin/**/*'",
    "--hideInPageTOC",
    "--readme",
    "none",
    "--out",
    outDir,
    getTypeDocEntry(),
  ];

  try {
    await spawn(bin, options, { stdio: "inherit" });

    // Rename all "index.md" files as "index2.md", because VuePress treats "index.md" special. Renaming does not matter, because title comes from front-matter.
    const createdFiles = await walk.async(outDir);
    await Promise.all(createdFiles.map((file) => addFrontMatterToMd(file)));

    await Promise.all(
      createdFiles.filter((file) => basename(file) === "index.md").map((file) => fs.rename(file, join(dirname(file), "index2.md")))
    );
  } catch (error) {
    if (singleFile) await rmdir(outDir);
    throw error;
  }

  if (singleFile) {
    // Remove titles at the beginning. README already has a title.
    const apiDoc = (await concatMd(outDir, { dirNameAsTitle: true })).replace(new RegExp(`${pkg.name}.+?${pkg.name}`, "sm"), "");
    fs.writeFile(out, apiDoc);
    await rmdir(outDir);
  }
}

/**
 * Add "front-matter" title to given markdown file using first level 1 title.
 *
 * @param {string} file is the file to add front matter title.
 */
async function addFrontMatterToMd(file) {
  try {
    const content = await fs.readFile(file, { encoding: "utf8" });
    // If file has front-matter (---) do not touch.
    if (content.match(new RegExp("^s+---"))) return;

    // "# Class: User" results in "User". "# User" results in "User".
    const firstTitleMatch = content.match(new RegExp("^[^#]+?#\\s+(.+?)\\r?\\n", "s"));
    const firstTitle =
      firstTitleMatch !== null && firstTitleMatch[1] ? firstTitleMatch[1].replace(/.+?:\s+/, "").replace("@", "\\@") : undefined;

    if (firstTitle) await fs.writeFile(file, `---\ntitle: ${firstTitle}\n---\n\n${content}`);
  } catch (error) {
    if (error.code !== "EISDIR") throw error;
  }
}

/**
 * Creates TypeDoc HTML files from TypeScript source files.
 *
 * @param out is output directory for generated HTML files.
 */
async function html({ out }) {
  // rm -rf api-docs-html && typedoc --plugin typedoc-plugin-example-tag --out api-docs-html src/index.ts
  // const cwd = getCwd();
  const bin = join(cwd, "node_modules/.bin/typedoc");

  await rmdir(out);
  await spawn(bin, ["--plugin", "typedoc-plugin-example-tag", "--out", out, getTypeDocEntry()], { stdio: "inherit" });
}

/**
 * Create "README.md" from "README.njk". Also add TypeScript API docs using TypeDoc if `{% include "api.md" %}` is present in "README.njk"
 */
async function readme() {
  // if grep -q '{% include \"api.md\" %}' 'README.njk'; then npm run typedoc:single-md; mkdir -p temp && mv api.md temp/; fi && readmeasy --partial-dirs temp,module-files/template-partials && rm -rf temp
  // const cwd = getCwd();
  const partialDirs = [join(cwd, "module-files/template-partials")];
  const template = await fs.readFile(join(cwd, "README.njk"), { encoding: "utf8" });

  // If remplate contains API partial or template does not exist (default template contains API partial), create API markdown.
  if (template.includes('{% include "api.md" %}')) {
    const tmpDir = await createTempDir();
    partialDirs.push(tmpDir);
    await md({ out: join(tmpDir, "api.md"), singleFile: true });
  }

  await readmeasy({ partialDirs, dir: cwd });

  // If oclif installed execute `oclif-dev readme`;
  // if (targetModule.hasAnyDependency(["@oclif/command"])) await targetModule.command("oclif-dev readme", { exitOnProcessFailure });
  // intermodular.log("info", "README created: README.md");
}

async function vuepressApi() {
  // npm-run-all -p typedoc:md typedoc:html && rm -rf docs/nav.02.api docs/.vuepress/public/api-site && mv api-docs-md docs/nav.02.api && mv api-docs-html docs/.vuepress/public/api-site && cp assets/typedoc/01.typedoc-iframe.md docs/nav.02.api/ && NODE_ENV=production vuepress build docs

  const mdPath = join(cwd, "docs/nav.02.api");
  const htmlPath = join(cwd, "docs/.vuepress/public/api-site");
  const iframePath = join(cwd, "module-files/vuepress/01.typedoc-iframe.md");

  await Promise.all([md({ out: mdPath }), html({ out: htmlPath })]);
  // await md({ out: mdPath });
  // await html({ out: htmlPath });
  await fs.mkdir(mdPath, { recursive: true });
  await fs.copyFile(iframePath, join(mdPath, basename(iframePath))); // Don't put this in `Promise.all` with `md` and `html`. It needs first directory created. Otherwise file is copied same name with directory, since there is no directory yet.
}

const commands = {
  readme: () => readme(),
  "vuepress-api": () => vuepressApi(),
};

const [command, ...args] = process.argv.slice(2);

commands[command](args);
