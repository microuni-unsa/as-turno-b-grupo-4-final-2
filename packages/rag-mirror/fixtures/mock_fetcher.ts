import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { PimsDocumentFetcher, PimsDocumentVersionInfo } from "../types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const SAMPLE_DOC_ID = "G4-DOC-001";
export const SAMPLE_DOC_CODE = "G4-PR-INC-001";

/**
 * Injected mock PIMS fetcher providing two-version sample doc without prod network calls.
 * Fails fast and explicitly if an unknown document or version is requested.
 */
export const mockPimsFetcher: PimsDocumentFetcher = async (
  pimsDocId: string,
  version: string
): Promise<PimsDocumentVersionInfo> => {
  if (pimsDocId !== SAMPLE_DOC_ID) {
    throw new Error(
      `MockPimsFetcher: Document '${pimsDocId}' not found. Available fixture is '${SAMPLE_DOC_ID}'.`
    );
  }

  if (version === "1" || version === "1.0") {
    const v1Path = join(__dirname, "sample_doc_v1.txt");
    const content = readFileSync(v1Path, "utf8");
    return {
      pims_doc_id: SAMPLE_DOC_ID,
      code: SAMPLE_DOC_CODE,
      pims_version: "1",
      status: "V",
      filename: "incident_response_v1.txt",
      content,
      mold_path: "molds/incident_response_v1.typ",
      supersedes: null,
      uploaded_at: "2019-06-15T10:00:00.000Z",
    };
  }

  if (version === "2" || version === "2.0") {
    const v2Path = join(__dirname, "sample_doc_v2.txt");
    const content = readFileSync(v2Path, "utf8");
    return {
      pims_doc_id: SAMPLE_DOC_ID,
      code: SAMPLE_DOC_CODE,
      pims_version: "2",
      status: "V",
      filename: "incident_response_v2.txt",
      content,
      mold_path: "molds/incident_response_v2.typ",
      supersedes: "1",
      uploaded_at: "2022-10-20T14:30:00.000Z",
    };
  }

  throw new Error(
    `MockPimsFetcher: Version '${version}' not found for document '${pimsDocId}'. Available versions: ['1', '2'].`
  );
};
