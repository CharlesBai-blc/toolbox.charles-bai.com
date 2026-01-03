import { useState } from 'react';
import Editor from '@monaco-editor/react';
import './CodeEditor.css';

interface CodeEditorProps {
  initialCode: string;
  language: string;
}

export const CodeEditor = ({ initialCode, language }: CodeEditorProps) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    setOutput("Running...");

    try {
      // TARGET: Your Secure Cloudflare Domain
      const res = await fetch('https://executor.charles-bai.com/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setOutput("Error: You are clicking too fast! (Rate Limit)");
      } else if (res.status === 503) {
        setOutput("Error: Server is busy processing other jobs. Try again in 5s.");
      } else if (data.error) {
        setOutput(`Error: ${data.error}`);
      } else {
        setOutput(data.stdout || data.stderr || "No output returned.");
      }

    } catch (err) {
      console.error(err);
      setOutput("Network Error: Could not reach execution engine.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="code-editor-container">
      {/* Toolbar */}
      <div className="code-editor-toolbar">
         <span className="code-editor-language">{language}</span>
         <button 
           onClick={handleRun} 
           disabled={loading}
           className="code-editor-run-button"
         >
           {loading ? 'Executing...' : 'Run Code'}
         </button>
      </div>

      {/* Editor */}
      <div className="code-editor-wrapper">
        <Editor 
          height="100%" 
          defaultLanguage={language === 'c' || language === 'cpp' ? 'cpp' : language} 
          value={code} 
          theme="vs-dark"
          onChange={(val) => setCode(val || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>

      {/* Console Output */}
      <div className="code-editor-console">
        <div className="code-editor-console-header">TERMINAL</div>
        <pre className="code-editor-console-output">
          {output || <span className="code-editor-console-placeholder">Output will appear here...</span>}
        </pre>
      </div>
    </div>
  );
};