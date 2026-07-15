import { pipeline } from "@huggingface/transformers";
import { readFile, writeFile } from "node:fs/promises";

const MODEL_ID = "Xenova/multilingual-e5-small";
const anchors = JSON.parse(
  await readFile(new URL("./anchors.json", import.meta.url), "utf8"),
);

const extractor = await pipeline("feature-extraction", MODEL_ID, {
  dtype: "q8",
  device: "cpu",
  progress_callback: (event) => {
    if (typeof event.progress === "number") {
      process.stdout.write(`\rmodel ${Math.round(event.progress)}%`);
    }
  },
});

async function centroid(examples) {
  const tensor = await extractor(
    examples.map((example) => `passage: ${example}`),
    { pooling: "mean", normalize: true },
  );
  const rows = tensor.tolist();
  const average = rows[0].map((_, column) => {
    const sum = rows.reduce((total, row) => total + row[column], 0);
    return sum / rows.length;
  });
  const magnitude = Math.hypot(...average) || 1;
  return average.map((value) => Number((value / magnitude).toFixed(8)));
}

const output = { model: MODEL_ID, dtype: "q8", dimensions: 0, intent: {}, archetype: {} };
for (const group of ["intent", "archetype"]) {
  for (const [label, examples] of Object.entries(anchors[group])) {
    process.stdout.write(`\n${group}/${label} `);
    output[group][label] = await centroid(examples);
  }
}
output.dimensions = output.intent.protect.length;

await writeFile(
  new URL("../src/ai/centroids.json", import.meta.url),
  `${JSON.stringify(output)}\n`,
  "utf8",
);
process.stdout.write(`\nwrote ${output.dimensions}-dimension centroids\n`);
