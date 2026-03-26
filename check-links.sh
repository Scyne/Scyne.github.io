#!/usr/bin/env bash

# ─────────────────────────────────────────────
#  scyne.com subdomain checker  (bash 3+ safe)
# ─────────────────────────────────────────────

DOMAIN="scyne.com"

SUBDOMAINS=(
  twitch steam discord snapchat instagram twitter
  bluesky youtube tiktok facebook linkedin reddit
  mastodon threads pinterest spotify apple github
  dribbble behance medium substack patreon ko-fi
)

BOLD="\033[1m"
RESET="\033[0m"
GREEN="\033[32m"
RED="\033[31m"
YELLOW="\033[33m"
CYAN="\033[36m"
DIM="\033[2m"

TMPFILE=$(mktemp /tmp/scyne-check.XXXXXX)
FIXEDFILE=$(mktemp /tmp/scyne-fixed.XXXXXX)
trap 'rm -f "$TMPFILE" "$FIXEDFILE" "$FIXEDFILE.bak"' EXIT

OUTPUT_FILE="scyne-redirects.txt"

echo ""
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${BOLD}  SCYNE.COM subdomain checker${RESET}"
echo -e "${DIM}  Checks all subdomains and helps you fix broken ones${RESET}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""

# ── 1. CHECK ALL LINKS ──────────────────────────────────────────────────────

echo -e "${BOLD}Checking subdomains...${RESET}"
echo ""

for sub in "${SUBDOMAINS[@]}"; do
  url="https://${sub}.${DOMAIN}/"
  printf "  %-22s " "${sub}.${DOMAIN}"

  http_code=$(curl -o /dev/null -s -w "%{http_code}" \
    --max-time 10 \
    --location \
    --max-redirs 10 \
    "$url" 2>/dev/null)

  final_url=$(curl -o /dev/null -s -w "%{url_effective}" \
    --max-time 10 \
    --location \
    --max-redirs 10 \
    "$url" 2>/dev/null)

  if [[ "$http_code" == "000" ]]; then
    echo -e "${RED}✗ NO RESPONSE${RESET}  ${DIM}(no DNS / timeout)${RESET}"
    echo "${sub}|BROKEN|" >> "$TMPFILE"
  elif [[ "$http_code" =~ ^(200|301|302|303|307|308)$ ]]; then
    echo -e "${GREEN}✓ OK${RESET}  ${DIM}(${http_code}) → ${final_url}${RESET}"
    echo "${sub}|OK|${final_url}" >> "$TMPFILE"
  else
    echo -e "${YELLOW}✗ BROKEN${RESET}  ${DIM}(HTTP ${http_code})${RESET}"
    echo "${sub}|BROKEN|" >> "$TMPFILE"
  fi
done

# ── 2. INTERACTIVE FIX FOR BROKEN ONES ─────────────────────────────────────

echo ""
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${BOLD}  Broken link review${RESET}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""

cp "$TMPFILE" "$FIXEDFILE"

has_broken=false

while IFS='|' read -r sub status dest; do
  [[ "$status" != "BROKEN" ]] && continue
  has_broken=true

  echo -e "${RED}${BOLD}✗ ${sub}.${DOMAIN}${RESET} is not resolving."
  echo -e "  ${DIM}What would you like to do?${RESET}"
  echo -e "  ${BOLD}[1]${RESET} Provide the direct URL this should redirect to"
  echo -e "  ${BOLD}[2]${RESET} Omit this subdomain (skip it)"
  echo ""
  read -rp "  Choice (1/2): " choice </dev/tty

  if [[ "$choice" == "1" ]]; then
    echo ""
    read -rp "  Enter the full URL for ${sub}.${DOMAIN}: " direct_url </dev/tty
    # trim trailing whitespace
    direct_url="${direct_url%"${direct_url##*[![:space:]]}"}"
    # replace the BROKEN line with a FIXED line
    grep -v "^${sub}|" "$FIXEDFILE" > "$FIXEDFILE.bak" && mv "$FIXEDFILE.bak" "$FIXEDFILE"
    echo "${sub}|FIXED|${direct_url}" >> "$FIXEDFILE"
    echo -e "  ${GREEN}✓ Saved:${RESET} ${sub}.${DOMAIN} → ${direct_url}"
  else
    grep -v "^${sub}|" "$FIXEDFILE" > "$FIXEDFILE.bak" && mv "$FIXEDFILE.bak" "$FIXEDFILE"
    echo "${sub}|OMIT|" >> "$FIXEDFILE"
    echo -e "  ${DIM}Omitted.${RESET}"
  fi
  echo ""
done < "$TMPFILE"

if [[ "$has_broken" == false ]]; then
  echo -e "  ${GREEN}All subdomains are responding — nothing to fix!${RESET}"
  echo ""
fi

# ── 3. COMPILE OUTPUT ───────────────────────────────────────────────────────

echo ""
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${BOLD}  Redirect records${RESET}"
echo -e "${DIM}  Copy these into your DNS / redirect manager${RESET}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""

> "$OUTPUT_FILE"

{
  echo "# ─────────────────────────────────────────────────────────"
  echo "# scyne.com subdomain redirect records"
  echo "# Generated: $(date)"
  echo "# ─────────────────────────────────────────────────────────"
  echo ""
  echo "# ── WORKING REDIRECTS ────────────────────────────────────"
} >> "$OUTPUT_FILE"

while IFS='|' read -r sub status dest; do
  [[ "$status" != "OK" ]] && continue
  line="https://${sub}.${DOMAIN}/  →  ${dest}"
  echo "$line" >> "$OUTPUT_FILE"
  echo -e "  ${GREEN}✓${RESET} ${line}"
done < "$FIXEDFILE"

{
  echo ""
  echo "# ── USER-SUPPLIED FIXES ──────────────────────────────────"
} >> "$OUTPUT_FILE"

while IFS='|' read -r sub status dest; do
  [[ "$status" != "FIXED" ]] && continue
  line="https://${sub}.${DOMAIN}/  →  ${dest}"
  echo "$line" >> "$OUTPUT_FILE"
  echo -e "  ${YELLOW}↻${RESET} ${line}  ${DIM}(user-supplied)${RESET}"
done < "$FIXEDFILE"

{
  echo ""
  echo "# ── OMITTED (no redirect) ────────────────────────────────"
} >> "$OUTPUT_FILE"

omit_count=0
while IFS='|' read -r sub status dest; do
  [[ "$status" != "OMIT" ]] && continue
  echo "# https://${sub}.${DOMAIN}/  (omitted)" >> "$OUTPUT_FILE"
  echo -e "  ${DIM}— ${sub}.${DOMAIN} (omitted)${RESET}"
  omit_count=$((omit_count + 1))
done < "$FIXEDFILE"

[[ $omit_count -eq 0 ]] && echo "# (none)" >> "$OUTPUT_FILE"

echo ""
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "  ${BOLD}Saved to:${RESET} ${CYAN}${OUTPUT_FILE}${RESET}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""