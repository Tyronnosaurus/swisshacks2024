import { authMiddleware } from "@kinde-oss/kinde-auth-nextjs/server"

// This ensures only logged in users can access the pages in the matcher array

export const config = {
    matcher: ["/dashboard/:path*", "/auth-callback"]
}

export default authMiddleware