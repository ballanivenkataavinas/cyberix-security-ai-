"""
AI Service - OpenAI/Groq Integration
"""
from openai import OpenAI
from typing import Tuple, Dict, List
import uuid
from app.core.config import settings

# Session storage (in production, use Redis)
chat_sessions = {}

class AIService:
    def __init__(self):
        # Configure OpenAI client for Groq
        api_key = settings.GROQ_API_KEY or settings.OPENAI_API_KEY
        if not api_key:
            raise ValueError("No API key configured. Set GROQ_API_KEY or OPENAI_API_KEY in .env")
        
        # Use Groq if GROQ_API_KEY is set, otherwise use OpenAI
        if settings.GROQ_API_KEY:
            self.client = OpenAI(
                api_key=api_key,
                base_url="https://api.groq.com/openai/v1"
            )
            self.model = "llama-3.3-70b-versatile"  # Groq's fast model
        else:
            self.client = OpenAI(api_key=api_key)
            self.model = "gpt-3.5-turbo"
    
    async def chat(self, message: str, session_id: str = None) -> Tuple[str, str]:
        """AI-powered cybersecurity chat assistant"""
        if not session_id:
            session_id = str(uuid.uuid4())
        
        # Get or create session history
        if session_id not in chat_sessions:
            chat_sessions[session_id] = [
                {
                    "role": "system",
                    "content": """You are Cyberix AI, an expert cybersecurity assistant. You help with:
- Threat analysis and incident response
- Penetration testing guidance
- SOC operations and monitoring
- Secure coding practices
- Vulnerability assessment
- Security architecture

Provide clear, actionable advice. Always emphasize ethical use and proper authorization.
Be concise but thorough. Use technical language when appropriate."""
                }
            ]
        
        # Add user message
        chat_sessions[session_id].append({"role": "user", "content": message})
        
        # Call AI API
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=chat_sessions[session_id],
                max_tokens=800,
                temperature=0.7
            )
            
            assistant_message = response.choices[0].message.content
            chat_sessions[session_id].append({"role": "assistant", "content": assistant_message})
            
            # Keep only last 10 messages to manage context
            if len(chat_sessions[session_id]) > 21:
                chat_sessions[session_id] = [chat_sessions[session_id][0]] + chat_sessions[session_id][-20:]
            
            return assistant_message, session_id
        
        except Exception as e:
            return f"Error: {str(e)}. Please check your API configuration.", session_id
    
    async def scan_code(self, code: str, language: str, mode: str) -> Dict:
        """Scan code for security vulnerabilities"""
        
        prompts = {
            "vulnerability": f"""Analyze this {language} code for security vulnerabilities.

Code:
```{language}
{code}
```

Provide:
1. List of vulnerabilities found (with severity: Critical/High/Medium/Low)
2. Detailed explanation of each issue
3. Specific fix recommendations

Format as JSON with: vulnerabilities (array), analysis (string), recommendations (string)""",
            
            "explain": f"""Explain this {language} code in detail, focusing on security aspects.

Code:
```{language}
{code}
```

Explain:
- What the code does
- Security implications
- Potential risks
- Best practices applied or missing""",
            
            "rewrite": f"""Rewrite this {language} code to be more secure.

Original Code:
```{language}
{code}
```

Provide:
1. Secure rewritten version
2. Explanation of security improvements
3. Additional recommendations"""
        }
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a security code analyzer. Provide detailed, actionable security analysis."},
                    {"role": "user", "content": prompts.get(mode, prompts["vulnerability"])}
                ],
                max_tokens=1500,
                temperature=0.3
            )
            
            analysis = response.choices[0].message.content
            
            # Parse vulnerabilities (simplified)
            vulnerabilities = self._extract_vulnerabilities(analysis)
            
            return {
                "analysis": analysis,
                "vulnerabilities": vulnerabilities,
                "recommendations": "See analysis for detailed recommendations."
            }
        
        except Exception as e:
            return {
                "analysis": f"Error: {str(e)}",
                "vulnerabilities": [],
                "recommendations": "Please check your API configuration."
            }
    
    async def generate_script(self, task: str, language: str) -> Dict:
        """Generate security testing scripts"""
        
        prompt = f"""Generate a {language} script for: {task}

Requirements:
1. Working, production-ready code
2. Detailed comments explaining each section
3. Usage instructions
4. Error handling
5. Ethical use warnings

The script should be professional and follow best practices."""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a cybersecurity script generator. Create professional, well-documented security tools. Always include ethical use warnings."
                    },
                    {"role": "user", "content": prompt}
                ],
                max_tokens=2000,
                temperature=0.4
            )
            
            script_content = response.choices[0].message.content
            
            # Extract script and usage
            script, usage = self._parse_script_response(script_content, language)
            
            return {
                "script": script,
                "usage": usage,
                "warning": "⚠️ ETHICAL USE ONLY: This script is for authorized security testing only. Unauthorized access to computer systems is illegal. Always obtain proper written authorization before conducting security assessments."
            }
        
        except Exception as e:
            return {
                "script": f"# Error generating script: {str(e)}",
                "usage": "Please check your API configuration.",
                "warning": "⚠️ ETHICAL USE ONLY"
            }
    
    def _extract_vulnerabilities(self, analysis: str) -> List[Dict]:
        """Extract vulnerability information from analysis"""
        vulnerabilities = []
        
        # Simple parsing (in production, use more sophisticated parsing)
        severity_keywords = {
            "critical": ["critical", "severe", "dangerous"],
            "high": ["high", "serious", "major"],
            "medium": ["medium", "moderate"],
            "low": ["low", "minor", "info"]
        }
        
        lines = analysis.split('\n')
        current_vuln = None
        
        for line in lines:
            line_lower = line.lower()
            
            # Detect vulnerability mentions
            if any(word in line_lower for word in ["vulnerability", "issue", "risk", "flaw"]):
                severity = "medium"
                for sev, keywords in severity_keywords.items():
                    if any(kw in line_lower for kw in keywords):
                        severity = sev
                        break
                
                vulnerabilities.append({
                    "type": line.strip(),
                    "severity": severity.upper(),
                    "description": line.strip()
                })
        
        # If no vulnerabilities found, add a default entry
        if not vulnerabilities:
            vulnerabilities.append({
                "type": "Analysis Complete",
                "severity": "INFO",
                "description": "See full analysis for details"
            })
        
        return vulnerabilities[:10]  # Limit to 10
    
    def _parse_script_response(self, content: str, language: str) -> Tuple[str, str]:
        """Parse script and usage from AI response"""
        # Try to extract code blocks
        if "```" in content:
            parts = content.split("```")
            script = ""
            usage = content
            
            for i, part in enumerate(parts):
                if i % 2 == 1:  # Code block
                    # Remove language identifier
                    lines = part.split('\n')
                    if lines[0].strip().lower() in [language, 'python', 'bash', 'powershell', 'sh']:
                        script = '\n'.join(lines[1:])
                    else:
                        script = part
                    break
            
            if not script:
                script = content
            
            return script.strip(), usage
        
        return content, "Run the script according to the comments and instructions provided."
