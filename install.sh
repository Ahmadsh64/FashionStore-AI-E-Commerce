#!/usr/bin/env bash
# ============================================================
# FashionStore - סקריפט התקנה אוטומטי ל-Linux / macOS
# ============================================================
# הפעלה:
#   chmod +x install.sh
#   ./install.sh
# ============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${CYAN}==========================================${NC}"
echo -e "${CYAN}  FashionStore — Installer${NC}"
echo -e "${CYAN}==========================================${NC}"
echo ""

# 1. Node
echo -e "${YELLOW}[1/4] בודק Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}    ❌ Node.js לא מותקן! הורד מ-https://nodejs.org${NC}"
    exit 1
fi
echo -e "${GREEN}    Node.js נמצא: $(node -v)${NC}"

# 2. npm
echo -e "${YELLOW}[2/4] בודק npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}    ❌ npm לא נמצא${NC}"
    exit 1
fi
echo -e "${GREEN}    npm נמצא: $(npm -v)${NC}"

# 3. Dependencies
echo -e "${YELLOW}[3/4] מתקין תלויות (זה עלול לקחת כמה דקות)...${NC}"
npm install --no-audit --no-fund
echo -e "${GREEN}    ✅ כל התלויות הותקנו${NC}"

# 4. .env.local
echo -e "${YELLOW}[4/4] בודק .env.local...${NC}"
if [ -f ".env.local" ]; then
    echo -e "${GREEN}    .env.local כבר קיים - מדלג${NC}"
elif [ -f ".env.local.example" ]; then
    cp .env.local.example .env.local
    echo -e "${GREEN}    ✅ נוצר .env.local מהתבנית${NC}"
    echo -e "${YELLOW}    ⚠️  ערוך אותו והכנס את מפתחות ה-Supabase שלך!${NC}"
fi

echo ""
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}  ✅ ההתקנה הושלמה!${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo -e "${CYAN}השלבים הבאים:${NC}"
echo "  1. ערוך את .env.local והכנס את מפתחות Supabase"
echo "  2. הרץ את supabase/schema.sql ב-SQL Editor של Supabase"
echo "  3. הפעל: npm run dev"
echo "  4. פתח: http://localhost:3000"
echo ""
