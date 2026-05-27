#!/bin/sh

CUR=$(pwd)

CURRENT=$(cd "$(dirname "$0")" || exit;pwd)
echo "${CURRENT}"

cd "${CURRENT}" || exit
git pull --prune
result=$?
if [ $result -ne 0 ]; then
  cd "${CUR}" || exit
  exit $result
fi

cd "${CURRENT}/" || exit
result=$?
if [ $result -ne 0 ]; then
  cd "${CUR}" || exit
  exit $result
fi
echo ""
pwd

if ! (disable-checkout-persist-credentials && pinact run -u && pnx pnpm@latest self-update latest-11 && pnpm install -r && pnpm up -r && pnpm audit --fix override && pnpm up -r && pnpm lint-fix && pnpm build && pnpm install -r --no-frozen-lockfile); then
  cd "${CUR}" || exit
  exit 1
fi

cd "${CURRENT}" || exit
result=$?
if [ $result -ne 0 ]; then
  cd "${CUR}" || exit
  exit $result
fi
git pull --prune && git commit -am "Bumps node modules" && git push --force-with-lease
result=$?
if [ $result -ne 0 ]; then
  cd "${CUR}" || exit
  exit $result
fi

cd "${CUR}" || exit
