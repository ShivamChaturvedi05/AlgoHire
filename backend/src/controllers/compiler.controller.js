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
            const { stdout: out, stderr: err } = await execPromise(`node index.js`, { cwd: tmpDir, timeout: 10000 });
            stdout = out;
            stderr = err;
        } else if (language === "python") {
            const filePath = path.join(tmpDir, "script.py");
            await fs.writeFile(filePath, code);
            const { stdout: out, stderr: err } = await execPromise(`python script.py`, { cwd: tmpDir, timeout: 10000 });
            stdout = out;
            stderr = err;
        } else if (language === "java") {
            const filePath = path.join(tmpDir, "Main.java");
            await fs.writeFile(filePath, code);
            const { stdout: out, stderr: err } = await execPromise(`javac Main.java && java Main`, { cwd: tmpDir, timeout: 10000 });
            stdout = out;
            stderr = err;
        } else if (language === "cpp") {
            const filePath = path.join(tmpDir, "main.cpp");
            await fs.writeFile(filePath, code);
            const { stdout: out, stderr: err } = await execPromise(`g++ main.cpp -o main.exe && main.exe`, { cwd: tmpDir, timeout: 10000 });
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

const executeTests = asyncHandler(async (req, res) => {
    const { code, language, testCases } = req.body;

    if (!code || !testCases || !Array.isArray(testCases)) {
        throw new ApiError(400, "Code and an array of testCases are required");
    }

    const tmpDir = path.join(os.tmpdir(), "algohire-" + uuidv4());
    await fs.mkdir(tmpDir, { recursive: true });

    let results = [];
    
    try {
        let execCommandTemplate = "";
        let compileError = null;

        if (language === "javascript") {
            const filePath = path.join(tmpDir, "index.js");
            await fs.writeFile(filePath, code);
            execCommandTemplate = `node index.js`;
        } else if (language === "python") {
            const filePath = path.join(tmpDir, "script.py");
            await fs.writeFile(filePath, code);
            execCommandTemplate = `python script.py`;
        } else if (language === "java") {
            const filePath = path.join(tmpDir, "Main.java");
            await fs.writeFile(filePath, code);
            try {
                await execPromise(`javac Main.java`, { cwd: tmpDir, timeout: 10000 });
                execCommandTemplate = `java Main`;
            } catch (err) {
                compileError = err.stderr || err.message;
            }
        } else if (language === "cpp") {
            const filePath = path.join(tmpDir, "main.cpp");
            await fs.writeFile(filePath, code);
            try {
                await execPromise(`g++ main.cpp -o main.exe`, { cwd: tmpDir, timeout: 10000 });
                execCommandTemplate = `main.exe`;
            } catch (err) {
                compileError = err.stderr || err.message;
            }
        } else {
            throw new ApiError(400, "Unsupported language");
        }

        if (compileError) {
            for (let i = 0; i < testCases.length; i++) {
                results.push({
                    passed: false,
                    stdout: "",
                    stderr: compileError,
                    input: testCases[i].input,
                    expectedOutput: testCases[i].expectedOutput,
                    isHidden: testCases[i].isHidden || false
                });
            }
        } else {
            for (let i = 0; i < testCases.length; i++) {
                const tc = testCases[i];
                let stdout = "";
                let stderr = "";
                
                try {
                    const inputFilePath = path.join(tmpDir, `input_${i}.txt`);
                    await fs.writeFile(inputFilePath, tc.input || "");
                    
                    const { stdout: out, stderr: err } = await execPromise(`${execCommandTemplate} < "input_${i}.txt"`, { cwd: tmpDir, timeout: 5000 });
                    stdout = out;
                    stderr = err;
                } catch (error) {
                    stderr = error.stderr || error.message;
                    stdout = error.stdout || "";
                }

                const cleanOutput = stdout.trim();
                const cleanExpected = tc.expectedOutput.trim();
                const passed = !stderr && (cleanOutput === cleanExpected);

                results.push({
                    passed,
                    stdout: cleanOutput,
                    stderr,
                    input: tc.input,
                    expectedOutput: cleanExpected,
                    isHidden: tc.isHidden || false
                });
            }
        }
    } finally {
        try {
            await fs.rm(tmpDir, { recursive: true, force: true });
        } catch (e) {
            console.error("Temp cleanup failed:", e);
        }
    }

    return res.status(200).json(
        new ApiResponse(200, results, "Tests executed")
    );
});

export { executeCode, executeTests };