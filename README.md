# Cyberix AI - Production-Grade Cybersecurity Assistant

A full-stack AI-powered cybersecurity platform for threat analysis, code scanning, script generation, and SOC operations.

## Features

- 🤖 AI-Powered Security Chat Assistant
- 🔍 Code Vulnerability Scanner
- 📝 Security Script Generator
- 📊 SOC Dashboard with Real-time Logging
- 📚 Cybersecurity Knowledge Base
- 🔐 JWT Authentication & RBAC
- 🛡️ Rate Limiting & Security Headers

## Tech Stack

**Frontend:** HTML, TailwindCSS, JavaScript
**Backend:** Python, FastAPI, SQLAlchemy
**Database:** SQLite (production: PostgreSQL)
**AI:** OpenAI/Claude/OpenRouter compatible

## Quick Start

### Prerequisites
- Python 3.9+
- pip

### Installation

1. Clone and navigate to project:
```bash
cd cyberguard-ai
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment:
```bash
cp .env.example .env
# Edit .env with your API keys
```

5. Run the application:
```bash
python run.py
```

6. Access the application:
- Frontend: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Security Features

- JWT-based authentication
- Bcrypt password hashing
- Role-based access control (RBAC)
- Rate limiting on all endpoints
- Input validation with Pydantic
- SQL injection prevention via ORM
- CORS protection
- Security event logging
- Secure headers

## API Endpoints

- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication
- `POST /ai/chat` - AI security assistant
- `POST /ai/scan` - Code vulnerability scanner
- `POST /ai/script` - Security script generator
- `GET /logs` - Security event logs (admin only)

## Project Structure

```
cyberguard-ai/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   └── services/
│   └── main.py
├── frontend/
│   ├── index.html
│   └── assets/
├── requirements.txt
├── .env.example
└── run.py
```

## Ethical Use Warning

This tool is designed for educational purposes and authorized security testing only. Unauthorized access to computer systems is illegal. Always obtain proper authorization before conducting security assessments.

## License

MIT License - Use responsibly and ethically.
