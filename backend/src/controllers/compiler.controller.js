import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import axios from "axios";

const executeCode = asyncHandler(async (req, res) => {
    const { code, language } = req.body;

    if (!code) {
        throw new ApiError(400, "Code is required");
    }

    const runtimeMap = {
        "javascript": { language: "javascript", version: "18.15.0" },
        "python": { language: "python", version: "3.10.0" },
        "java": { language: "java", version: "15.0.2" },
        "cpp": { language: "c++", version: "10.2.0" }
    };

    const runtime = runtimeMap[language];

    if (!runtime) {
        throw new ApiError(400, "Unsupported language");
    }

    try {
        const response = await axios.post("https://emkc.org/api/v2/piston/execute", {
            language: runtime.language,
            version: runtime.version,
            files: [
                {
                    content: code
                }
            ]
        });

        // Piston returns { run: { stdout: "...", stderr: "..." } }
        const { run } = response.data;

        return res.status(200).json(
            new ApiResponse(200, run, "Code executed successfully")
        );

    } catch (error) {
        console.error("Execution Error:", error.message);
        throw new ApiError(500, "Failed to execute code");
    }
});

export { executeCode };