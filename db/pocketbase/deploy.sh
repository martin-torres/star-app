#!/usr/bin/env bash
# Create + deploy the isolated star-app PocketBase instance.
#
#   instance dir : /opt/star-pocketbase   (own pb_data + pb_migrations)
#   listen       : 127.0.0.1:8096         (8090/8092/8094 belong to other apps - untouched)
#   public       : https://star-api.uorder.tech  (nginx + certbot)
#
# Every stage is idempotent. The superuser password is generated on the server and
# never printed; it is copied to ~/.hermes/secrets/star-pocketbase.key (600).
#
# Usage:  bash db/pocketbase/deploy.sh            # all stages
#         bash db/pocketbase/deploy.sh --no-dns   # skip the DNS record step
set -euo pipefail

VPS="root@179.198.215.199"
SSH_KEY="$HOME/.ssh/hostinger_hermes"
DOMAIN="star-api.uorder.tech"
IP="179.198.215.199"
RDIR="/opt/star-pocketbase"
PORT=8096
LOCAL_REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MIG="$LOCAL_REPO/db/pocketbase/pb_migrations/1770000001_star_app_schema.js"
SECRETS_DIR="$HOME/.hermes/secrets"

SSH=(ssh -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new -o ConnectTimeout=20 "$VPS")

say() { printf '\n\033[1m== %s ==\033[0m\n' "$*"; }

# --------------------------------------------------------------------------
if [[ "${1:-}" != "--no-dns" ]]; then
  say "1/6 DNS: $DOMAIN -> $IP"
  K=$(cat "$HOME/.hermes/secrets/hostinger.key")
  curl -s -X POST "https://developers.hostinger.com/api/dns/v1/zones/uorder.tech" \
    -H "Authorization: Bearer $K" -H "Content-Type: application/json" \
    -d "{\"overwrite\":false,\"records\":[{\"name\":\"${DOMAIN%%.uorder.tech}\",\"type\":\"A\",\"ttl\":60,\"records\":[{\"content\":\"$IP\"}]}]}" \
    | head -c 300 || true
  echo
else
  say "1/6 DNS: skipped (--no-dns)"
fi

