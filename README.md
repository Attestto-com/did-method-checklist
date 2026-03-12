# DID Method Checklist

**A structured evaluation framework for W3C Decentralized Identifier method specifications.**

DID method specs are protocols — they declare what use cases they serve, what standards they bind to, and what schemas and logic implement each requirement. This checklist provides a common structure for authors to document their method and for reviewers to evaluate completeness, coverage gaps, and interoperability posture.

## The Problem

The [W3C DID Spec Registries](https://www.w3.org/TR/did-spec-registries/) lists 200+ DID methods. Most entries contain only a method name and a link to a spec — no standardized metadata, no coverage mapping, no way to compare methods by use case, industry, or feature set. Many specs are incomplete, abandoned, or redundant.

There is no common framework for answering:
- What focal use cases does this method actually serve?
- Which W3C requirements does it satisfy, and how?
- What standards does it bind to for each capability?
- What industries or regulatory regimes is it designed for?
- How does it interoperate with other methods and agent frameworks?
- Is it actively maintained? Is the spec live? Is there a reference implementation?

## The Solution

This checklist defines a **standard submission form** that any DID method author fills out. The result is a structured, machine-readable profile that enables:

1. **Apples-to-apples comparison** across methods
2. **Use-case filtering** — find methods that serve your industry or regulatory context
3. **Gap analysis** — see which W3C requirements a method does NOT satisfy
4. **Interoperability mapping** — understand which agent frameworks, credential formats, and protocols a method supports
5. **Health signals** — repo activity, spec liveness, implementation count, test coverage

## How It Works

A DID method specification is analogous to a **protocol interface**:

```
┌─────────────────────────────────────────────────────┐
│  DID Method Spec = Protocol Definition              │
│                                                     │
│  Focal Use Case(s)  →  Problem domain & users       │
│  Requirements        →  Interface contract (R1–R22) │
│  Standards Bindings  →  Protocol implementations    │
│  Schemas & Logic     →  Custom per method           │
│  Interop Surface     →  What it connects to         │
└─────────────────────────────────────────────────────┘
```

Two methods can serve entirely different use cases (supply chain vs. financial identity) while sharing the same evaluation structure. The checklist makes coverage explicit and gaps visible.

## Repository Structure

```
did-method-checklist/
├── README.md                     # This file
├── checklist.md                  # The full submission questionnaire
├── schema/
│   ├── method-profile.schema.json  # JSON Schema for machine-readable profiles
│   ├── requirements.json           # W3C R1–R22 requirement definitions
│   ├── use-cases.json              # Focal + non-focal use case definitions
│   └── standards-catalog.json      # Known standards a method can bind to
├── examples/
│   └── did-sns.md                  # Reference submission (first completed checklist)
└── scripts/
    └── validate-submission.mjs     # Validates a completed checklist against schema
```

## How to Use

### For Method Authors

1. Fork this repo
2. Copy `checklist.md` → `submissions/did-yourmethod.md`
3. Fill out every section — use `N/A` for sections that genuinely don't apply, with a brief explanation
4. Submit a PR

### For Reviewers & Registries

1. Use the checklist to evaluate submission completeness
2. Run `node scripts/validate-submission.mjs submissions/did-yourmethod.md` to check coverage
3. Compare profiles using the standardized property set

### For the V2 Index

Completed checklists are compiled into a unified, filterable index where methods can be compared by:
- Focal use case or industry (Enterprise, Healthcare, Education, Legal, Finance, Communication)
- W3C requirement coverage (R1–R22)
- Feature set (key rotation, selective disclosure, DIDComm, etc.)
- Blockchain / registry type
- Crypto support (Ed25519, secp256k1, post-quantum, etc.)
- Health signals (active repo, live spec, implementation count)

## Data Sources

This framework was built by analyzing 199 DID methods from the W3C DID Spec Registries:
- 22 W3C requirements mapped per method
- 6 focal use cases + 12 non-focal use cases with per-method scoring
- Feature flags, crypto support, repo metadata, and benefit alignment extracted from specs and GitHub repos
- Reference implementation: [`did:sns`](https://github.com/Attestto-com/did-sns-spec) (first method to complete the full checklist)

## Contact

| Channel | Address |
|---|---|
| Author | Eduardo Chongkan ([@chongkan](https://github.com/chongkan)) |
| Standards Group | [standards@attestto.com](mailto:standards@attestto.com) |
| Website | [attestto.com](https://attestto.com) |

## License

Published under the [W3C Software and Document License](https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document).
