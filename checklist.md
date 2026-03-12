# DID Method Checklist

> Copy this file, fill it out for your method, and submit a PR to `submissions/did-yourmethod.md`.
> Answer every section. Use `N/A` with a brief explanation if a section genuinely doesn't apply.
> Dropdown options reference `data/*.json` — use the exact IDs where indicated.

---

## Section 0 — Method Identity

| Field | Value |
|---|---|
| Method Name | `did:` |
| Method Prefix | |
| Specification URL | |
| Specification Version | |
| Specification Status | `[ ] Draft` `[ ] Provisional` `[ ] Registered` `[ ] Deprecated` |
| Last Updated | YYYY-MM-DD |
| Spec Length (approx chars) | |

### Authors & Contact

| Role | Name | Contact |
|---|---|---|
| Editor | | |
| Author(s) | | |
| Organization | | Website: |
| Standards Contact | | Email: |

### Repository

| Field | Value |
|---|---|
| Repo URL | |
| Reference Implementation URL | |
| npm / Package Registry URL | |
| License | |
| Is Repo Active? (commit in last 6 months) | `[ ] Yes` `[ ] No` |
| Is Repo Archived? | `[ ] Yes` `[ ] No` |

---

## Section 1 — Abstract & Purpose

> What is this method? Who is it for? What problem does it solve?

**One-paragraph abstract:**

<!-- Write a concise abstract (3-5 sentences) that answers:
     - What type of identifier does this method create?
     - What is the primary anchoring mechanism (blockchain, web, peer, etc.)?
     - What is the primary value proposition (privacy, compliance, usability, etc.)?
     - Who are the intended users (institutions, individuals, devices, etc.)?
-->

**Key properties** (check all that apply):

