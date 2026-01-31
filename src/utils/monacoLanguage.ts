/**
 * Maps application language codes to Monaco Editor language IDs
 * @param language - Application language code
 * @returns Monaco Editor language ID
 */
export function getMonacoLanguage(language: string): string {
  const languageMap: Record<string, string> = {
    c: 'cpp',
    cpp: 'cpp',
    csharp: 'csharp',
    typescript: 'typescript',
    javascript: 'javascript',
    python: 'python',
    go: 'go',
    rust: 'rust',
    java: 'java',
    ruby: 'ruby',
    php: 'php',
    erlang: 'erlang',
    kotlin: 'kotlin',
  };
  return languageMap[language] || language;
}
