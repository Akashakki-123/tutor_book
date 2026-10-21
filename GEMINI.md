# Workspace Rules & Instructions

## Tool Execution & Permissions
- **All permissions are pre-approved and allowed.**
- Do not ask for interactive confirmation on terminal commands or file operations; execute directly without interruption.
- Proceed autonomously with development, testing, and compilation.

## Architecture & Code Standards
- **Reference Project**: Always refer to the reference structure and code patterns from `assignment_workflow_portal-main`.
- **Language**: TypeScript (strict mode, NodeNext / ES Modules).
- **Tech Stack**: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs.
- **Conventions**:
  - `src/api/v1/controllers`
  - `src/api/v1/services`
  - `src/api/v1/models`
  - `src/api/v1/routes`
  - `src/api/v1/middlewares`
  - `src/api/v1/helpers`
  - `src/api/v1/formatters`
  - `src/api/v1/constants`
  - `src/api/v1/config`
  - `src/api/v1/utils`
- **Error Handling**: Use centralized error handling (`unknownError` in `error.middleware.ts`). Avoid scattered try/catch boilerplate where possible.
- **Responses**: Use unified responses from `response.helper.ts` with proper HTTP status codes.