- `[ ]` Alias-anchored (human-readable identifiers)
- `[ ]` Key-anchored (identifier derived from public key)
- `[ ]` Blockchain-anchored
- `[ ]` Web-anchored (HTTPS)
- `[ ]` Peer-based (no registry)
- `[ ]` Hierarchical (parent-child relationships)
- `[ ]` Compliance-first (regulatory mapping documented)
- `[ ]` Privacy-first (ZKP, selective disclosure, or encryption documented)
- `[ ]` Chain-replicable (architecture portable to other registries)
- `[ ]` Web2-transparent (end users don't need to understand the underlying tech)

**Verifiable Data Registry:**

| Field | Value |
|---|---|
| Primary Registry | <!-- Use ID from data/standards-catalog.json registries --> |
| Secondary Registry (if any) | |
| Is the method registry-agnostic? | `[ ] Yes` `[ ] No` |
| Can the method work on multiple chains/registries? | `[ ] Yes — list:` `[ ] No` |

---

## Section 2 — Focal Use Case(s) & Identity Tiers

> What is the PRIMARY scenario this method is designed for?
> A method can serve multiple use cases, but should have a clearly defined focal scenario.

### 2.1 Focal Use Case

<!-- Describe your focal use case in narrative form (1-2 paragraphs).
     Include: actors, flow, trust relationships, what gets issued/verified/presented. -->

**W3C Use Case Alignment** (check primary + any secondary):

| Use Case | Primary | Secondary | Not Targeted |
|---|---|---|---|
| Enterprise Identifiers (UC-ENT) | `[ ]` | `[ ]` | `[ ]` |
| Life-long Credentials / Education (UC-EDU) | `[ ]` | `[ ]` | `[ ]` |
| Healthcare / Prescriptions (UC-RX) | `[ ]` | `[ ]` | `[ ]` |
| Legal / Digital Executor (UC-LAW) | `[ ]` | `[ ]` | `[ ]` |
| Portable Credentials (UC-CRED) | `[ ]` | `[ ]` | `[ ]` |
| Secure Communication (UC-COMM) | `[ ]` | `[ ]` | `[ ]` |

### 2.2 Industry Verticals (L2)

> Which specific industries does this method target? Check all that apply and explain how.

<!-- Use IDs from data/industries.json l2Verticals -->

| Vertical | Targeted | How the method serves this vertical |
|---|---|---|
| Cross-Border Finance & Payments | `[ ]` | |
| Banking & KYC/AML | `[ ]` | |
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
| Other: _______________ | `[ ]` | |

### 2.3 Identity Tiers / Subject Types

> Does the method define different tiers or levels of identity? (e.g., individual vs. organizational, self-sovereign vs. custodial)

| Tier / Type | Who | Blockchain Visibility | Custody Model | Capabilities |
|---|---|---|---|---|
| | | | | |
| | | | | |
| | | | | |

### 2.4 Organizational Identity

| Field | Value |
|---|---|
| Does the method support organizational DIDs? | `[ ] Yes` `[ ] No` |
| Does it require LEI or equivalent legal entity binding? | `[ ] Yes` `[ ] No` `[ ] Optional` |
| Does it support subsidiary/department hierarchies? | `[ ] Yes` `[ ] No` |
| Standard used for org binding (if any) | <!-- e.g., GLEIF-VLEI, X509, custom --> |

---

## Section 3 — W3C Requirements Coverage (R1–R22)

> For each requirement: mark if satisfied, state which standard or mechanism satisfies it, and link to the spec section.

| Req | Name | Satisfied | Standard / Mechanism Used | Spec Section |
|---|---|---|---|---|
| R1 | Authentication / Proof of Control | `[ ] Yes` `[ ] No` `[ ] Partial` | | §__ |
| R2 | Decentralized / Self-Issued | `[ ] Yes` `[ ] No` `[ ] Partial` | | §__ |
| R3 | Guaranteed Unique Identifier | `[ ] Yes` `[ ] No` `[ ] Partial` | | §__ |
| R4 | No Call Home | `[ ] Yes` `[ ] No` `[ ] Partial` | | §__ |
| R5 | Associated Cryptographic Material | `[ ] Yes` `[ ] No` `[ ] Partial` | | §__ |
| R6 | Streamlined Key Rotation | `[ ] Yes` `[ ] No` `[ ] Partial` | | §__ |
| R7 | Service Endpoint Discovery | `[ ] Yes` `[ ] No` `[ ] Partial` | | §__ |
| R8 | Privacy Preserving | `[ ] Yes` `[ ] No` `[ ] Partial` | | §__ |
| R9 | Delegation of Control | `[ ] Yes` `[ ] No` `[ ] Partial` | | §__ |
| R10 | Inter-Jurisdictional | `[ ] Yes` `[ ] No` `[ ] Partial` | | §__ |
| R11 | Cannot Be Administratively Denied | `[ ] Yes` `[ ] No` `[ ] Partial` | | §__ |
| R12 | Minimized Rents | `[ ] Yes` `[ ] No` `[ ] Partial` | | §__ |
| R13 | No Vendor Lock-In | `[ ] Yes` `[ ] No` `[ ] Partial` | | §__ |
| R14 | Preempt / Limit Trackable Data Trails | `[ ] Yes` `[ ] No` `[ ] Partial` | | §__ |
| R15 | Cryptographic Future-Proof | `[ ] Yes` `[ ] No` `[ ] Partial` | | §__ |
| R16 | Survives Issuing Org Mortality | `[ ] Yes` `[ ] No` `[ ] Partial` | | §__ |
| R17 | Survives Deployment End-of-Life | `[ ] Yes` `[ ] No` `[ ] Partial` | | §__ |
| R18 | Survives Relationship with Provider | `[ ] Yes` `[ ] No` `[ ] Partial` | | §__ |
| R19 | Cryptographic Auth & Communication | `[ ] Yes` `[ ] No` `[ ] Partial` | | §__ |
| R20 | Registry Agnostic | `[ ] Yes` `[ ] No` `[ ] Partial` | | §__ |
| R21 | Legally-Enabled Identity | `[ ] Yes` `[ ] No` `[ ] Partial` | | §__ |
| R22 | Human-Centered Interoperability | `[ ] Yes` `[ ] No` `[ ] Partial` | | §__ |

**Total: __ / 22**

---

## Section 4 — Trust Model

### 4.1 Trust Hierarchy

> How is trust established? What are the trust anchors?

| Field | Value |
|---|---|
| Trust anchor type | `[ ] Blockchain consensus` `[ ] DNS/CA hierarchy` `[ ] Institutional root` `[ ] Peer web-of-trust` `[ ] Self-certifying` `[ ] Other:` |
| Is trust continuous (requires ongoing validation)? | `[ ] Yes` `[ ] No` |
| Is trust contextual (different levels per use case)? | `[ ] Yes` `[ ] No` |
| Is trust composable (multiple trust anchors combinable)? | `[ ] Yes` `[ ] No` |

### 4.2 Trust Models Supported

> Describe each trust model your method supports (e.g., institutional, platform, third-party, self-sovereign).

| Model | Name | Description | Who Operates | Trust Level |
|---|---|---|---|---|
| A | | | | |
| B | | | | |
| C | | | | |

### 4.3 Issuer Trust & Grading

| Field | Value |
|---|---|
| Does the method define issuer trust levels or grades? | `[ ] Yes` `[ ] No` |
| If yes, what criteria determine the grade? | |
| Are there operational restrictions by grade? | |
| Does the issuer DID carry verifiable credentials about itself? | `[ ] Yes` `[ ] No` |

---

## Section 5 — Architectural Rationale

> Why was this method designed this way? What alternatives were considered?

### 5.1 Identifier Design

| Field | Value |
|---|---|
| Identifier type | `[ ] Human-readable alias` `[ ] Key-derived hash` `[ ] UUID` `[ ] Other:` |
| Why this design? | |
| What existing identifier systems does it improve on? | |

### 5.2 Architecture Layers

> Does the method separate identity, keys, and data into distinct layers?

| Layer | What It Stores | Where | Mutability |
|---|---|---|---|
| | | | |
| | | | |
| | | | |

### 5.3 State Model

| Field | Value |
|---|---|
| Resolution model | `[ ] Mutable state (overwrite in place)` `[ ] Append-only DID Log` `[ ] Derived from key` `[ ] Web fetch` `[ ] Other:` |
| Resolution complexity | `[ ] O(1) — constant` `[ ] O(n) — linear in history` `[ ] Other:` |
| On-chain storage size (if applicable) | bytes |

---

## Section 6 — Privacy Architecture

### 6.1 PII Handling

| Field | Value |
|---|---|
| Is PII stored on-chain? | `[ ] None` `[ ] Hashes only` `[ ] Encrypted` `[ ] Plaintext` |
| Where is PII stored? | |
| Is there a documented right-to-erasure mechanism? | `[ ] Yes — describe:` `[ ] No` |

### 6.2 Privacy Features

| Feature | Supported | Mechanism |
|---|---|---|
| Selective disclosure | `[ ] Yes` `[ ] No` | |
| Pairwise / ephemeral DIDs | `[ ] Yes` `[ ] No` | |
| Zero-knowledge proofs | `[ ] Yes` `[ ] No` | |
| Encrypted data vault | `[ ] Yes` `[ ] No` | |
| Blind indexing | `[ ] Yes` `[ ] No` | |
| Correlation mitigation | `[ ] Yes` `[ ] No` | |

### 6.3 Regulatory Compliance Mapping

> For each regulation the method addresses, describe how compliance is achieved.

| Regulation | Country/Region | Addressed | How |
|---|---|---|---|
| GDPR | EU | `[ ] Yes` `[ ] No` `[ ] Partial` | |
| CCPA | USA (California) | `[ ] Yes` `[ ] No` `[ ] Partial` | |
| LGPD | Brazil | `[ ] Yes` `[ ] No` `[ ] Partial` | |
| FATF Travel Rule (R.16) | Global | `[ ] Yes` `[ ] No` `[ ] Partial` | |
| eIDAS 2.0 | EU | `[ ] Yes` `[ ] No` `[ ] Partial` | |
| PCI DSS | Global | `[ ] Yes` `[ ] No` `[ ] Partial` | |
| Other: | | `[ ] Yes` `[ ] No` `[ ] Partial` | |

---

## Section 7 — DID Syntax

| Field | Value |
|---|---|
| ABNF grammar defined? | `[ ] Yes — link:` `[ ] No` |
| Example DID(s) | `did:yourmethod:...` |
| Supports hierarchy / subdomains? | `[ ] Yes — depth:` `[ ] No` |
| Network qualifier support? | `[ ] Yes` `[ ] No` |
| Maximum identifier length | |

---

## Section 8 — DID Document

### 8.1 Verification Methods

| Key Type | Supported | Purpose |
|---|---|---|
| Ed25519 | `[ ] Yes` `[ ] No` | |
| secp256k1 | `[ ] Yes` `[ ] No` | |
| P-256 | `[ ] Yes` `[ ] No` | |
| BLS12-381 | `[ ] Yes` `[ ] No` | |
| ML-DSA (post-quantum) | `[ ] Yes` `[ ] No` `[ ] Planned` | |
| ML-KEM (post-quantum) | `[ ] Yes` `[ ] No` `[ ] Planned` | |
| RSA | `[ ] Yes` `[ ] No` | |
| Other: | `[ ] Yes` `[ ] No` | |

### 8.2 Service Endpoints

| Endpoint Type | Supported | Description |
|---|---|---|
| | | |

### 8.3 Controller Model

| Field | Value |
|---|---|
| Does the DID Document specify controllers? | `[ ] Yes` `[ ] No` |
| Does it support multiple controllers? | `[ ] Yes` `[ ] No` |
| Is there a controller hierarchy (parent controls child)? | `[ ] Yes` `[ ] No` |

**Provide a sample DID Document** (minimal example):

```json

```

---

## Section 9 — CRUD Operations

| Operation | Supported | Mechanism | Spec Section |
|---|---|---|---|
| Create | `[ ] Yes` `[ ] No` | | §__ |
| Read / Resolve | `[ ] Yes` `[ ] No` | | §__ |
| Update | `[ ] Yes` `[ ] No` | | §__ |
| Deactivate | `[ ] Yes` `[ ] No` | | §__ |

### Resolution Details

| Field | Value |
|---|---|
| Resolution algorithm documented? | `[ ] Yes` `[ ] No` |
| Number of RPC/HTTP calls for resolution | |
| Supports versioned resolution (versionId / versionTime)? | `[ ] Yes` `[ ] No` |
| Deactivation detection mechanism | |

---

## Section 10 — On-Chain / Storage Schema (if applicable)

| Field | Value |
|---|---|
| Is there an on-chain data schema? | `[ ] Yes` `[ ] No` `[ ] N/A` |
| Schema version | |
| Schema size (bytes) | |
| Is the schema versioned with migration path? | `[ ] Yes` `[ ] No` |
| Schema documentation link | |

---

## Section 11 — Proof / Attestation Layer (if applicable)

> Does the method have a separate proof or attestation layer beyond the DID Document?

| Field | Value |
|---|---|
| Separate proof layer? | `[ ] Yes — describe:` `[ ] No` |
| Proof layer standard | |
| Issuer-signed attestations? | `[ ] Yes` `[ ] No` |
| On-chain attestation service? | `[ ] Yes — name:` `[ ] No` |

---

## Section 12 — Security Considerations

### 12.1 Threat Model

| Threat | Addressed | Mitigation |
|---|---|---|
| Key compromise | `[ ] Yes` `[ ] No` | |
| DID hijacking | `[ ] Yes` `[ ] No` | |
| Attestation spoofing | `[ ] Yes` `[ ] No` | |
| RPC/resolution trust | `[ ] Yes` `[ ] No` | |
| Subdomain/namespace isolation | `[ ] Yes` `[ ] No` `[ ] N/A` | |
| Quantum computing (Shor/Grover) | `[ ] Yes` `[ ] No` | |

### 12.2 Post-Quantum Migration

| Field | Value |
|---|---|
| PQ migration path defined? | `[ ] Yes` `[ ] No` `[ ] Planned` |
| Target PQ algorithms | |
| Hybrid mode (classical + PQ coexistence)? | `[ ] Yes` `[ ] No` |
| Timeline / trigger for migration | |

### 12.3 Key Recovery

| Field | Value |
|---|---|
| Key recovery mechanism defined? | `[ ] Yes` `[ ] No` |
| Recovery type | `[ ] Social recovery (Shamir)` `[ ] Backup keys` `[ ] Multi-sig threshold` `[ ] Custodial override` `[ ] Other:` |
| Crypto-shredding (permanent erasure via key deletion)? | `[ ] Yes` `[ ] No` |

---

## Section 13 — Interoperability

### 13.1 Standards Bindings

> For each standard your method integrates with, provide the integration level and a link.

<!-- Use IDs from data/standards-catalog.json -->

| Category | Standard | Integration Level | Link / Notes |
|---|---|---|---|
| Core | W3C DID Core v1.1 | `[ ] Full` `[ ] Partial` `[ ] None` | |
| Core | DID Resolution v0.3 | `[ ] Full` `[ ] Partial` `[ ] None` | |
| Core | JSON-LD Context | `[ ] Published` `[ ] Planned` `[ ] None` | URL: |
| Credentials | W3C VC Data Model | `[ ] Full` `[ ] Partial` `[ ] None` | |
| Credentials | SD-JWT | `[ ] Full` `[ ] Partial` `[ ] None` | |
| Credentials | AnonCreds | `[ ] Full` `[ ] Partial` `[ ] None` | |
| Presentation | DIDComm v2 | `[ ] Full` `[ ] Partial` `[ ] None` | |
| Presentation | OID4VP | `[ ] Full` `[ ] Partial` `[ ] None` | |
| Presentation | Presentation Exchange v2 | `[ ] Full` `[ ] Partial` `[ ] None` | |
| Status | Bitstring Status List | `[ ] Full` `[ ] Partial` `[ ] None` | |
| Trust | GLEIF vLEI | `[ ] Full` `[ ] Partial` `[ ] None` | |
| Trust | eIDAS 2.0 | `[ ] Full` `[ ] Partial` `[ ] None` | |
| Other | | `[ ] Full` `[ ] Partial` `[ ] None` | |

### 13.2 Agent Framework Integration

| Framework | Integrated | Driver/Module Link |
|---|---|---|
| DIF Universal Resolver | `[ ] Yes` `[ ] No` `[ ] Planned` | |
| Credo-TS | `[ ] Yes` `[ ] No` `[ ] Planned` | |
| ACA-Py | `[ ] Yes` `[ ] No` `[ ] Planned` | |
| Veramo | `[ ] Yes` `[ ] No` `[ ] Planned` | |
| walt.id | `[ ] Yes` `[ ] No` `[ ] Planned` | |
| SpruceID DIDKit | `[ ] Yes` `[ ] No` `[ ] Planned` | |
| Other: | `[ ] Yes` `[ ] No` `[ ] Planned` | |

### 13.3 DNS Discovery

| Field | Value |
|---|---|
| DNS TXT record discovery supported? | `[ ] Yes` `[ ] No` |
| DNS record format | |

### 13.4 Cross-Method Interoperability

> Can credentials issued by this method be verified by holders/verifiers using other DID methods?

| Field | Value |
|---|---|
| Can a third party verify credentials without method-specific tooling? | `[ ] Yes` `[ ] No` |
| What standard libraries suffice for verification? | |
| Known compatible DID methods | |

---

## Section 14 — References

> List all normative and informative references used by the specification.

| Reference | Standard Body | URL |
|---|---|---|
| | | |
| | | |

---

## Section 15 — Implementation & Testing

| Field | Value |
|---|---|
| Number of known implementations | |
| Reference implementation URL | |
| Test suite URL | |
| Total tests | |
| Test failures | |
| W3C conformance test suite? | `[ ] Yes` `[ ] No` |
| Implementation report URL | |

---

## Section 16 — Governance

| Field | Value |
|---|---|
| Community charter / governance doc? | `[ ] Yes — URL:` `[ ] No` |
| IP affirmation / patent statement? | `[ ] Yes — URL:` `[ ] No` |
| Contribution guide? | `[ ] Yes — URL:` `[ ] No` |
| Discussion forum | |
| Versioning policy | |

---

## Section 17 — Self-Assessment Summary

> This section is auto-computed from Sections 2-14 above. Fill it in as a sanity check.

| Metric | Value |
|---|---|
| W3C Requirements Met | __ / 22 (__ %) |
| CRUD Operations | __ / 4 |
| Primary Focal Use Case | |
| L2 Verticals Targeted | |
| Standards Referenced | |
| Agent Frameworks Integrated | |
| Crypto Algorithms Supported | |
| Privacy Features | __ / 6 |
| Security Threats Addressed | __ / 6 |
| Known Implementations | |
| Spec Status | Draft / Provisional / Registered |
| Repo Active | Yes / No |

---

*Checklist version 1.0.0 — [did-method-checklist](https://github.com/Attestto-com/did-method-checklist)*
*Published under the [W3C Software and Document License](https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document).*
