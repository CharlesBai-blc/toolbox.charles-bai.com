import type { CardLanguage } from '../types/card';

export function getBoilerplate(language: CardLanguage): string {
  switch (language) {
    case 'java':
      return `public class Solution {
    public static void main(String[] args) {
        // Your code here
        
    }
}`;

    case 'c':
      return `#include <stdio.h>

int main() {
    // Your code here
    
    return 0;
}`;

    case 'cpp':
      return `#include <iostream>
using namespace std;

int main() {
    // Your code here
    
    return 0;
}`;

    case 'javascript':
      return `// Your code here
`;

    case 'python':
      return `# Your code here
`;

    case 'go':
      return `package main

import "fmt"

func main() {
    // Your code here
    
}`;

    case 'rust':
      return `fn main() {
    // Your code here
    
}`;

    default:
      return '';
  }
}

export function isBoilerplateOnly(code: string, language: CardLanguage): boolean {
  const boilerplate = getBoilerplate(language);
  const normalizedCode = code.trim();
  const normalizedBoilerplate = boilerplate.trim();
  
  // Check if code is empty or matches boilerplate exactly
  if (!normalizedCode || normalizedCode === normalizedBoilerplate) {
    return true;
  }
  
  // For languages with minimal boilerplate (python, javascript), 
  // consider it boilerplate if it's just comments or whitespace
  if (language === 'python' || language === 'javascript') {
    const withoutComments = normalizedCode
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#') && !line.startsWith('//'))
      .join('\n');
    return !withoutComments || withoutComments.trim().length === 0;
  }
  
  return false;
}

