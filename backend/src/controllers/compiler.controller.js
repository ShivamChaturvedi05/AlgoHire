import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import util from "util";

const execPromise = util.promisify(exec);

const executeCode = asyncHandler(async (req, res) => {
    const { code, language } = req.body;

    if (!code) {
        throw new ApiError(400, "Code is required");
    }

    // Create a temporary directory for execution to isolate files
    const tmpDir = path.join(os.tmpdir(), "algohire-" + uuidv4());
    await fs.mkdir(tmpDir, { recursive: true });

    let stdout = "";
    let stderr = "";
    
    try {
        if (language === "javascript") {
            const filePath = path.join(tmpDir, "index.js");
            await fs.writeFile(filePath, code);
            const { stdout: out, stderr: err } = await execPromise(`node ${filePath}`, { timeout: 10000 });
            stdout = out;
            stderr = err;
        } else if (language === "python") {
            const filePath = path.join(tmpDir, "script.py");
            await fs.writeFile(filePath, code);
            const { stdout: out, stderr: err } = await execPromise(`python ${filePath}`, { timeout: 10000 });
            stdout = out;
            stderr = err;
        } else if (language === "java") {
            const filePath = path.join(tmpDir, "Main.java");
            await fs.writeFile(filePath, code);
            const { stdout: out, stderr: err } = await execPromise(`cd ${tmpDir} && javac Main.java && java Main`, { timeout: 10000 });
            stdout = out;
            stderr = err;
        } else if (language === "cpp") {
            const filePath = path.join(tmpDir, "main.cpp");
            await fs.writeFile(filePath, code);
            const { stdout: out, stderr: err } = await execPromise(`cd ${tmpDir} && g++ main.cpp -o main.exe && main.exe`, { timeout: 10000 });
            stdout = out;
            stderr = err;
        } else {
            throw new ApiError(400, "Unsupported language");
        }
    } catch (error) {
        // If execution fails (e.g., syntax error, compilation error, timeout)
        stderr = error.stderr || error.message;
        stdout = error.stdout || "";
    } finally {
        // Cleanup temp directory
        try {
            await fs.rm(tmpDir, { recursive: true, force: true });
        } catch (e) {
            console.error("Temp cleanup failed:", e);
        }
    }

    // Format output to match what the frontend expects (previously Piston format)
    const runData = {
        stdout,
        stderr,
        code: stderr ? 1 : 0
    };

    return res.status(200).json(
        new ApiResponse(200, runData, "Code executed")
    );
});

export { executeCode };