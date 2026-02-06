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
        "javascript": { language: "javascript", version: "*" },
        "python": { language: "python", version: "*" },
        "java": { language: "java", version: "*" },
        "cpp": { language: "c++", version: "*" }
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

        const { run } = response.data;

        return res.status(200).json(
            new ApiResponse(200, run, "Code executed successfully")
        );

    } catch (error) {
        
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error("No response received from Piston API. Check your internet connection.");
        } else {
            console.error("Error Message:", error.message);
        }

        throw new ApiError(500, "Failed to execute code");
    }
});

export { executeCode };