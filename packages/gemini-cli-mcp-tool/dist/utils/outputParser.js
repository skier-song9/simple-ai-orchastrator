import { Logger } from "./logger.js";
/**
 * Parse the raw output from gemini CLI.
 *
 * When invoked with `-o json`, gemini outputs a JSON object.
 * When invoked with `-o text` (default), gemini outputs plain text.
 *
 * Returns a structured GeminiOutput with metadata, response, and rawOutput.
 */
export function parseGeminiOutput(rawOutput, outputFormat = "text") {
    const metadata = { outputFormat };
    if (outputFormat === "json" || outputFormat === "stream-json") {
        // Try to parse JSON response
        try {
            // gemini -o json may output an array of stream events; grab last content block
            // or a direct JSON object with a "response" or "text" field
            const trimmed = rawOutput.trim();
            // Handle stream-json: lines of JSON objects
            if (outputFormat === "stream-json" || trimmed.startsWith("{")) {
                const lines = trimmed
                    .split("\n")
                    .filter((l) => l.trim().startsWith("{"));
                let responseText = "";
                for (const line of lines) {
                    try {
                        const obj = JSON.parse(line);
                        // Common gemini JSON fields
                        if (typeof obj["text"] === "string") {
                            responseText += obj["text"];
                        }
                        else if (typeof obj["response"] === "string") {
                            responseText += obj["response"];
                        }
                        else if (typeof obj["content"] === "string") {
                            responseText += obj["content"];
                        }
                    }
                    catch {
                        // skip malformed lines
                    }
                }
                if (!responseText) {
                    // Try parsing the whole thing as a single JSON object
                    const obj = JSON.parse(trimmed);
                    if (typeof obj["text"] === "string") {
                        responseText = obj["text"];
                    }
                    else if (typeof obj["response"] === "string") {
                        responseText = obj["response"];
                    }
                    else {
                        // Fallback: stringify the parsed object
                        responseText = JSON.stringify(obj, null, 2);
                    }
                }
                const output = { metadata, response: responseText, rawOutput };
                Logger.geminiResponse(responseText);
                return output;
            }
        }
        catch {
            // JSON parse failed; fall through to text parsing
            Logger.warn("Failed to parse JSON output from Gemini CLI; treating as text");
        }
    }
    // Text format: the entire stdout is the response
    const response = rawOutput.trim();
    const output = { metadata, response, rawOutput };
    Logger.geminiResponse(response);
    return output;
}
/**
 * Format GeminiOutput for display in MCP responses.
 */
export function formatGeminiResponse(output, includeMetadata = true) {
    let formatted = "";
    if (includeMetadata && Object.keys(output.metadata).length > 0) {
        formatted += "**Gemini Configuration:**\n";
        if (output.metadata.model)
            formatted += `- Model: ${output.metadata.model}\n`;
        if (output.metadata.outputFormat)
            formatted += `- Output Format: ${output.metadata.outputFormat}\n`;
        if (output.metadata.approvalMode)
            formatted += `- Approval Mode: ${output.metadata.approvalMode}\n`;
        if (output.metadata.workingDir)
            formatted += `- Working Directory: ${output.metadata.workingDir}\n`;
        formatted += "\n";
    }
    formatted += `**Response:**\n`;
    formatted += output.response;
    return formatted;
}
