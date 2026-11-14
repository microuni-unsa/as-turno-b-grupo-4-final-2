import { strict as assert } from "node:assert";
import { compareVersions, MissingVersionError } from "../diff.js";
import { createMockEmbedder } from "../embedder.js";
import { createMemoryDbClient } from "../db.js";
import { ingest, revectorize } from "../ingest.js";
import { formatCitation, parseCitation, query } from "../query.js";
import { mockPimsFetcher, SAMPLE_DOC_ID } from "./mock_fetcher.js";

async function runSmokeTests(): Promise<void> {
  console.log("=== rag-mirror Smoke Tests ===");

  const db = createMemoryDbClient();
  const embedder = createMockEmbedder(1024);
  const testMirrorDir = "corpus_mirror_smoke_test";

  // 1. Ingest v1
  console.log("[1/6] Ingesting document v1 from PIMS fixture...");
  const resV1 = await ingest(SAMPLE_DOC_ID, "1", {
    fetcher: mockPimsFetcher,
    embedder,
    db,
    mirrorDir: testMirrorDir,
  });

  assert.equal(resV1.pims_doc_id, SAMPLE_DOC_ID);
  assert.equal(resV1.pims_version, "1");
  assert(resV1.chunk_count > 0, "Expected chunks to be generated for v1");
  assert(resV1.chunk_sha256s.length === resV1.chunk_count);
  assert(resV1.file_path.includes("v1.txt"));
  console.log(`  -> v1 ingested successfully: ${resV1.chunk_count} chunks.`);

  // 2. Ingest v2 (supersedes v1)
  console.log("[2/6] Ingesting document v2 from PIMS fixture (supersedes v1)...");
  const resV2 = await ingest(SAMPLE_DOC_ID, "2", {
    fetcher: mockPimsFetcher,
    embedder,
    db,
    mirrorDir: testMirrorDir,
  });

  assert.equal(resV2.pims_doc_id, SAMPLE_DOC_ID);
  assert.equal(resV2.pims_version, "2");
  assert(resV2.chunk_count > 0, "Expected chunks to be generated for v2");
  console.log(`  -> v2 ingested successfully: ${resV2.chunk_count} chunks.`);

  // 3. Query with cosine search & metadata filter
  console.log("[3/6] Querying chunks with cosine search and metadata filter...");
  const queryResults = await query({
    db,
    embedder,
    queryText: "deteccion y respuesta ante incidentes CSIRT",
    filter: {
      pims_doc_id: SAMPLE_DOC_ID,
      pims_version: "2",
      status: "V",
    },
    limit: 3,
  });

  assert(queryResults.length > 0, "Expected query results for v2");
  for (const item of queryResults) {
    assert.equal(item.pims_doc_id, SAMPLE_DOC_ID);
    assert.equal(item.pims_version, "2");
    assert(typeof item.distance === "number");
    assert(item.text.length > 0, "Expected verbatim quote");

    // Verify citation format: pims:<doc_id>:v<version>:chunk:lines
    const expectedCitationPrefix = `pims:${SAMPLE_DOC_ID}:v2:${item.chunk_id}:`;
    assert(
      item.citation.startsWith(expectedCitationPrefix),
      `Citation '${item.citation}' does not match prefix '${expectedCitationPrefix}'`
    );

    const parsed = parseCitation(item.citation);
    assert.equal(parsed.pims_doc_id, SAMPLE_DOC_ID);
    assert.equal(parsed.pims_version, "2");
    assert.equal(parsed.chunk_id, item.chunk_id);
    assert.equal(parsed.lines, item.lines);
  }
  console.log(`  -> Query returned ${queryResults.length} verbatim quotes with valid citations.`);
  console.log(`     Sample citation: ${queryResults[0].citation}`);

  // 4. Structural version comparison (diff v1 vs v2)
  console.log("[4/6] Comparing versions (structural diff v1 vs v2)...");
  const diffResult = await compareVersions(SAMPLE_DOC_ID, "1", "2", {
    fetcher: mockPimsFetcher,
    mirrorDir: testMirrorDir,
  });

  assert.equal(diffResult.pims_doc_id, SAMPLE_DOC_ID);
  assert.equal(diffResult.version_a, "1");
  assert.equal(diffResult.version_b, "2");
  assert.equal(diffResult.supersedes, "1");
  assert(diffResult.chunk_diffs.length > 0, "Expected chunk diff items");
  assert(diffResult.stats.chunks_modified > 0 || diffResult.stats.chunks_added > 0);
  assert(diffResult.summary.includes("Diff G4-DOC-001 (v1 -> v2)"));
  console.log(`  -> Diff computed successfully: ${diffResult.summary}`);

  // 5. Missing version typed error
  console.log("[5/6] Verifying MissingVersionError for missing version 3...");
  let missingErrorCaught = false;
  try {
    await compareVersions(SAMPLE_DOC_ID, "1", "3", {
      fetcher: mockPimsFetcher,
      mirrorDir: testMirrorDir,
    });
  } catch (err) {
    if (err instanceof MissingVersionError) {
      missingErrorCaught = true;
      assert.equal(err.pims_doc_id, SAMPLE_DOC_ID);
      assert.equal(err.missing_version, "3");
      assert(err.message.includes("missing version '3'"));
      console.log(`  -> Correctly threw MissingVersionError: ${err.message}`);
    } else {
      throw err;
    }
  }
  assert(missingErrorCaught, "Expected MissingVersionError to be thrown for missing version 3");

  // 6. Re-vectorize without re-downloading from PIMS
  console.log("[6/6] Testing re-vectorization from local corpus mirror...");
  const revectorizeResult = await revectorize(SAMPLE_DOC_ID, "1", {
    db,
    embedder,
    mirrorDir: testMirrorDir,
  });

  assert.equal(revectorizeResult.pims_doc_id, SAMPLE_DOC_ID);
  assert.equal(revectorizeResult.pims_version, "1");
  assert.equal(revectorizeResult.chunk_count, resV1.chunk_count);
  console.log(`  -> Re-vectorized v1 directly from mirror cache: ${revectorizeResult.chunk_count} chunks.`);

  // Cleanup temporary test mirror dir
  const { rmSync } = await import("node:fs");
  rmSync(testMirrorDir, { recursive: true, force: true });

  console.log("\n=== ALL SMOKE TESTS PASSED ===");
}

runSmokeTests().catch((err) => {
  console.error("Smoke test failed:", err);
  process.exit(1);
});
