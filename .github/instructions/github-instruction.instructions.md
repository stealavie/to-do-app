## 🤖 **GitHub Copilot Instructions & Rules**

This document outlines the rules and protocol for using GitHub Copilot in this project. **Copilot must follow these guidelines before generating or suggesting any code.**

### ## **Phase 1: Pre-Generation Codespace Review**

Before writing any new code, you must **perform a comprehensive review of the existing codespace**. Your primary objective is to understand the project's context, architecture, and conventions.

1.  **Analyze Project Structure**: Scan the entire directory and file structure. Identify the purpose of key directories (e.g., `src`, `lib`, `tests`, `docs`). Understand how modules and components are organized.
2.  **Identify Core Dependencies & Frameworks**: Review `package.json`, `requirements.txt`, `pom.xml`, `Gemfile`, or any other dependency management files. Identify the primary frameworks (e.g., React, Django, Express), libraries, and their versions. You must use the APIs and patterns established by these tools.
3.  **Learn the Coding Style & Conventions**:
    * **Formatting**: Analyze existing files to determine the established code format (indentation, spacing, line breaks). Adhere strictly to it. If a linter configuration file (like `.eslintrc`, `.prettierrc`) exists, its rules are law.
    * **Naming Conventions**: Observe the naming conventions for variables (`camelCase`, `snake_case`), functions, classes (`PascalCase`), and files. Maintain consistency.
    * **Architectural Patterns**: Identify the prevailing design patterns (e.g., MVC, Singleton, Factory, Redux state management). All new code must conform to these established patterns.
4.  **Study Existing Utilities & Helpers**: Look for a `utils`, `helpers`, or `shared` directory. Before writing new utility functions, check if a similar function already exists. **Prioritize reusing existing code** over creating redundant logic.

---

### ## **Phase 2: Code Generation Rules**

Once the codespace review is complete, all generated code must adhere to the following rules:

1.  **Consistency is Key**: The new code should be **indistinguishable** from the existing code in style, structure, and quality. It must blend in seamlessly.
2.  **Modularity and Single Responsibility**:
    * Generate functions and classes that do **one thing well**.
    * Avoid creating monolithic functions. Keep them short, focused, and testable.
3.  **Documentation First**:
    * Generate comments for complex logic. Explain the *why*, not the *what*.
    * For functions and classes, generate docstrings (e.g., JSDoc, Python Docstrings) explaining the purpose, parameters, and return value.
4.  **Error Handling is Mandatory**:
    * Anticipate potential errors (e.g., null inputs, failed API calls, file not found).
    * Generate appropriate error handling logic, such as `try...catch` blocks, and provide meaningful error messages. Do not let errors fail silently.
5.  **Prioritize Security**:
    * Do not generate code with hardcoded secrets, API keys, or passwords. Use environment variables or a secrets management system.
    * Generate code that is mindful of common vulnerabilities (e.g., SQL injection, XSS). Sanitize all user inputs.
6.  **Performance Matters**:
    * Write efficient, non-blocking code where appropriate.
    * Be mindful of algorithmic complexity. Avoid nested loops that could lead to performance bottlenecks if a more efficient alternative exists.
7.  **Testing in Mind**: Write code that is easily testable. Avoid tight coupling and side effects where possible. If the prompt includes writing tests, they must be thorough and cover edge cases.