import { afterEach, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import { tmpdir } from "node:os";
import * as path from "node:path";
import { MAX_UPLOAD_BYTES } from "../../shared/constants.ts";
import {
  FilesService,
  FilesServiceError,
  type PublishedFileSummary,
} from "./service.ts";

const tempDirs: string[] = [];

function createTempDir(prefix: string): string {
  const dir = fs.mkdtempSync(path.join(tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

function makeValidPngBuffer(width = 64, height = 32): Buffer {
  const buf = Buffer.alloc(32, 0);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buf, 0);
  buf.writeUInt32BE(width, 16);
  buf.writeUInt32BE(height, 20);
  buf[25] = 6;
  return buf;
}

function makeValidZipBuffer(marker: string): Buffer {
  const header = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
  const payload = Buffer.from(marker.padEnd(40, " "), "latin1");
  return Buffer.concat([header, payload]);
}

function makeValidDocBuffer(): Buffer {
  const buf = Buffer.alloc(512, 0);
  Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]).copy(buf, 0);
  return buf;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe("FilesService", () => {
  test("creates uploadsDir, _published, and _uploads_meta on construction", () => {
    const baseDir = createTempDir("files-svc-init-");
    const uploadsDir = path.join(baseDir, "nested", "uploads");

    const service = new FilesService({
      uploadsDir,
      publicBaseUrl: "https://demo.pimsai.mistercricro8.top:444/",
    });

    expect(fs.existsSync(service.uploadsDir)).toBe(true);
    expect(fs.existsSync(path.join(service.uploadsDir, "_published"))).toBe(true);
    expect(fs.existsSync(path.join(service.uploadsDir, "_uploads_meta"))).toBe(true);
  });

  test("validates magic bytes for pdf, png, docx, xlsx, doc, txt and rejects corrupted payloads with 422", () => {
    const uploadsDir = createTempDir("files-svc-magic-");
    const service = new FilesService({
      uploadsDir,
      publicBaseUrl: "https://demo.pimsai.mistercricro8.top:444",
    });

    expect(service.parseUploadedFile("txt", Buffer.from("hello\nworld"), "note.txt")).toMatchObject({
      format: "txt",
      metadata: { lineCount: 2, characterCount: 11, encoding: "utf-8" },
    });

    expect(
      service.parseUploadedFile("pdf", Buffer.from("%PDF-1.7\n/Type /Page\n/Type /Page"), "doc.pdf"),
    ).toMatchObject({
      format: "pdf",
      metadata: { pdfVersion: "%PDF-1.7", estimatedPages: 2 },
    });

    expect(service.parseUploadedFile("png", makeValidPngBuffer(120, 80), "img.png")).toMatchObject({
      format: "png",
      metadata: { width: 120, height: 80, colorType: 6 },
    });

    expect(
      service.parseUploadedFile("docx", makeValidZipBuffer("word/document.xml"), "file.docx"),
    ).toMatchObject({
      format: "docx",
      metadata: { container: "OOXML/ZIP", hasMainDocument: true },
    });

    expect(
      service.parseUploadedFile("xlsx", makeValidZipBuffer("xl/workbook.xml"), "sheet.xlsx"),
    ).toMatchObject({
      format: "xlsx",
      metadata: { container: "OOXML/ZIP", hasWorkbook: true },
    });

    expect(service.parseUploadedFile("doc", makeValidDocBuffer(), "legacy.doc")).toMatchObject({
      format: "doc",
      metadata: { container: "OLE_CFBF" },
    });

    const invalidCases: Array<{ ext: "pdf" | "png" | "docx" | "xlsx" | "doc"; buf: Buffer; name: string }> = [
      { ext: "pdf", buf: Buffer.from("not a pdf"), name: "bad.pdf" },
      { ext: "png", buf: Buffer.from("not a png"), name: "bad.png" },
      { ext: "docx", buf: Buffer.from("PK\x03\x04" + "x".repeat(40)), name: "bad.docx" },
      { ext: "xlsx", buf: Buffer.from("PK\x03\x04" + "x".repeat(40)), name: "bad.xlsx" },
      { ext: "doc", buf: Buffer.alloc(64, 0), name: "bad.doc" },
    ];

    for (const item of invalidCases) {
      let caught: unknown;
      try {
        service.parseUploadedFile(item.ext, item.buf, item.name);
      } catch (err) {
        caught = err;
      }
      expect(caught).toBeInstanceOf(FilesServiceError);
      expect((caught as FilesServiceError).statusCode).toBe(422);
    }
  });

  test("saveUpload rejects empty filename (400), >50MB (413), unsupported ext (415), and bad magic (422)", () => {
    const uploadsDir = createTempDir("files-svc-reject-");
    const service = new FilesService({
      uploadsDir,
      publicBaseUrl: "https://demo.pimsai.mistercricro8.top:444",
    });

    expect(() => service.saveUpload({ fileName: "   ", buffer: Buffer.from("hi") })).toThrow(
      FilesServiceError,
    );

    try {
      service.saveUpload({ fileName: " ", buffer: Buffer.from("hi") });
    } catch (err) {
      expect((err as FilesServiceError).statusCode).toBe(400);
    }

    const oversizedBuffer = Buffer.alloc(MAX_UPLOAD_BYTES + 1, 0x61);
    try {
      service.saveUpload({ fileName: "big.txt", buffer: oversizedBuffer });
      throw new Error("Expected 413");
    } catch (err) {
      expect(err).toBeInstanceOf(FilesServiceError);
      expect((err as FilesServiceError).statusCode).toBe(413);
    }

    try {
      service.saveUpload({ fileName: "script.exe", buffer: Buffer.from("MZ") });
      throw new Error("Expected 415");
    } catch (err) {
      expect(err).toBeInstanceOf(FilesServiceError);
      expect((err as FilesServiceError).statusCode).toBe(415);
    }

    try {
      service.saveUpload({ fileName: "fake.pdf", buffer: Buffer.from("plain text") });
      throw new Error("Expected 422");
    } catch (err) {
      expect(err).toBeInstanceOf(FilesServiceError);
      expect((err as FilesServiceError).statusCode).toBe(422);
    }
  });

  test("saveUpload, listUploads, and getUploadedFile survive service restarts", async () => {
    const uploadsDir = createTempDir("files-svc-persist-");
    const baseUrl = "https://demo.pimsai.mistercricro8.top:444";
    const service1 = new FilesService({ uploadsDir, publicBaseUrl: baseUrl });

    const firstBuf = Buffer.from("%PDF-1.7\n1 0 obj\n/Type /Page\nendobj\n");
    const first = service1.saveUpload({
      fileName: "../unsafe dir/Contrato UNSA.pdf",
      buffer: firstBuf,
    });

    await Bun.sleep(10);

    const secondBuf = makeValidPngBuffer(10, 20);
    const second = service1.saveUpload({
      fileName: "diagrama.png",
      buffer: secondBuf,
    });

    expect(first.id.startsWith("upl_")).toBe(true);
    expect(first.fileName).toBe("Contrato UNSA.pdf");
    expect(first.sha256).toBe(createHash("sha256").update(firstBuf).digest("hex"));
    expect(first.url).toBe(`/api/uploads/${first.id}`);
    expect(first.downloadUrl).toBe(`/api/uploads/${first.id}?download=1`);

    // Simulate process restart with a fresh FilesService instance
    const service2 = new FilesService({ uploadsDir, publicBaseUrl: baseUrl });
    const listed = service2.listUploads();
    expect(listed.map((item) => item.id)).toEqual([second.id, first.id]);

    const fetched = service2.getUploadedFile(first.id);
    expect(fetched.record.id).toBe(first.id);
    expect(fetched.sizeBytes).toBe(firstBuf.length);
    expect(fs.readFileSync(fetched.filePath)).toEqual(firstBuf);

    try {
      service2.getUploadedFile("../etc/passwd");
      throw new Error("Expected 400");
    } catch (err) {
      expect((err as FilesServiceError).statusCode).toBe(400);
    }

    try {
      service2.getUploadedFile("upl_000000000000000000000000");
      throw new Error("Expected 404");
    } catch (err) {
      expect((err as FilesServiceError).statusCode).toBe(404);
    }
  });

  test("publishDeliverable handles content, base64, file_path confinement, TTL expiry, and callbacks", async () => {
    const uploadsDir = createTempDir("files-svc-pub-");
    const outsideDir = createTempDir("files-svc-outside-");
    const outsideFile = path.join(outsideDir, "secret.txt");
    fs.writeFileSync(outsideFile, "do not leak");

    const publishedEvents: PublishedFileSummary[] = [];
    const service = new FilesService({
      uploadsDir,
      publicBaseUrl: "https://demo.pimsai.mistercricro8.top:444",
      onPublished: (item) => publishedEvents.push(item),
    });

    const upload = service.saveUpload({
      fileName: "report.txt",
      buffer: Buffer.from("deliverable body"),
    });

    // Reject path outside uploadsDir
    try {
      service.publishDeliverable({ slug: "bad-path", file_path: outsideFile });
      throw new Error("Expected 403");
    } catch (err) {
      expect(err).toBeInstanceOf(FilesServiceError);
      expect((err as FilesServiceError).statusCode).toBe(403);
    }

    // Publish from file_path inside uploadsDir
    const pubFromFile = service.publishDeliverable({
      slug: "report-v1",
      file_path: upload.preservedPath,
    });
    expect(pubFromFile.status).toBe("published");
    expect(pubFromFile.filename).toBe(path.basename(upload.preservedPath));
    expect(pubFromFile.url).toBe("https://demo.pimsai.mistercricro8.top:444/api/files/report-v1");
    expect(pubFromFile.relative_url).toBe("/api/files/report-v1");
    expect(pubFromFile.content_type).toBe("text/plain");
    expect(publishedEvents).toHaveLength(1);

    await Bun.sleep(10);

    // Publish HTML via content
    const pubHtml = service.publishDeliverable({
      slug: "audit report/final",
      filename: "audit.html",
      content: "<h1>OK</h1>",
      ttl_seconds: 120,
    });
    expect(pubHtml.slug).toBe("audit-report-final");
    expect(pubHtml.content_type).toBe("text/html; charset=utf-8");

    // Publish short-TTL item to test expiry
    service.publishDeliverable({
      slug: "ephemeral",
      filename: "ephemeral.json",
      content_base64: Buffer.from('{"ok":true}').toString("base64"),
      ttl_seconds: 0.02,
    });

    await Bun.sleep(35);

    const listed = service.listPublished();
    expect(listed.map((item) => item.slug)).toEqual(["audit-report-final", "report-v1"]);

    const fetched = service.getPublishedFile("audit-report-final");
    expect(fetched.meta.filename).toBe("audit.html");
    expect(fs.readFileSync(fetched.filePath, "utf8")).toBe("<h1>OK</h1>");

    try {
      service.getPublishedFile("ephemeral");
      throw new Error("Expected 410");
    } catch (err) {
      expect(err).toBeInstanceOf(FilesServiceError);
      expect((err as FilesServiceError).statusCode).toBe(410);
    }

    try {
      service.getPublishedFile("does-not-exist");
      throw new Error("Expected 404");
    } catch (err) {
      expect(err).toBeInstanceOf(FilesServiceError);
      expect((err as FilesServiceError).statusCode).toBe(404);
    }
  });
});
