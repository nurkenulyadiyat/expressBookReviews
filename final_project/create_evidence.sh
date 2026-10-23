#!/usr/bin/env bash
set -euo pipefail

mkdir -p evidence

save() {
  local name="$1"
  local command="$2"
  shift 2
  {
    printf '$ %s\n' "$command"
    curl -sS "$@"
    printf '\n'
  } > "evidence/$name"
}

save getallbooks 'curl http://localhost:5000/' http://localhost:5000/
save getbooksbyISBN 'curl http://localhost:5000/isbn/1' http://localhost:5000/isbn/1
save getbooksbyauthor 'curl http://localhost:5000/author/Chinua%20Achebe' http://localhost:5000/author/Chinua%20Achebe
save getbooksbytitle 'curl http://localhost:5000/title/Things%20Fall%20Apart' http://localhost:5000/title/Things%20Fall%20Apart
save getbookreview 'curl http://localhost:5000/review/1' http://localhost:5000/review/1

username="bookuser_$(date +%s)"
password='test12345'
json="{\"username\":\"$username\",\"password\":\"$password\"}"

save register "curl -X POST http://localhost:5000/register -H 'Content-Type: application/json' -d '$json'" \
  -X POST http://localhost:5000/register -H 'Content-Type: application/json' -d "$json"

save login "curl -c cookies.txt -X POST http://localhost:5000/login -H 'Content-Type: application/json' -d '$json'" \
  -c cookies.txt -X POST http://localhost:5000/login -H 'Content-Type: application/json' -d "$json"

save reviewadded "curl -b cookies.txt -X PUT http://localhost:5000/customer/auth/review/1 -H 'Content-Type: application/json' -d '{\"review\":\"Great book!\"}'" \
  -b cookies.txt -X PUT http://localhost:5000/customer/auth/review/1 -H 'Content-Type: application/json' -d '{"review":"Great book!"}'

save deletereview 'curl -b cookies.txt -X DELETE http://localhost:5000/customer/auth/review/1' \
  -b cookies.txt -X DELETE http://localhost:5000/customer/auth/review/1

if [[ -n "${GITHUB_USERNAME:-}" ]]; then
  {
    printf '%s\n' "\$ curl -s https://api.github.com/repos/${GITHUB_USERNAME}/expressBookReviews | jq '.parent.full_name'"
    curl -sS "https://api.github.com/repos/${GITHUB_USERNAME}/expressBookReviews" | jq '.parent.full_name'
    printf '\n'
  } > evidence/githubrepo
fi

printf 'Done. Copy the contents of each evidence file into the matching question.\n'
