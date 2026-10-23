#!/usr/bin/env bash
set -euo pipefail

mkdir -p evidence

save() {
  local name="$1"
  shift
  {
    printf '$ curl'
    printf ' %q' "$@"
    printf '\n'
    curl -sS "$@"
    printf '\n'
  } > "evidence/$name"
}

save getallbooks http://localhost:5000/
save getbooksbyISBN http://localhost:5000/isbn/1
save getbooksbyauthor http://localhost:5000/author/Chinua%20Achebe
save getbooksbytitle http://localhost:5000/title/Things%20Fall%20Apart
save getbookreview http://localhost:5000/review/1

username="bookuser_$(date +%s)"
password="test12345"
save register -X POST http://localhost:5000/register -H 'Content-Type: application/json' -d "{\"username\":\"$username\",\"password\":\"$password\"}"
save login -c cookies.txt -X POST http://localhost:5000/customer/login -H 'Content-Type: application/json' -d "{\"username\":\"$username\",\"password\":\"$password\"}"
save reviewadded -b cookies.txt -X PUT http://localhost:5000/customer/auth/review/1 -H 'Content-Type: application/json' -d '{"review":"Great book!"}'
save deletereview -b cookies.txt -X DELETE http://localhost:5000/customer/auth/review/1

if [[ -n "${GITHUB_USERNAME:-}" ]]; then
  save githubrepo "https://api.github.com/repos/${GITHUB_USERNAME}/expressBookReviews"
fi

printf 'Done. Copy the contents of each evidence file into the matching question.\n'