# --------------------------------------------------------------------------
say "2/6 instance: $RDIR on :$PORT"
"${SSH[@]}" bash -s <<EOS
set -euo pipefail
mkdir -p "$RDIR/pb_data" "$RDIR/pb_migrations"
[ -x "$RDIR/pocketbase" ] || { cp /opt/pocketbase/pocketbase "$RDIR/pocketbase"; chmod +x "$RDIR/pocketbase"; }
cat > /etc/systemd/system/star-pocketbase.service <<'UNIT'
[Unit]
Description=PocketBase (star-app) - isolated instance
After=network.target
[Service]
Type=simple
User=root
WorkingDirectory=/opt/star-pocketbase
ExecStart=/opt/star-pocketbase/pocketbase serve --http=127.0.0.1:8096 --dir=/opt/star-pocketbase/pb_data --migrationsDir=/opt/star-pocketbase/pb_migrations
Restart=always
RestartSec=5
LimitNOFILE=4096
[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable --now star-pocketbase.service >/dev/null 2>&1
echo "service: \$(systemctl is-active star-pocketbase.service)"
EOS

# --------------------------------------------------------------------------
say "3/6 apply schema migration (17 collections) + security hooks"
"${SSH[@]}" "cat > $RDIR/pb_migrations/1770000001_star_app_schema.js" < "$MIG"
"${SSH[@]}" "mkdir -p $RDIR/pb_hooks && cat > $RDIR/pb_hooks/star_security.pb.js" \
  < "$LOCAL_REPO/db/pocketbase/pb_hooks/star_security.pb.js"
"${SSH[@]}" bash -s <<EOS
set -euo pipefail
systemctl restart star-pocketbase.service
sleep 3
echo "health: \$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:$PORT/api/health)"
echo "collections: \$(curl -s "http://127.0.0.1:$PORT/api/collections" | python3 -c 'import sys,json;print(len(json.load(sys.stdin).get("items",[])))' 2>/dev/null || echo '?')"
echo "--- hook route live? (expect 400 for a bad body, NOT 404) ---"
curl -s -o /dev/null -w "POST /api/star/verify-pin -> %{http_code}\n" -X POST "http://127.0.0.1:$PORT/api/star/verify-pin" -H "Content-Type: application/json" -d '{}'
echo "--- private_settings must NOT be publicly readable ---"
curl -s -o /dev/null -w "anon GET private_settings -> %{http_code}\n" "http://127.0.0.1:$PORT/api/collections/private_settings/records"
curl -s -o /dev/null -w "anon GET orders          -> %{http_code}\n" "http://127.0.0.1:$PORT/api/collections/orders/records"
EOS

# --------------------------------------------------------------------------
say "4/6 superuser credentials"
"${SSH[@]}" bash -s <<EOS
set -euo pipefail
if [ ! -f /root/star-pb-credentials.txt ]; then
  PW=\$(openssl rand -base64 32 | tr -d '/+=' | head -c 24)
  $RDIR/pocketbase superuser upsert "admin@star.local" "\$PW" --dir="$RDIR/pb_data" >/dev/null
  printf 'identity: admin@star.local\npassword: %s\n' "\$PW" > /root/star-pb-credentials.txt
  chmod 600 /root/star-pb-credentials.txt
  echo "credentials: created"
else
  echo "credentials: already present"
fi
EOS
mkdir -p "$SECRETS_DIR" && chmod 700 "$SECRETS_DIR"
scp -i "$SSH_KEY" -q "$VPS:/root/star-pb-credentials.txt" "$SECRETS_DIR/star-pocketbase.key"
chmod 600 "$SECRETS_DIR/star-pocketbase.key"
echo "local copy: $SECRETS_DIR/star-pocketbase.key (600)"

# --------------------------------------------------------------------------
say "5/6 nginx + TLS for $DOMAIN"
"${SSH[@]}" bash -s <<EOS
set -euo pipefail
cat > /etc/nginx/sites-available/star-api.conf <<'CONF'
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;
    client_max_body_size 25M;
    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$remote_addr;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 3600s;
        proxy_buffering off;
    }
}
CONF
ln -sf /etc/nginx/sites-available/star-api.conf /etc/nginx/sites-enabled/star-api.conf
nginx -t && systemctl reload nginx
echo "nginx: ok"
EOS
# certbot only if DNS resolves to this box
if getent hosts "$DOMAIN" >/dev/null 2>&1; then
  "${SSH[@]}" "certbot --nginx -d $DOMAIN --non-interactive --agree-tos --redirect -m admin@$DOMAIN 2>&1 | tail -5"
else
  echo "WARN: $DOMAIN does not resolve yet; run certbot later:"
  echo "      ssh -i $SSH_KEY $VPS 'certbot --nginx -d $DOMAIN --non-interactive --agree-tos --redirect -m you@example.com'"
fi

# --------------------------------------------------------------------------
say "6/6 verification"
"${SSH[@]}" bash -s <<EOS
set -euo pipefail
echo "--- service ---"; systemctl is-active star-pocketbase.service
echo "--- local health ---"; curl -s "http://127.0.0.1:$PORT/api/health"; echo
echo "--- public health ---"; curl -s -o /dev/null -w 'HTTPS %{http_code}\n' "https://$DOMAIN/api/health" || echo "HTTPS not up (cert/DNS)"
echo "--- collections + anon rules ---"
TOK=\$(python3 - <<'PY'
import json
d=dict(l.split(': ',1) for l in open('/root/star-pb-credentials.txt').read().strip().splitlines())
print(d['identity']+"\x00"+d['password'])
PY
)
ID=\${TOK%%$'\x00'*}; PW=\${TOK#*$'\x00'}
T=\$(curl -s -X POST "http://127.0.0.1:$PORT/api/collections/_superusers/auth-with-password" -H "Content-Type: application/json" -d "{\"identity\":\"\$ID\",\"password\":\"\$PW\"}" | python3 -c 'import sys,json;print(json.load(sys.stdin).get("token",""))')
curl -s "http://127.0.0.1:$PORT/api/collections?perPage=200" -H "Authorization: \$T" | python3 -c '
import sys,json
for c in json.load(sys.stdin).get("items",[]):
    if c["name"].startswith("_"): continue
    print(f"  {c[\"name\"]:22s} fields={len(c.get(\"fields\",[])):3d} list={str(c.get(\"listRule\"))[:6]:6s} create={str(c.get(\"createRule\"))[:6]}")
'
EOS
say "done"
