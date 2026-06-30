# DID Method Checklist

> Submission for `did:trail`. All spec section references point to
> `spec/did-method-trail-v1.md` v1.2.1 in https://github.com/trailprotocol/trail-did-method.

---

## Section 0 — Method Identity

| Field | Value |
|---|---|
| Method Name | `did:trail` |
| Method Prefix | `trail` |
| Specification URL | https://github.com/trailprotocol/trail-did-method/blob/main/spec/did-method-trail-v1.md |
| Specification Version | 1.2.1 |
| Specification Status | `[x] Draft` `[ ] Provisional` `[ ] Registered` `[ ] Deprecated` (registration requested via w3c/did-extensions PR #669, pending) |
| Last Updated | 2026-04-22 |
| Spec Length (approx chars) | ~133,000 |

### Authors & Contact

| Role | Name | Contact |
|---|---|---|
| Editor | Christian Hommrich | christian.hommrich@trailprotocol.org |
| Author(s) | Christian Hommrich | |
| Organization | TRAIL Protocol Initiative | Website: https://trailprotocol.org |
| Standards Contact | Christian Hommrich | Email: christian.hommrich@trailprotocol.org |

### Repository

| Field | Value |
|---|---|
| Repo URL | https://github.com/trailprotocol/trail-did-method |
| Reference Implementation URL | https://github.com/trailprotocol/trail-did-method/tree/main/packages/trail-core |
| npm / Package Registry URL | https://www.npmjs.com/package/@trailprotocol/core (v0.1.0) |
| License | Dual: specification CC BY 4.0, code MIT (see LICENSE in repo root) |
| Is Repo Active? (commit in last 6 months) | `[x] Yes` `[ ] No` |
| Is Repo Archived? | `[ ] Yes` `[x] No` |

---

## Section 1 — Abstract & Purpose

> What is this method? Who is it for? What problem does it solve?

**One-paragraph abstract:**

`did:trail` creates identifiers for AI agents and the organizations that operate them. It is anchored in an HTTP-based trust registry (no blockchain) with a federated three-tier trust anchor model, plus a fully offline self-signed mode (`did:trail:self`) where the identifier is the Ed25519 public key itself. Its primary value proposition is accountability: agent DIDs are bound to KYB-verified organizational DIDs, carry EU AI Act risk-class and AI-policy metadata, and support registry-backed revocation and trust tiers. Intended users are organizations deploying AI agents in B2B contexts (including agents hosted on third-party platforms) and the verifiers and auditors who need to establish which legal entity is accountable for an agent's actions (spec §1.1, §1.2).

**Key properties** (check all that apply):

- `[x]` Alias-anchored (human-readable identifiers); normalized slug + content-addressable hash suffix for org/agent modes (§4.5)
- `[x]` Key-anchored (identifier derived from public key); `self` mode; org/agent hash suffix also binds initial key material (§4.1, §4.5.2)
- `[ ]` Blockchain-anchored; explicitly designed to work without a blockchain (§1.2)
- `[x]` Web-anchored (HTTPS); HTTP-based TRAIL Registry as VDR (§3.2)
- `[ ]` Peer-based (no registry); `self` mode is registry-free but not a peer protocol
- `[x]` Hierarchical (parent-child relationships); `agent` DIDs MUST reference a parent `org` DID via `trail:parentOrganization` (§4.2)
- `[x]` Compliance-first (regulatory mapping documented); EU AI Act capability mapping with explicit compliance-gap column (§7.4)
- `[ ]` Privacy-first (ZKP, selective disclosure, or encryption documented); attribute disclosure policy exists (§9.2), but no credential-level selective disclosure or ZKP is specified; subjects are deliberately public/auditable
- `[ ]` Chain-replicable (architecture portable to other registries); registry federation yes (§3.3), chain portability not specified
- `[x]` Web2-transparent (end users don't need to understand the underlying tech); plain HTTPS resolution, JCS canonicalization, no wallet or chain tooling required

**Verifiable Data Registry:**

| Field | Value |
|---|---|
| Primary Registry | WEB-HTTPS (TRAIL Registry, HTTP-based; §3.2) |
| Secondary Registry (if any) | None (registry federation between TRAIL registries, §3.3; not a second registry type) |
| Is the method registry-agnostic? | `[ ] Yes` `[x] No`; authoritative registry model is a deliberate design decision (§3.4, §8.7.1); `self` mode operates without any registry |
| Can the method work on multiple chains/registries? | `[ ] Yes — list:` `[x] No`; federation of multiple TRAIL registries is normative (§3.3), but no other registry/chain type is specified |

---

## Section 2 — Focal Use Case(s) & Identity Tiers

### 2.1 Focal Use Case

The focal scenario is **verifiable AI agent identity in B2B commerce**: an organization (legal entity) registers a `did:trail:org` DID with KYB verification at a TRAIL registry, then registers `did:trail:agent` DIDs for each AI agent deployment it operates (§4.2). Verifiers resolving an agent DID obtain the agent's verification keys, its parent organization, its EU AI Act risk class, its AI policy endpoint, its trust tier (0/1/2) and trust score, and its revocation status via Status List 2021 (§5, §7). Content produced by the agent can carry an `AgentDeclaration` Data Integrity signature binding the artifact to the agent DID and its accountable organization, verifiable offline (§8.13). Agents hosted on third-party platforms (Anthropic, Azure, Google) are covered via the `PlatformIdentityBinding` credential, issued by the deploying organization without requiring platform cooperation (§7.5).

Trust relationships: verifiers select Tier-1 root registries via a local Trust List (§3.4.4); registries issue `TrailIdentityCredential` VCs and publish signed Status Lists (§7.1, §8.7); accountability always terminates at a KYB-verified legal entity (§6.1.1, §7.5.4).

**W3C Use Case Alignment** (check primary + any secondary):

| Use Case | Primary | Secondary | Not Targeted |
|---|---|---|---|
| Enterprise Identifiers (UC-ENT) | `[x]` | `[ ]` | `[ ]` |
| Life-long Credentials / Education (UC-EDU) | `[ ]` | `[ ]` | `[x]` |
| Healthcare / Prescriptions (UC-RX) | `[ ]` | `[ ]` | `[x]` |
| Legal / Digital Executor (UC-LAW) | `[ ]` | `[ ]` | `[x]` |
| Portable Credentials (UC-CRED) | `[ ]` | `[x]` | `[ ]`; TRAIL VCs and AgentDeclarations are portable, offline-verifiable artifacts (§7.1, §8.13) |
| Secure Communication (UC-COMM) | `[ ]` | `[ ]` | `[x]`; protocol-agnostic by design; no messaging layer specified (§1.2) |

### 2.2 Industry Verticals (L2)

| Vertical | Targeted | How the method serves this vertical |
|---|---|---|
| Cross-Border Finance & Payments | `[ ]` | |
| Banking & KYC/AML | `[x]` | Tier 2 (audited) is aimed at regulated industries incl. finance; KYB-verified org identity, registry-assisted recovery, optional key escrow with eIDAS-qualified trust providers (§7.2, §8.8.4) |
| DeFi & On-Chain Identity | `[ ]` | |
| Insurance & Claims | `[ ]` | |
| Supply Chain & Trade | `[ ]` | |
| Government & National eID | `[ ]` | |
| Immigration & Border Control | `[ ]` | |
| Academic Credentials & Diplomas | `[ ]` | |
| Workforce & HR | `[ ]` | |
| Patient Health Records | `[ ]` | |
| Pharmaceutical Provenance | `[ ]` | |
| Social Media & Reputation | `[ ]` | |
| Encrypted Messaging | `[ ]` | |
| IoT & Device Identity | `[ ]` | |
| Real Estate & Property | `[ ]` | |
| Gaming & Metaverse | `[ ]` | |
| Energy & Carbon Credits | `[ ]` | |
| Other: AI Agent Identity & Trust (EU AI Act transparency/accountability) | `[x]` | Core purpose of the method: agent deployment identity bound to accountable legal entity, risk-class metadata, trust tiers/score, revocation, content provenance (§1, §4.2, §7, §8.13) |

### 2.3 Identity Tiers / Subject Types

| Tier / Type | Who | Blockchain Visibility | Custody Model | Capabilities |
|---|---|---|---|---|
| `self` mode / Trust Tier 0 | Any keyholder (dev/test, offline, bootstrap) | N/A (no chain; no registry) | Self-custody | Offline create/resolve; crypto proof of key control only; no revocation, no org attestation (§4.2, §7.2) |
| `org` mode / Trust Tier 1+ | Legal entities (KYB-verified) | N/A (HTTP registry) | Self-custody of keys; registry holds DID Document | Full CRUD, key rotation, recovery, VC issuance subject, revocable (§4.2, §6, §7.2) |
| `agent` mode / Trust Tier 1+ | AI agent deployments, registered by parent org | N/A (HTTP registry) | Deploying org is accountable principal | Bound to parent org, AI metadata (risk class, policy), AgentDeclaration content signatures, revocable (§4.2, §7.5, §8.13) |

Trust Tier 2 (Audited) adds an independent third-party audit on top of Tier 1 for org/agent DIDs (§7.2).

### 2.4 Organizational Identity

| Field | Value |
|---|---|
| Does the method support organizational DIDs? | `[x] Yes` `[ ] No`; `org` mode (§4.2) |
| Does it require LEI or equivalent legal entity binding? | `[ ] Yes` `[ ] No` `[x] Optional`; org mode requires proof of legal entity (business registration document or eIDAS-compatible identity, §6.1.1); LEI specifically is not required |
| Does it support subsidiary/department hierarchies? | `[ ] Yes` `[x] No`; org-to-agent parent-child is normative (§4.2); org-to-sub-org hierarchies are not specified |
| Standard used for org binding (if any) | Custom KYB (business registration or eIDAS-compatible identity, §6.1.1); not GLEIF-vLEI |

---

## Section 3 — W3C Requirements Coverage (R1–R22)

| Req | Name | Satisfied | Standard / Mechanism Used | Spec Section |
|---|---|---|---|---|
| R1 | Authentication / Proof of Control | `[x] Yes` `[ ] No` `[ ] Partial` | Ed25519 verificationMethod + authentication; DataIntegrityProof `eddsa-jcs-2023`; HTTP Message Signatures (RFC 9421) for all registry writes | §5.1, §6.5, §8.2 |
| R2 | Decentralized / Self-Issued | `[ ] Yes` `[ ] No` `[x] Partial` | `self` mode is self-issued and registry-free; org/agent modes are registry-anchored (deliberate accountability trade-off) | §4.2, §6.1.3 |
| R3 | Guaranteed Unique Identifier | `[x] Yes` `[ ] No` `[ ] Partial` | Content-addressable suffix `SHA-256(slug:publicKey)[0:16]` + registry uniqueness verification; self mode: identifier IS the key | §4.5.2, §4.5.3 |
| R4 | No Call Home | `[ ] Yes` `[ ] No` `[x] Partial` | `self` resolution is fully local; org/agent status checks poll the registry Status List (max 1h cache, fail-closed) | §6.2.2, §8.6, §8.7.3 |
| R5 | Associated Cryptographic Material | `[x] Yes` `[ ] No` `[ ] Partial` | JsonWebKey2020 / Ed25519 publicKeyJwk in verificationMethod | §5.1, §8.2 |
| R6 | Streamlined Key Rotation | `[x] Yes` `[ ] No` `[ ] Partial` | Rotation protocol with retained key history and audit trail (pending/active/retired lifecycle); externally audited (repo PR #17, spec/key-rotation-security-audit.md). Self mode cannot rotate (identifier is the key, §8.9.2) | §6.3, §8.9 |
| R7 | Service Endpoint Discovery | `[x] Yes` `[ ] No` `[ ] Partial` | `TrailRegistryService`, `TrailAIPolicyService` service types in the published JSON-LD context | §5.1, §5.2 |
| R8 | Privacy Preserving | `[ ] Yes` `[ ] No` `[x] Partial` | Org/agent identities are deliberately public and auditable (compliance purpose); no PII required in DID Documents; attribute disclosure policy (public/restricted/private) at AI-policy level; no ZKP/credential-level selective disclosure specified | §9.1, §9.2 |
| R9 | Delegation of Control | `[ ] Yes` `[ ] No` `[x] Partial` | org-to-agent hierarchy via `trail:parentOrganization`; multi-controller DID Documents; generic delegation chains not specified | §4.2, §5.3, §8.8.1 |
| R10 | Inter-Jurisdictional | `[x] Yes` `[ ] No` `[ ] Partial` | Identifier design is jurisdiction-free; Tier-1 registries SHOULD be jurisdictionally diverse; recovery guardians SHOULD be cross-jurisdiction | §3.4.1, §8.8.2 |
| R11 | Cannot Be Administratively Denied | `[ ] Yes` `[x] No` `[ ] Partial` | **No (by design).** The registry can revoke org/agent DIDs (with notice, appeal window, and dispute process); administrative revocability IS the accountability feature for the compliance use case. `self` mode exists as the deny-free counterweight (no third party can deactivate it, §6.4) | §6.4.2, §11.2 |
| R12 | Minimized Rents | `[ ] Yes` `[ ] No` `[x] Partial` | Spec (CC BY 4.0), reference implementation, conformance suite, and resolver driver are free; self mode is free; registry operation is designed as a service (pricing not part of the spec) | §1.3 (cost row), LICENSE |
| R13 | No Vendor Lock-In | `[ ] Yes` `[ ] No` `[x] Partial` | Open spec + conformance test suite + Universal Resolver driver + federation requirements (§3.3.3); but in v1.x there is one authoritative registry per DID and the default registry is the fallback anchor | §3.3, §8.7.1 |
| R14 | Preempt / Limit Trackable Data Trails | `[ ] Yes` `[ ] No` `[x] Partial` | No on-chain trails (no blockchain); registry resolution lookups are correlatable like any web resolution; correlation guidance documented (per-interaction agent DIDs) | §9.3 |
| R15 | Cryptographic Future-Proof | `[ ] Yes` `[ ] No` `[x] Partial` | Crypto agility framework with `trail:supportedCryptosuites`, suite registry, and 180-day deprecation path; only `eddsa-jcs-2023` profiled today; PQ suites planned (gated on NIST PQC) | §8.2, §8.12 |
| R16 | Survives Issuing Org Mortality | `[ ] Yes` `[ ] No` `[x] Partial` | Multi-controller and social recovery (3-of-5 guardians, cross-jurisdiction) survive key/org loss; mortality of the registry itself is an open point (federation/escrow roadmap) | §8.8 |
| R17 | Survives Deployment End-of-Life | `[ ] Yes` `[ ] No` `[x] Partial` | DID Documents, VCs, and AgentDeclarations are offline-verifiable (JCS canonicalization, no JSON-LD processing required); status freshness requires a live registry | §6.2.2, §8.13 |
| R18 | Survives Relationship with Provider | `[ ] Yes` `[ ] No` `[x] Partial` | Cross-method binding via `alsoKnownAs` (bidirectional verification) enables identity continuity across methods; a normative BindingProof VC is planned for v1.3.0 to strengthen this cryptographically | §5.4, §8.12 |
| R19 | Cryptographic Auth & Communication | `[x] Yes` `[ ] No` `[ ] Partial` | HTTP Message Signatures (RFC 9421) + DataIntegrityProof; TLS 1.3 mandated for registry communication | §6.5, §8.2, §8.5 |
| R20 | Registry Agnostic | `[ ] Yes` `[x] No` `[ ] Partial` | **No (by design).** The authoritative registry is the core of the trust model (one authoritative registry per DID); federation distributes trust across Tier-1 roots, and `self` mode is the registry-free counterweight, but the method is not registry-agnostic | §3.2, §3.4, §8.7.1 |
| R21 | Legally-Enabled Identity | `[x] Yes` `[ ] No` `[ ] Partial` | Org DIDs map to verified legal entities (KYB); recovery guardians MUST be distinct legal entities; EU AI Act article mapping; dispute/arbitration framework | §6.1.1, §7.4, §11.2 |
| R22 | Human-Centered Interoperability | `[ ] Yes` `[ ] No` `[x] Partial` | Subjects are AI agents and organizations, not natural persons; human accountability is established via `accountableOrg` in AgentDeclarations and the deployer-as-principal model | §7.5.4, §8.13 |

**Total: 8 Yes / 12 Partial / 2 No; 8 / 22 fully satisfied**

The two "No" answers (R11, R20) are deliberate design decisions, not gaps: administrative revocability and an authoritative registry are what the compliance/accountability use case requires. The registry-free `self` mode is the specified counterweight for users who need deny-resistance.

---

## Section 4 — Trust Model

### 4.1 Trust Hierarchy

| Field | Value |
|---|---|
| Trust anchor type | `[ ] Blockchain consensus` `[ ] DNS/CA hierarchy` `[x] Institutional root` `[ ] Peer web-of-trust` `[x] Self-certifying` `[x] Other:` federated hybrid model; Tier-1 root registries (institutional), Tier-2 sub-registries (cross-signed, CA-like but multi-root), Tier-3 endpoint endorsements (web-of-trust overlay, discounted); `self` mode is self-certifying (§3.4) |
| Is trust continuous (requires ongoing validation)? | `[x] Yes` `[ ] No`; status/revocation checks at verification time, max 1h cache, fail-closed (§8.6, §8.7.3) |
| Is trust contextual (different levels per use case)? | `[x] Yes` `[ ] No`; verifiers maintain multiple Trust Lists per context (EU-only, global, high-assurance) and tier requirements per risk level (§3.4.4, §7.2) |
| Is trust composable (multiple trust anchors combinable)? | `[x] Yes` `[ ] No`; verifiers MUST NOT hard-code a single registry; Tier-2 registries MAY cross-sign with multiple Tier-1 roots (§3.4.2, §3.4.4) |

### 4.2 Trust Models Supported

| Model | Name | Description | Who Operates | Trust Level |
|---|---|---|---|---|
| A | Self-signed (Tier 0) | Cryptographic proof of key control only; offline-verifiable; no org attestation, not revocable by third parties | DID controller | Minimal (§7.2) |
| B | Registry-backed (Tier 1) | KYB-verified organizational identity; agent DIDs bound to accountable parent org; revocable; trust score computed | Tier-1/Tier-2 TRAIL registries | Standard (§7.2) |
| C | Audited (Tier 2) | Tier 1 plus independent third-party audit of AI practices, security controls, compliance posture | Registry + accredited auditor | High (§7.2) |

A web-of-trust overlay (Tier-3 endpoint endorsements) feeds trust score dimension D5 at discounted weight, and is never an authoritative revocation signal (§3.4.3).

### 4.3 Issuer Trust & Grading

| Field | Value |
|---|---|
| Does the method define issuer trust levels or grades? | `[x] Yes` `[ ] No`; trust tiers 0/1/2 (§7.2) plus a 5-dimension trust score 0..1 (§7.3) |
| If yes, what criteria determine the grade? | Tier: KYB verification and third-party audit status. Score: identity verification, track record, information provenance, behavioral consistency, third-party attestations (D1-D5, §7.3.1) |
| Are there operational restrictions by grade? | New DIDs enter a probationary state: score capped at 0.5-1.0 until 100 verified interactions AND 30 days age; issuer reputation cannot bypass the cap (anti trust-laundering, §7.2.5). Tier-3 endorsements are weight-discounted (§3.4.3) |
| Does the issuer DID carry verifiable credentials about itself? | `[x] Yes` `[ ] No`; registries issue `TrailIdentityCredential` VCs with tier, score, and StatusList2021 entry (§7.1) |

---

## Section 5 — Architectural Rationale

### 5.1 Identifier Design

| Field | Value |
|---|---|
| Identifier type | `[ ] Human-readable alias` `[ ] Key-derived hash` `[ ] UUID` `[x] Other:` hybrid; normalized human-readable slug + content-addressable hash suffix `SHA-256(slug:publicKey)[0:16]` for org/agent; pure key-derived (multibase Ed25519) for self mode (§4.1, §4.5) |
| Why this design? | Human readability (org/agent names are auditable at a glance) combined with collision resistance and cryptographic binding to the initial key material; identifier stays stable across key rotation (§4.5.2, §6.3) |
| What existing identifier systems does it improve on? | vs. did:web: no domain ownership required, AI-specific trust metadata; vs. did:key: registry accountability and revocation; vs. blockchain methods: no chain dependency, sub-100ms HTTP resolution, GDPR-compatible erasure (§1.3 Technical Differentiation) |

### 5.2 Architecture Layers

| Layer | What It Stores | Where | Mutability |
|---|---|---|---|
| DID Document | Keys, services, TRAIL metadata (risk class, tier, recovery policy) | TRAIL Registry (org/agent); derived from key (self) | Updatable via signed requests; key history retained (§6.3, §8.9) |
| Trust layer | Trust tier, trust score (raw inputs + computed), certification status | Registry resolution metadata + `TrailIdentityCredential` VCs | Recomputed; probationary caps; verifier-side recomputation supported (§7.3.4) |
| Status layer | Revocation/suspension bits | Signed Status List 2021 credentials at registry well-known endpoints | Re-signed on every status change, monotonic versioning (§8.7.2) |
| Content provenance | AgentDeclaration signatures over artifact hashes | Travels with the content artifact | Immutable signed manifests (§8.13) |

### 5.3 State Model

| Field | Value |
|---|---|
| Resolution model | `[x] Mutable state (overwrite in place)` `[ ] Append-only DID Log` `[x] Derived from key` `[ ] Web fetch` `[ ] Other:`; registry-held mutable DID Document with retained key rotation history and versioned resolution (`?versionId=`) for org/agent; deterministically derived from key for self mode (§6.2, §6.3) |
| Resolution complexity | `[x] O(1) — constant` `[ ] O(n) — linear in history` `[ ] Other:`; single HTTP GET (org/agent) or local derivation (self) |
| On-chain storage size (if applicable) | N/A; no blockchain |

---

## Section 6 — Privacy Architecture

### 6.1 PII Handling

| Field | Value |
|---|---|
| Is PII stored on-chain? | `[x] None` `[ ] Hashes only` `[ ] Encrypted` `[ ] Plaintext`; there is no chain; subjects are organizations and AI agents, and DID Documents have no PII-mandatory fields |
| Where is PII stored? | Legal entity information from KYB is held by the registry as GDPR data processor, in EU-jurisdiction data centers only (§9.4, §11.3) |
| Is there a documented right-to-erasure mechanism? | `[x] Yes — describe:` DID deactivation implements right to erasure; any controller MUST be able to deactivate within 1 hour; registry provides DSAR capabilities (§9.4, §9.5) |

### 6.2 Privacy Features

| Feature | Supported | Mechanism |
|---|---|---|
| Selective disclosure | `[ ] Yes` `[x] No` | Attribute classification (public/restricted/private) for the AI Policy document is documented (§9.2), but no credential-level selective disclosure (SD-JWT, BBS+) is specified |
| Pairwise / ephemeral DIDs | `[x] Yes` `[ ] No` | Self-mode DIDs are lightweight/ephemeral by design (§6.3 self-mode rotation note); per-interaction `agent` DIDs with rotating key material are the documented mitigation for elevated privacy needs (§9.3) |
| Zero-knowledge proofs | `[ ] Yes` `[x] No` | Not specified |
| Encrypted data vault | `[ ] Yes` `[x] No` | Not specified |
| Blind indexing | `[ ] Yes` `[x] No` | Not specified |
| Correlation mitigation | `[x] Yes` `[ ] No` | Documented guidance only: per-interaction agent DIDs; Pseudonymous Mode is a planned future specification (§9.3) |

Note: org/agent identities are deliberately public and auditable; that is the accountability purpose of the method (§9.1, §9.2).

### 6.3 Regulatory Compliance Mapping

| Regulation | Country/Region | Addressed | How |
|---|---|---|---|
| GDPR | EU | `[x] Yes` `[ ] No` `[ ] Partial` | Registry as data processor under DPA; EU-only PII storage; DSAR; erasure via deactivation; no PII-mandatory fields in DID Documents (§9.4). This describes the spec's design, not a certification |
| CCPA | USA (California) | `[ ] Yes` `[x] No` `[ ] Partial` | Not addressed in the spec |
| LGPD | Brazil | `[ ] Yes` `[x] No` `[ ] Partial` | Not addressed in the spec |
| FATF Travel Rule (R.16) | Global | `[ ] Yes` `[x] No` `[ ] Partial` | Not addressed in the spec |
| eIDAS 2.0 | EU | `[ ] Yes` `[ ] No` `[x] Partial` | eIDAS-compatible identity accepted as KYB evidence (§6.1.1); escrow agents must be eIDAS-qualified trust service providers (§8.8.4); informative reference only, no conformance claim |
| PCI DSS | Global | `[ ] Yes` `[x] No` `[ ] Partial` | Not addressed in the spec |
| Other: EU AI Act | EU | `[ ] Yes` `[ ] No` `[x] Partial` | Design goal: capability mapping to Art. 13/14/26/49/52 with an explicit per-article compliance-gap column and the normative disclaimer that TRAIL registration does NOT constitute EU AI Act compliance (§7.4) |

---

## Section 7 — DID Syntax

| Field | Value |
|---|---|
| ABNF grammar defined? | `[x] Yes — link:` spec §4.1 (https://github.com/trailprotocol/trail-did-method/blob/main/spec/did-method-trail-v1.md#41-method-specific-identifier) `[ ] No` |
| Example DID(s) | `did:trail:org:acme-corp-eu-a7f3b2c1e9d04f5a` · `did:trail:agent:acme-corp-eu-rfq-assistant-v1-d4e5f6a7b8c3d4e5` · `did:trail:self:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK` |
| Supports hierarchy / subdomains? | `[x] Yes — depth:` 1 (agent DIDs reference a parent org DID via `trail:parentOrganization`; not encoded in the identifier syntax itself) `[ ] No` |
| Network qualifier support? | `[ ] Yes` `[x] No`; three mode namespaces (org/agent/self), no network qualifier |
| Maximum identifier length | 128 characters for the slug-hash subject (org/agent modes, §4.3) |

---

## Section 8 — DID Document

### 8.1 Verification Methods

| Key Type | Supported | Purpose |
|---|---|---|
| Ed25519 | `[x] Yes` `[ ] No` | authentication, assertionMethod (JsonWebKey2020 / publicKeyJwk; the only key type in v1.2.1, §8.2.1) |
| secp256k1 | `[ ] Yes` `[x] No` | |
| P-256 | `[ ] Yes` `[x] No` | |
| BLS12-381 | `[ ] Yes` `[x] No` | |
| ML-DSA (post-quantum) | `[ ] Yes` `[ ] No` `[x] Planned` | Via §8.2 crypto agility framework, gated on NIST PQC finalization (§8.12 v2.0.0 roadmap); specific algorithm not yet profiled |
| ML-KEM (post-quantum) | `[ ] Yes` `[x] No` `[ ] Planned` | No key agreement suite specified |
| RSA | `[ ] Yes` `[x] No` | |
| Other: | `[ ] Yes` `[x] No` | |

### 8.2 Service Endpoints

| Endpoint Type | Supported | Description |
|---|---|---|
| TrailRegistryService | Yes | Resolution endpoint at the authoritative TRAIL registry; also designates the authoritative registry for revocation (§5.2, §8.7.1) |
| TrailAIPolicyService | Yes | Machine-readable AI policy disclosure document (REQUIRED for org mode, OPTIONAL for agent mode, §5.2, §6.1.2) |

### 8.3 Controller Model

| Field | Value |
|---|---|
| Does the DID Document specify controllers? | `[x] Yes` `[ ] No` (§5.3, §8.8.1) |
| Does it support multiple controllers? | `[x] Yes` `[ ] No`; controller array for recovery (§8.8.1) |
| Is there a controller hierarchy (parent controls child)? | `[x] Yes` `[ ] No`; agent DID Documents list the parent org DID as controller; agent DIDs are created and registered by the deploying org (§4.2, §5.3) |

**Provide a sample DID Document** (minimal example, spec §5.1):

```json
{
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://trailprotocol.org/ns/did/v1"
  ],
  "id": "did:trail:org:acme-corp-eu-a7f3b2c1e9d04f5a",
  "verificationMethod": [
    {
      "id": "did:trail:org:acme-corp-eu-a7f3b2c1e9d04f5a#key-1",
      "type": "JsonWebKey2020",
      "controller": "did:trail:org:acme-corp-eu-a7f3b2c1e9d04f5a",
      "publicKeyJwk": {
        "kty": "OKP",
        "crv": "Ed25519",
        "x": "11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo"
      }
    }
  ],
  "authentication": ["did:trail:org:acme-corp-eu-a7f3b2c1e9d04f5a#key-1"],
  "assertionMethod": ["did:trail:org:acme-corp-eu-a7f3b2c1e9d04f5a#key-1"],
  "service": [
    {
      "id": "did:trail:org:acme-corp-eu-a7f3b2c1e9d04f5a#trail-registry",
      "type": "TrailRegistryService",
      "serviceEndpoint": "https://registry.trailprotocol.org/1.0/identifiers/did:trail:org:acme-corp-eu-a7f3b2c1e9d04f5a"
    },
    {
      "id": "did:trail:org:acme-corp-eu-a7f3b2c1e9d04f5a#ai-policy",
      "type": "TrailAIPolicyService",
      "serviceEndpoint": "https://acme-corp.eu/.well-known/trail-ai-policy.json"
    }
  ]
}
```

---

## Section 9 — CRUD Operations

| Operation | Supported | Mechanism | Spec Section |
|---|---|---|---|
| Create | `[x] Yes` `[ ] No` | Signed HTTP POST to registry (DIDAuth + RFC 9421 signature + DataIntegrityProof); KYB for org mode; offline creation for self mode | §6.1 |
| Read / Resolve | `[x] Yes` `[ ] No` | HTTP GET against registry with discovery/federation (org/agent); deterministic local derivation from key (self) | §6.2 |
| Update | `[x] Yes` `[ ] No` | Signed HTTP PUT; key rotation with retained history; identifier immutable | §6.3 |
| Deactivate | `[x] Yes` `[ ] No` | Controller-initiated (signed DELETE) or registry-initiated revocation with notice/appeal; self mode cannot be deactivated by third parties | §6.4 |

### Resolution Details

| Field | Value |
|---|---|
| Resolution algorithm documented? | `[x] Yes` `[ ] No` (§6.2, incl. registry discovery order §3.3.1) |
| Number of RPC/HTTP calls for resolution | 1 HTTP GET (org/agent; up to 2 with a federation 301 redirect); 0 (self mode, fully local) |
| Supports versioned resolution (versionId / versionTime)? | `[x] Yes` `[ ] No`; `?versionId=` DID URL parameter (§6.2.3); `versionTime` not specified |
| Deactivation detection mechanism | `didDocumentMetadata.deactivated` + deactivation date/reason in resolution response (§6.4.3); credential-level revocation via Status List 2021 (§8.7.2) |

---

## Section 10 — On-Chain / Storage Schema (if applicable)

| Field | Value |
|---|---|
| Is there an on-chain data schema? | `[ ] Yes` `[ ] No` `[x] N/A`; no blockchain; the registry storage entry format is documented as a JSON registry entry (spec Appendix A) |
| Schema version | N/A (DID Documents carry `trail:specVersion`, §8.10) |
| Schema size (bytes) | N/A |
| Is the schema versioned with migration path? | `[x] Yes` `[ ] No`; SemVer with normative change-management notice periods (90/180 days) and migration-guide requirement for breaking changes (§8.10, §11.4) |
| Schema documentation link | https://github.com/trailprotocol/trail-did-method/blob/main/spec/did-method-trail-v1.md#12-appendix-a--json-registry-entry |

---

## Section 11 — Proof / Attestation Layer (if applicable)

| Field | Value |
|---|---|
| Separate proof layer? | `[x] Yes — describe:` TRAIL Verifiable Credentials: `TrailIdentityCredential` (tier + trust score, §7.1), `PlatformIdentityBinding` (platform deployment to DID binding, §7.5), `AgentDeclaration` content signatures (artifact-to-agent provenance, §8.13), `OutputAttestationVC` (artifact provenance, Appendix D) `[ ] No` |
| Proof layer standard | W3C VC Data Model 2.0 + W3C Data Integrity (`eddsa-jcs-2023`, JCS canonicalization per RFC 8785) |
| Issuer-signed attestations? | `[x] Yes` `[ ] No`; registry-issued identity VCs; deployer-issued platform bindings; agent-signed content declarations |
| On-chain attestation service? | `[ ] Yes — name:` `[x] No`; no blockchain |

---

## Section 12 — Security Considerations

### 12.1 Threat Model

| Threat | Addressed | Mitigation |
|---|---|---|
| Key compromise | `[x] Yes` `[ ] No` | CSPRNG + HSM requirements (§8.1); rotation protocol with audit history (§8.9); mandatory recovery mechanism: multi-controller, 3-of-5 social recovery with timeout, registry-assisted with 30-day public notice (§8.8) |
| DID hijacking | `[x] Yes` `[ ] No` | Content-addressable hash binds identifier to key material (§4.5.2); registry verifies hash and slug uniqueness (§4.5.3); all writes require DID-based auth, bearer tokens forbidden as sole mechanism (§6.5); recovery timeout window to contest takeover (§8.8.2) |
| Attestation spoofing | `[x] Yes` `[ ] No` | Bidirectional `alsoKnownAs` verification required, unidirectional claims get no trust properties (§5.4.4); Tier-3 web-of-trust endorsements discounted against cluster attacks (§3.4.3); probationary cap against trust laundering (§7.2.5); cross-registry score recomputation against score laundering (§8.7.4) |
| RPC/resolution trust | `[x] Yes` `[ ] No` | Registry MUST sign all resolution responses with its own DID key (§8.3); TLS 1.3 + recommended cert pinning (§8.5); replay protection via nonce + 5-minute timestamp window (§8.4); Status List signature verifiable independent of transport (§8.7.2); fail-closed on status fetch failure (§8.7.3) |
| Subdomain/namespace isolation | `[x] Yes` `[ ] No` `[ ] N/A` | Three disjoint mode namespaces (org/agent/self); slug uniqueness enforced per registry incl. rejection of identical slugs with different hashes (§4.5.3); contested slug/impersonation disputes have a defined resolution path (§11.2) |
| Quantum computing (Shor/Grover) | `[ ] Yes` `[x] No` | Honest: Ed25519-only today. The crypto agility framework (suite registry, `trail:supportedCryptosuites`, 180-day migration path, §8.2) is the defined migration vehicle; PQ suites are roadmap (v2.0.0, gated on NIST PQC, §8.12) but not yet profiled |

There is no separate threat-model appendix; threats are covered in spec §8 (Security Considerations) and the per-feature security subsections (§5.4.4, §7.2.5, §8.13.6).

### 12.2 Post-Quantum Migration

| Field | Value |
|---|---|
| PQ migration path defined? | `[ ] Yes` `[ ] No` `[x] Planned`; migration mechanism (crypto agility, §8.2.3) is normative; concrete PQ suites are roadmap (§8.12) |
| Target PQ algorithms | Not yet profiled (NIST PQC standards referenced as the gate) |
| Hybrid mode (classical + PQ coexistence)? | `[ ] Yes` `[x] No`; multiple active suites are supported by the agility framework, but no hybrid signature mode is specified |
| Timeline / trigger for migration | v2.0.0 roadmap item, dependency: NIST PQC standards finalized (§8.12) |

### 12.3 Key Recovery

| Field | Value |
|---|---|
| Key recovery mechanism defined? | `[x] Yes` `[ ] No`; organizations MUST implement at least one (§8.8) |
| Recovery type | `[x] Social recovery (Shamir)` (M-of-N guardian threshold, recommended 3-of-5, with mandatory timeout, §8.8.2) `[x] Backup keys` (multi-controller recovery, §8.8.1) `[ ] Multi-sig threshold` `[x] Custodial override` (registry-assisted recovery as last resort: KYB re-verification + 30-day waiting period + public notice, §8.8.3) `[x] Other:` optional split-key escrow for regulated industries, never required (§8.8.4) |
| Crypto-shredding (permanent erasure via key deletion)? | `[ ] Yes` `[x] No`; not specified; erasure is implemented via DID deactivation (§9.4) |

---

## Section 13 — Interoperability

### 13.1 Standards Bindings

| Category | Standard | Integration Level | Link / Notes |
|---|---|---|---|
| Core | W3C DID Core v1.1 | `[x] Full` `[ ] Partial` `[ ] None` | Spec conforms to DID Core 1.0 (§2); standard data model, verification relationships, alsoKnownAs |
| Core | DID Resolution v0.3 | `[ ] Full` `[x] Partial` `[ ] None` | Resolution result envelope uses `https://w3id.org/did-resolution/v1` (§6.2.1); DIF Universal Resolver driver implements the contract; full conformance not formally tested |
| Core | JSON-LD Context | `[x] Published` `[ ] Planned` `[ ] None` | URL: https://trailprotocol.org/ns/did/v1 (DID Document terms, §5.2); https://trailprotocol.org/ns/trail/v1 live since 2026-04-21 (§8.12) |
| Credentials | W3C VC Data Model | `[ ] Full` `[x] Partial` `[ ] None` | Spec normatively targets VC Data Model 2.0 (§2, §7.1); honest note: some credential examples still use the 2018 `credentials/v1` context; editorial cleanup pending |
| Credentials | SD-JWT | `[ ] Full` `[ ] Partial` `[x] None` | Not specified |
| Credentials | AnonCreds | `[ ] Full` `[ ] Partial` `[x] None` | Not specified |
| Presentation | DIDComm v2 | `[ ] Full` `[ ] Partial` `[x] None` | Deliberately protocol-agnostic (§1.2); no transport binding specified |
| Presentation | OID4VP | `[ ] Full` `[ ] Partial` `[x] None` | OID4VC is an informative reference only (§1.3, §16) |
| Presentation | Presentation Exchange v2 | `[ ] Full` `[ ] Partial` `[x] None` | Not specified |
| Status | Bitstring Status List | `[ ] Full` `[x] Partial` `[ ] None` | Normative mechanism is the predecessor W3C Status List 2021 (StatusList2021Entry, signed, monotonic versioning, §8.7.2); migration to Bitstring Status List not yet specified |
| Trust | GLEIF vLEI | `[ ] Full` `[ ] Partial` `[x] None` | KYB is custom (business registration / eIDAS-compatible identity, §6.1.1) |
| Trust | eIDAS 2.0 | `[ ] Full` `[x] Partial` `[ ] None` | eIDAS-compatible identity as KYB evidence; eIDAS-qualified trust providers for escrow (§6.1.1, §8.8.4); informative only |
| Other | IETF HTTP Message Signatures (RFC 9421) | `[x] Full` `[ ] Partial` `[ ] None` | Mandatory for all authenticated registry operations (§6.5.1) |
| Other | W3C Data Integrity / eddsa-jcs-2023 (JCS, RFC 8785) | `[x] Full` `[ ] Partial` `[ ] None` | Mandatory cryptosuite for all proofs (§8.2.1); JCS canonicalization enables offline verification without JSON-LD processing |

### 13.2 Agent Framework Integration

| Framework | Integrated | Driver/Module Link |
|---|---|---|
| DIF Universal Resolver | `[x] Yes` `[ ] No` `[ ] Planned` | Driver published, image on GitHub Container Registry; upstream inclusion via DIF universal-resolver PR #546 (pending merge) |
| Credo-TS | `[ ] Yes` `[x] No` `[ ] Planned` | |
| ACA-Py | `[ ] Yes` `[x] No` `[ ] Planned` | |
| Veramo | `[ ] Yes` `[x] No` `[ ] Planned` | |
| walt.id | `[ ] Yes` `[x] No` `[ ] Planned` | |
| SpruceID DIDKit | `[ ] Yes` `[x] No` `[ ] Planned` | |
| Other: | `[ ] Yes` `[x] No` `[ ] Planned` | |

### 13.3 DNS Discovery

| Field | Value |
|---|---|
| DNS TXT record discovery supported? | `[ ] Yes` `[x] No`; registry discovery uses an HTTPS well-known endpoint instead: `/.well-known/trail-registry` and signed `/.well-known/trail-registry.json` operator manifests (§3.3.1, §3.4.1) |
| DNS record format | N/A |

### 13.4 Cross-Method Interoperability

| Field | Value |
|---|---|
| Can a third party verify credentials without method-specific tooling? | `[x] Yes` `[ ] No`; proofs are standard Data Integrity `eddsa-jcs-2023` over JCS; self-mode DIDs and AgentDeclarations verify fully offline; org/agent resolution needs only plain HTTPS GET (no special client) |
| What standard libraries suffice for verification? | Any Ed25519 + RFC 8785 (JCS) implementation plus a W3C Data Integrity eddsa-jcs-2023 verifier; HTTP client for registry resolution |
| Known compatible DID methods | did:web, did:key, did:ebsi via bidirectionally verified `alsoKnownAs` cross-method binding (§5.4); did:key pattern shared for self-mode multibase Ed25519 identifiers |

---

## Section 14 — References

> Normative and informative references from spec §16.

| Reference | Standard Body | URL |
|---|---|---|
| DID Core v1.0 (normative) | W3C | https://www.w3.org/TR/did-core/ |
| Verifiable Credentials Data Model v2.0 (normative) | W3C | https://www.w3.org/TR/vc-data-model-2.0/ |
| DID Specification Registries (normative) | W3C | https://www.w3.org/TR/did-spec-registries/ |
| Status List 2021 (normative) | W3C CCG | https://www.w3.org/TR/vc-status-list/ |
| Data Integrity EdDSA Cryptosuites v1.0 (normative) | W3C CCG | https://www.w3.org/TR/vc-di-eddsa/ |
| RFC 9421 HTTP Message Signatures (normative) | IETF | https://www.rfc-editor.org/rfc/rfc9421 |
| RFC 8785 JSON Canonicalization Scheme (normative) | IETF | https://www.rfc-editor.org/rfc/rfc8785 |
| RFC 8032 EdDSA (normative) | IETF | https://www.rfc-editor.org/rfc/rfc8032 |
| RFC 8037 CFRG Curves for JOSE/COSE (normative) | IETF | https://www.rfc-editor.org/rfc/rfc8037 |
| RFC 7517 JSON Web Key (normative) | IETF | https://www.rfc-editor.org/rfc/rfc7517 |
| RFC 2119 Key words (normative) | IETF | https://www.rfc-editor.org/rfc/rfc2119 |
| Semantic Versioning 2.0.0 (normative) | semver.org | https://semver.org/ |
| EU AI Act, Regulation (EU) 2024/1689 (informative) | European Parliament | https://eur-lex.europa.eu/eli/reg/2024/1689/oj |
| eIDAS 2.0, Regulation (EU) 2024/1183 (informative) | European Parliament | https://eur-lex.europa.eu/eli/reg/2024/1183/oj |
| RFC 3647 Certificate Policy Framework (informative) | IETF | https://www.rfc-editor.org/rfc/rfc3647 |
| OpenID for Verifiable Credentials (informative) | OpenID Foundation | https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html |
| EIP-6551 Token Bound Accounts (informative) | Ethereum | https://eips.ethereum.org/EIPS/eip-6551 |

---

## Section 15 — Implementation & Testing

| Field | Value |
|---|---|
| Number of known implementations | 1 (reference implementation `@trailprotocol/core`; no independent third-party implementations yet; Python/Go SDKs are a v2.0.0 roadmap item, §8.12) |
| Reference implementation URL | https://github.com/trailprotocol/trail-did-method/tree/main/packages/trail-core (npm: `@trailprotocol/core@0.1.0`) |
| Test suite URL | https://github.com/trailprotocol/trail-did-method/tree/main/tests/conformance (Conformance Test Suite v1: 16 vectors across did-creation, did-resolution, revocation, trust-score, plus automated harness) |
| Total tests | 16 conformance vectors (harness run 2026-06-10: 16 pass / 0 fail); additional unit tests in `@trailprotocol/core` via CI |
| Test failures | 0 |
| W3C conformance test suite? | `[ ] Yes` `[x] No`; DIF/W3C interoperability test suite compliance is a v2.0.0 roadmap item (§8.12) |
| Implementation report URL | None yet |

Additional artifacts: DIF Universal Resolver driver (PR #546 pending), GitHub Actions CI (build + test + lint), external key rotation security audit (spec/key-rotation-security-audit.md).

---

## Section 16 — Governance

| Field | Value |
|---|---|
| Community charter / governance doc? | `[x] Yes — URL:` https://github.com/trailprotocol/trail-did-method/blob/main/GOVERNANCE.md plus spec §11 (three-phase governance evolution, dispute resolution, registry operator requirements) `[ ] No` |
| IP affirmation / patent statement? | `[ ] Yes — URL:` `[x] No`; no separate patent statement; spec is CC BY 4.0, code MIT (LICENSE in repo root) |
| Contribution guide? | `[x] Yes — URL:` https://github.com/trailprotocol/trail-did-method/blob/main/CONTRIBUTING.md `[ ] No` |
| Discussion forum | GitHub Issues (trailprotocol/trail-did-method) + W3C CCG mailing list (spec submitted to W3C CCG for review) |
| Versioning policy | Semantic Versioning 2.0.0 with `trail:specVersion` in DID Documents (§8.10); change management with 90/180-day notice periods and mandatory migration guides for breaking changes (§11.4) |

---

## Section 17 — Self-Assessment Summary

| Metric | Value |
|---|---|
| W3C Requirements Met | 8 / 22 (36%) fully; 12 Partial; 2 No-by-design (R11, R20) |
| CRUD Operations | 4 / 4 |
| Primary Focal Use Case | Enterprise Identifiers (UC-ENT); AI agent and organizational identity |
| L2 Verticals Targeted | 2 (AI Agent Identity & Trust [other]; Banking & KYC/AML via Tier 2) |
| Standards Referenced | DID Core 1.0, VC DM 2.0, Status List 2021, Data Integrity eddsa-jcs-2023, RFC 9421, RFC 8785, RFC 8032/8037/7517 |
| Agent Frameworks Integrated | 1 (DIF Universal Resolver; upstream PR pending) |
| Crypto Algorithms Supported | 1 (Ed25519; crypto agility framework for future suites) |
| Privacy Features | 2 / 6 (pairwise/ephemeral DIDs, correlation mitigation guidance; subjects are deliberately public/auditable) |
| Security Threats Addressed | 5 / 6 (quantum: migration framework defined, PQ suites not yet profiled) |
| Known Implementations | 1 |
| Spec Status | Draft (v1.2.1; w3c/did-extensions registration PR #669 pending) |
| Repo Active | Yes |

---

*Checklist version 1.0.0; [did-method-checklist](https://github.com/Attestto-com/did-method-checklist)*
*Published under the [W3C Software and Document License](https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document).*
