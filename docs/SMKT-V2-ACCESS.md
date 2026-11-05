# SMKT V2 access proposal and review

Status: proposed policy, not an implemented backend guarantee. Reviewed main at
`bda95430ea3ba78301142fc26138742af37e31c0` on 5 November 2026.

## Existing implementation and limits

This repository contains a static browser app. README names the separate Apps Script
files Api.gs, Tatib.gs, and SMKT_Code.gs, but none is in the repository tree.
Only main existed at review time; the repository had no issues or pull requests.
No V2 backend or role migration is available here to review.

- [Menu capabilities](../tatib.js#L257) come from `tatib.awal` as `d.akses`.
  [Navigation](../tatib.js#L307) uses the allowed menu list.
- [luas](../tatib.js#L62) gives BK, Tim Tatib, Wakasek and Kepala Sekolah
  broad client access. [History selection](../tatib.js#L1209) restricts Wali Kelas
  to kelasWali, but BK has no grade scope in that filter, despite the README
  documenting a grade assignment. These are confirmed client rules; server
  enforcement is unknown.
- [Case ownership](../tatib.js#L95) checks the homeroom class, but other
  non-leadership recipients are matched by role alone.
- [API calls](../tatib.js#L152) submit an action, session, and client-selected
  object IDs. A client filter or hidden button cannot authorize these requests.
- [Startup cache](../tatib.js#L229) displays sessionStorage data before refreshing
  capabilities. Revocation must be enforced on every server request, including
  existing sessions; stale browser content also needs a separate cleanup design.
- [Session storage](../tatib.js#L204) keeps a bearer session in localStorage.
  Same-origin script compromise or a shared device can expose it. Verify server
  expiration/revocation and audit retention of student data on logout.
- [Program update](../tatib.js#L2046) previously defaulted missing
  `bolehUnggah` to true. This patch defaults it to false and preserves known
  per-program grants/denials. This fixes a UI fallback only; the upload API
  still needs server authorization. Existing cached grants are not revalidated
  by this small patch.

Do not describe any of these observations as proof that the deployed backend is
vulnerable. No production student records were queried and no bypass was attempted.

## Proposed permission matrix

Canonical API role names must be confirmed against the missing backend.
Teacher means Guru Mapel; homeroom means Wali Kelas; counseling means BK;
discipline administrator means Tim Tatib, not a technical account administrator.
Koordinator Tatib, leadership, Piket, sports and extracurricular roles retain
separate grants and must be explicitly mapped before rollout.

| Operation/data | Teacher | Homeroom teacher | Counseling teacher | Discipline administrator |
| --- | --- | --- | --- | --- |
| Minimal student lookup for reporting | School directory: ID, name, class only | Same | Same | Same |
| Create observed violation | Yes; reporter fixed to authenticated actor | Same | Same | Same |
| Read own initial report | Own reports, limited fields | Same | Same | Same |
| Read full discipline history/evidence | No | Current assigned class | Assigned grade/case | School-wide discipline records |
| Resolve/refer case | Own initial stage only | Assigned class at homeroom stage | Assigned grade/case at BK stage | Assigned discipline-stage case |
| Change another reporter's evidence/points | No | No | No | Audited correction workflow; no silent overwrite |
| Verify gate photos/report proxy attendance | No | Assigned class | No by default | Separate explicit verification grant |
| Record absence | No | Assigned class | No by default | Separate attendance grant |
| Private counseling notes | No | Shared outcome only | Assigned cases | Shared outcome only |
| Record signed guidance statement | No | Assigned class | Assigned grade/case | Shared discipline outcome, no private notes |
| Recommend formal program/sanction | No | Assigned class | Assigned grade/case | Yes |
| Set/change discipline program | No | No | No | Within approved policy; suspension requires leadership approval |
| Upload signed parent consent | No | Assigned class/program | Assigned grade/case/program | Authorized discipline program |
| Generate letters/PDF evidence | Own report only, if separately enabled | Assigned class, redacted | Assigned grade/case, redacted | Discipline record, redacted |
| Edit sanction catalog/calendar | No | No | No | Separate coordinator grant |
| Bulk export | No | No by default | No by default | Separate audited export grant |
| Assign roles/scopes | No | No | No | Separate account-administration grant |
| Activate kiosk / gate scanning / extracurricular attendance | No implicit grant | No implicit grant | No implicit grant | Separate task-specific grants |

Scope is part of each grant: actor, operation, object, fields and workflow stage.
Multiple roles combine only their own scoped grants; BK plus homeroom must not
turn a grade grant into school-wide access. Missing, unknown or ambiguous
assignments deny access. Missing/duplicate homeroom assignment must not widen
scope. Counseling notes must be separate from shared discipline history.
The suspension approval rule and any exceptions require school policy review.

## Required server implementation before V2 rollout

1. Bring the actual deployed backend source and deployment version under review.
   Confirm Google ID-token verification, server-side session lookup, expiry,
   revocation and authoritative role/class/grade assignments. Never trust roles,
   reporter identity, scopes or capability flags supplied by the browser.
2. Centralize a deny-by-default authorization decision at every API action.
   Resolve student ownership through the requested record on the server.
   Checking only a supplied NIS while accepting an unrelated idLog/program ID
   is insufficient.
3. Filter both rows and fields before returning data, including `tatib.awal`,
   `tatib.beranda`, `tatib.dasbor`, `tatib.ringkas`, `tatib.riwayat`,
   `tatib.zona`, photos, case lists and program lists. A minimal reporting
   directory must not carry parent phone numbers, photos or private history.
4. Enforce stage and scope on `tatib.catat`, `tatib.selesaikan`,
   `tatib.tandaiVerifikasi`, `tatib.titipAbsen`, `tatib.izin`,
   `tatib.simpanPembinaan`, `tatib.catatPemulihan`, `tatib.surat`,
   `program.simpan`, `program.ubah` and `program.unggahTtd`.
   Validate allowed transitions, immutable authorship and correction reasons.
5. Apply equivalent checks to `tatib.foto`, `tatib.fotoScan`,
   `tatib.fotoBukti`, `tatib.berkasBukti`, `tatib.pembinaanPdf`,
   `program.pdf`, WA actions, kiosk management and every ekskul action.
   Reauthorize attachments and generated file retrieval; do not rely on a
   shareable Drive URL as the only protection.
6. Derive client capabilities from that same policy. Refresh changed permissions
   and remove stale cached records/screens. Audit actor, target, operation,
   decision and reason without duplicating sensitive notes in logs.

## Verification and acceptance

The patch adds `tests/program-permissions.test.cjs` (Node built-ins only).
Run `node --test tests/program-permissions.test.cjs`. It exercises production
update/render functions for missing, denied and granted upload capabilities,
repeated updates, a distinct program and a not-yet-loaded list.
Before publication, the full app parsed successfully and all five regression
cases passed in an in-memory Node VM harness; the old fallback fails the first
case. No browser end-to-end or backend authorization tests were possible.

For the full backend change, test allowed AND denied requests directly, bypassing
the UI: teacher versus history; own/other class; assigned/unassigned BK grade;
case/program/attachment IDs belonging to another student; cross-stage mutation;
multiple roles; missing/duplicate assignments; revoked/expired sessions; forged
client roles; restricted PDF/photo retrieval; and no writes after denial.
Verify list responses omit unauthorized rows AND fields. Role revocation must
take effect on an already-open session. Test leadership and existing task-specific
roles for regressions before deploying.

## Checks reviewed

All three checks on the reviewed main commit succeeded. The 11 recorded Actions
runs contained one historical failure:
[Pages run 41734664352](https://github.com/zuhrishidig-star/smkt-gerbang/actions/runs/41734664352).
Build and artifact upload succeeded; deploy failed. The deploy job log reports
"Deployment failed, try again later." It gives no deeper root cause. Subsequent
runs, including [latest run 41836839870](https://github.com/zuhrishidig-star/smkt-gerbang/actions/runs/41836839870),
succeeded. There is no current failing application test to repair, and Pages
success does not establish authorization correctness.
