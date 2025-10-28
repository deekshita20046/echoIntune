# Prerequisites Installation & Verification Guide

## Quick Verification

Run this command to check all prerequisites at once:

```bash
echo "🔍 Checking Prerequisites..." && \
echo "" && echo "📦 Node.js:" && node --version && npm --version && \
echo "" && echo "🐍 Python:" && python3 --version && \
echo "" && echo "🐘 PostgreSQL:" && psql --version && \
echo "" && echo "📝 Git:" && git --version
```

## Individual Checks

### 1️⃣ Node.js (v18+)

**Check if installed:**
```bash
node --version
npm --version
```

**Install on macOS:**
```bash
# Using Homebrew (recommended)
brew install node

# Or download from nodejs.org
# Visit: https://nodejs.org/
```

**Install on Linux (Ubuntu/Debian):**
```bash
# Using NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

**Install on Windows:**
```powershell
# Using Chocolatey
choco install nodejs

# Or download installer from:
# https://nodejs.org/
```

### 2️⃣ Python (v3.9+)

**Check if installed:**
```bash
python3 --version
pip3 --version
```

**Install on macOS:**
```bash
# Using Homebrew (recommended)
brew install python@3.11

# Or download from python.org
# Visit: https://www.python.org/downloads/
```

**Install on Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv

# Verify
python3 --version
pip3 --version
```

**Install on Windows:**
```powershell
# Using Chocolatey
choco install python

# Or download installer from:
# https://www.python.org/downloads/
# ⚠️ Make sure to check "Add Python to PATH"
```

### 3️⃣ PostgreSQL (v14+)

**Check if installed:**
```bash
psql --version

# Check if PostgreSQL server is running
# macOS/Linux:
pg_isready

# Check service status (Linux)
sudo systemctl status postgresql
```

**Install on macOS:**
```bash
# Using Homebrew (recommended)
brew install postgresql@14

# Start PostgreSQL
brew services start postgresql@14

# Or use Postgres.app (GUI)
# Download from: https://postgresapp.com/
```

**Install on Linux (Ubuntu/Debian):**
```bash
# Add PostgreSQL repository
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

# Install
sudo apt update
sudo apt install postgresql-14

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify
sudo -u postgres psql --version
```

**Install on Windows:**
```powershell
# Download installer from:
# https://www.postgresql.org/download/windows/

# Or using Chocolatey
choco install postgresql

# ⚠️ Remember the password you set during installation
```

**First-time PostgreSQL Setup:**
```bash
# macOS/Linux - Create your user
createuser -s postgres

# Or access PostgreSQL as postgres user
sudo -u postgres psql

# In psql, create a password
postgres=# \password postgres

# Create the database for Echo: Intune
postgres=# CREATE DATABASE echointunee;

# Quit
postgres=# \q
```

### 4️⃣ Git

**Check if installed:**
```bash
git --version
```

**Install on macOS:**
```bash
# Using Homebrew
brew install git

# Or install Xcode Command Line Tools
xcode-select --install
```

**Install on Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install git

# Verify
git --version
```

**Install on Windows:**
```powershell
# Using Chocolatey
choco install git

# Or download from:
# https://git-scm.com/download/win
```

**Git Configuration (First Time):**
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Verify
git config --list
```

## Additional Useful Tools

### Homebrew (macOS Package Manager)

If you don't have Homebrew:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Docker (Optional, for containerized deployment)

**macOS:**
```bash
# Download Docker Desktop
# Visit: https://www.docker.com/products/docker-desktop
```

**Linux:**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Node Version Manager (nvm) - For managing multiple Node versions

**macOS/Linux:**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

# Restart terminal, then:
nvm install 18
nvm use 18
nvm alias default 18
```

### Python Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate (macOS/Linux)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

# Deactivate
deactivate
```

## Troubleshooting

### Node.js/npm permission issues

```bash
# Fix npm permissions (macOS/Linux)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### PostgreSQL connection issues

```bash
# Check if PostgreSQL is running
# macOS:
brew services list

# Linux:
sudo systemctl status postgresql

# Start PostgreSQL
# macOS:
brew services start postgresql

# Linux:
sudo systemctl start postgresql
```

### Python pip issues

```bash
# Upgrade pip
python3 -m pip install --upgrade pip

# If pip not found
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python3 get-pip.py
```

### Git authentication issues

```bash
# Set up SSH key for GitHub
ssh-keygen -t ed25519 -C "your.email@example.com"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Copy public key and add to GitHub
cat ~/.ssh/id_ed25519.pub
```

## System Requirements

### Minimum System Requirements
- **OS**: macOS 10.15+, Ubuntu 20.04+, Windows 10+
- **RAM**: 4 GB (8 GB recommended)
- **Storage**: 2 GB free space
- **CPU**: Dual-core processor

### Recommended System Requirements
- **OS**: macOS 13+, Ubuntu 22.04+, Windows 11
- **RAM**: 8 GB or more
- **Storage**: 5 GB free space
- **CPU**: Quad-core processor
- **Internet**: Stable connection for npm/pip packages

## Quick Start Commands

After verifying all prerequisites are installed:

```bash
# 1. Clone or navigate to project
cd /Users/deekshita/Desktop/b-uni/echointunee

# 2. Set up database
createdb echointunee
psql -d echointunee -f backend/config/init-db.sql

# 3. Install frontend dependencies
cd frontend
npm install
cd ..

# 4. Install backend dependencies
cd backend
npm install
cd ..

# 5. Install ML service dependencies
cd ml-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

# 6. Ready to run!
```

## Verification Script

Save this as `check-prerequisites.sh` and run it:

```bash
#!/bin/bash

echo "🔍 Echo: Intune Prerequisites Check"
echo "===================================="
echo ""

# Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    echo "✅ Node.js: $NODE_VERSION"
    echo "✅ npm: $NPM_VERSION"
else
    echo "❌ Node.js: Not installed"
fi

echo ""

# Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "✅ Python: $PYTHON_VERSION"
    
    if command -v pip3 &> /dev/null; then
        PIP_VERSION=$(pip3 --version | awk '{print $2}')
        echo "✅ pip: $PIP_VERSION"
    else
        echo "⚠️  pip: Not installed"
    fi
else
    echo "❌ Python: Not installed"
fi

echo ""

# PostgreSQL
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version)
    echo "✅ PostgreSQL: $PSQL_VERSION"
    
    if pg_isready &> /dev/null; then
        echo "✅ PostgreSQL Server: Running"
    else
        echo "⚠️  PostgreSQL Server: Not running"
    fi
else
    echo "❌ PostgreSQL: Not installed"
fi

echo ""

# Git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    echo "✅ Git: $GIT_VERSION"
else
    echo "❌ Git: Not installed"
fi

echo ""
echo "===================================="
echo "Prerequisites check complete!"
```

Make it executable and run:
```bash
chmod +x check-prerequisites.sh
./check-prerequisites.sh
```

## Next Steps

Once all prerequisites are verified:
1. ✅ Read [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup
2. ✅ Follow installation steps for each component
3. ✅ Configure environment variables
4. ✅ Start development!

---

**Need help?** Check the [SETUP_GUIDE.md](./SETUP_GUIDE.md) or [CONTRIBUTING.md](./CONTRIBUTING.md) for more information.

