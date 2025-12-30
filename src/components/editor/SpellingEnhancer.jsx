import React, { useState } from 'react';

const SpellingEnhancer = () => {
  const [userDescription, setUserDescription] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');

  // This function adds the "Perfect Spelling" layer to your description
  const enhancePrompt = () => {
    if (!userDescription.trim()) {
      alert("Please describe your image first.");
      return;
    }

    // These represent the "Magic Words" for general spelling accuracy
    const spellingEnforcement = `
      ---
      SYSTEM REQUIREMENTS FOR TEXT:
      1. All visible text must use correct English orthography and spelling.
      2. No gibberish, pseudotext, or non-existent characters.
      3. All signage, labels, and writing must be legible and coherent.
      4. Render text with high contrast and sharp focus.
      ---
    `.trim();

    // Combine user's idea with the enforcement block
    const finalResult = `${userDescription}\n\n${spellingEnforcement}`;
    
    setEnhancedPrompt(finalResult);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(enhancedPrompt);
    alert("Enhanced prompt copied!");
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>AI Spelling Enforcer</h2>
      <p style={styles.subtext}>
        Enter your scene idea below. We will append strict instructions to ensure 
        all text in the image is spelled correctly.
      </p>

      <textarea
        style={styles.textArea}
        placeholder="e.g. A library with posters on the wall and book titles visible on the shelves..."
        value={userDescription}
        onChange={(e) => setUserDescription(e.target.value)}
        rows={5}
      />

      <button style={styles.button} onClick={enhancePrompt}>
        Enhance for Perfect Spelling
      </button>

      {enhancedPrompt && (
        <div style={styles.outputContainer}>
          <h4 style={styles.outputLabel}>Copy this into your AI generator:</h4>
          <div style={styles.codeBlock}>
            {enhancedPrompt}
          </div>
          <button style={styles.copyButton} onClick={copyToClipboard}>
            Copy Prompt
          </button>
        </div>
      )}
    </div>
  );
};

// Styles
const styles = {
  container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    maxWidth: '600px',
    margin: '2rem auto',
    padding: '20px',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    backgroundColor: '#fff',
  },
  heading: {
    marginTop: 0,
    color: '#2c3e50',
  },
  subtext: {
    color: '#666',
    fontSize: '0.95rem',
    marginBottom: '1rem',
  },
  textArea: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '1rem',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box', // ensures padding doesn't overflow width
  },
  button: {
    marginTop: '15px',
    padding: '12px 24px',
    backgroundColor: '#6c5ce7',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  outputContainer: {
    marginTop: '25px',
    paddingTop: '20px',
    borderTop: '2px dashed #eee',
  },
  outputLabel: {
    margin: '0 0 10px 0',
    color: '#333',
  },
  codeBlock: {
    backgroundColor: '#f4f6f8',
    padding: '15px',
    borderRadius: '6px',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap', // preserves newlines
    color: '#333',
    fontSize: '0.9rem',
    border: '1px solid #dcdcdc',
  },
  copyButton: {
    marginTop: '10px',
    padding: '8px 16px',
    backgroundColor: '#00b894',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  }
};

export default SpellingEnhancer;