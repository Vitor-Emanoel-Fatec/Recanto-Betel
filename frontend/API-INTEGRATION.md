# API integration

The frontend uses the NestJS API under `/api`. During development, Vite proxies
`/api` to `http://localhost:3000`; set `VITE_API_URL` to a different API base URL
when the frontend and API are not served together. Requests include credentials so
the browser can send the API's HttpOnly session cookie.

## Authentication and access

- `POST /api/auth/signup` accepts `{ email, password }`, creates only a `USER`, and
  returns the safe `{ id, email, role }` projection. Passwords must be at least 12
  characters.
- `POST /api/auth/signin` accepts `{ email, password }`, sets the `recanto_access`
  HttpOnly cookie, and returns `{ id, email, role }`. The JWT is not returned in the
  response body or stored in browser storage.
- `GET /api/auth/me` validates the cookie and returns the current safe user projection.
- `POST /api/auth/signout` clears the cookie.
- Generic user, Parent, beneficiary, relatives, and authorized-escort CRUD routes are
  restricted to `ADMIN`.
- `ADMIN` can manage all anamneses. `PARENT` can create, read, and update anamneses
  only for beneficiaries linked to their account; only `ADMIN` can delete one.
- Enrollment submission is allowed for `USER` and `PARENT`. A successful first
  submission creates the linked Parent profile and changes the account role to
  `PARENT`. The submitted Parent email must match the authenticated account.

## Enrollment and health records

| Method and path | Access | Purpose |
|---|---|---|
| `POST /api/enrollments` | `USER`, `PARENT` | Submit a family and beneficiary enrollment request |
| `GET /api/enrollments/mine` | `USER`, `PARENT` | List the signed-in user's requests |
| `GET /api/enrollments/mine/:id` | `USER`, `PARENT` | Read one owned request |
| `GET /api/enrollments?status=PENDING` | `ADMIN` | List/filter all enrollment requests |
| `PATCH /api/enrollments/:id/status` | `ADMIN` | Set `PENDING`, `ACCEPTED`, or `REJECTED` and append history |
| `POST /api/anamnese/find` | `PARENT`, `ADMIN` | Find a health record by its ID or beneficiary ID |
| `POST /api/anamnese` | `PARENT`, `ADMIN` | Create an authorized health record |
| `PUT /api/anamnese/:id` | `PARENT`, `ADMIN` | Update an authorized health record or draft |
| `DELETE /api/anamnese/:id` | `ADMIN` | Delete a health record |

Enrollment requests persist the beneficiary, address, household income/benefits,
family members, authorized escorts, a draft anamnese, the responsible account link,
and a `PENDING` enrollment with its initial event in one transaction. Acceptance
does not automatically activate a beneficiary; enrollment review and institutional
admission remain separate decisions.

## Configuration and deployment

The API loads `api/.env` first and uses `api/prisma/.env` as a fallback; variables
already set by the process environment take precedence. For development, copy
`api/.env.example` to `api/.env`, generate a unique value with `openssl rand -hex 32`,
and place it after `JWT_SECRET=`. Keep `api/.env` local and untracked. Startup still
rejects missing secrets and secrets shorter than 32 characters.
`FRONTEND_ORIGIN` must contain the allowed frontend origin(s), comma-separated when
needed, for credentialed CORS. Set the API database variables according to the
Prisma configuration and configure `VITE_API_URL` only when the default same-origin
proxy is not appropriate.

The schema includes an additive migration at
`api/prisma/migrations/20261110040000_auth_enrollment_anamnese_safe/`. It has **not**
been applied to any database as part of this work. Review the target and back up
existing data before running the migration; do not point deployment commands at a
production or otherwise unconfirmed database.

The frontend currently exposes the real enrollment and anamnese flows. Other
legacy form types (terms, attendance/medical authorizations, and reports) do not
have matching persisted API workflows and are not presented as successfully
submitted. They need defined backend contracts before being re-enabled.

Validation completed locally: API build, 38 API unit tests, an HTTP auth flow test
with an in-memory Prisma mock, frontend type-check and production build, and Prisma
schema validation. No database migration or authenticated browser-to-database flow
was run; those require a configured API, test database, and the migration applied
to that test database.
