/**
 * Connector registration subsystem.
 * Responsible for validating and appending connector SKILL-FRAG.md to the active connector skill.
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";
import { DEFAULT_CONNECTOR_SKILL_PATH } from "./constants";
import { ConnectorRegistrationError } from "./errors";
import type { RegisterConnectorOptions, RegistrationResult } from "./types";

/**
 * Counts endpoints defined in markdown table inside fragment.
 */
function countEndpointsInFragment(content: string): number {
  const lines = content.split("\n");
  let endpointCount = 0;
  for (const line of lines) {
    // Match table rows that define an HTTP method or endpoint route
    if (/\|\s*(?:GET|POST|PUT|PATCH|DELETE|CRUD)\s*\|/i.test(line)) {
      endpointCount++;
    }
  }
  return endpointCount;
}

/**
 * Registers a connector by reading its SKILL-FRAG.md and appending it to the skill file.
 */
export async function registerConnector(
  options: RegisterConnectorOptions
): Promise<RegistrationResult> {
  const { connectorDir, skillPath = DEFAULT_CONNECTOR_SKILL_PATH } = options;

  if (!connectorDir || typeof connectorDir !== "string") {
    throw new ConnectorRegistrationError("connectorDir must be a non-empty string path");
  }

  const resolvedFragPath = path.join(connectorDir, "SKILL-FRAG.md");
  let fragmentContent: string;

  try {
    fragmentContent = await fs.readFile(resolvedFragPath, "utf-8");
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    throw new ConnectorRegistrationError(
      `Could not read SKILL-FRAG.md at '${resolvedFragPath}': ${errorMsg}`
    );
  }

  if (!fragmentContent.trim()) {
    throw new ConnectorRegistrationError(`SKILL-FRAG.md at '${resolvedFragPath}' is empty`);
  }

  const connectorName = path.basename(connectorDir.replace(/\/+$/, ""));
  const endpointsCount = countEndpointsInFragment(fragmentContent);

  const startMarker = `<!-- CONNECTOR: ${connectorName} START -->`;
  const endMarker = `<!-- CONNECTOR: ${connectorName} END -->`;
  const wrappedFragment = `\n${startMarker}\n${fragmentContent.trim()}\n${endMarker}\n`;

  // Ensure parent directory of skill file exists
  const skillDir = path.dirname(skillPath);
  try {
    await fs.mkdir(skillDir, { recursive: true });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    throw new ConnectorRegistrationError(
      `Failed to create directory '${skillDir}' for skill file: ${errorMsg}`
    );
  }

  let existingSkillContent = "";
  let fileExisted = false;
  try {
    existingSkillContent = await fs.readFile(skillPath, "utf-8");
    fileExisted = true;
  } catch {
    fileExisted = false;
  }

  let updatedContent: string;

  if (!fileExisted) {
    // Initialize base skill file with valid YAML frontmatter so omp discovers dynamic connectors
    const baseHeader = [
      "---",
      "name: connectors",
      "description: Dynamically registered external and internal service connectors compiled via connector-builder or live-build.",
      "---",
      "",
      "# Connector Capability Registry",
      "",
      "This document is dynamically assembled by the connector runtime upon registration.",
      "It exposes registered connector tools, endpoint mappings, and operational constraints.",
      "",
    ].join("\n");
    updatedContent = baseHeader + wrappedFragment;
  } else if (existingSkillContent.includes(startMarker)) {
    // Replace existing block for this connector
    const regex = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`, "g");
    updatedContent = existingSkillContent.replace(regex, wrappedFragment.trim());
  } else {
    // Append to existing skill file
    updatedContent = `${existingSkillContent.trimEnd()}\n\n${wrappedFragment}`;
  }

  try {
    await fs.writeFile(skillPath, updatedContent, "utf-8");
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    throw new ConnectorRegistrationError(
      `Failed to write updated skill file at '${skillPath}': ${errorMsg}`
    );
  }

  return {
    connectorName,
    skillPath,
    fragmentAppended: true,
    endpointsCount,
    registeredAt: new Date().toISOString(),
  };
}
