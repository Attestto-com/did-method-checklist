Using the context already loaded, produce a structured side-by-side comparison of the following DID method specifications. Help decision-makers choose the right method for their use case.

## Instructions

1. Read each specification carefully.
2. Compare across all dimensions below.
3. Do NOT declare a "winner" — present facts and let the reader decide.
4. Note where a method is silent on a topic (mark as "Not specified").

## Comparison Dimensions

### Architecture
- Registry type, underlying infrastructure, trust model, decentralization level

### CRUD Operations
- Create (cost, latency), Read (latency, offline capable), Update (mechanism), Deactivate (reversible?)

### Cryptography
- Supported algorithms, key formats, rotation mechanism, PQ readiness, multi-sig

### Privacy
- On-chain data exposure, correlation resistance, selective disclosure, resolution privacy

### Verifiable Credentials
- VC issuance/verification, SD-JWT, BBS+/ZKP, status list/revocation

### Interoperability
- DIDComm v2, Universal Resolver driver, cross-method bridges, framework support

### Operational
- Cost per DID, resolution latency, infrastructure requirements, implementations, test suite

## Output Format

```markdown
# DID Method Comparison: did:X vs did:Y

## Executive Summary
[3-5 sentences highlighting key differences and when you'd choose each]

## Comparison Matrix

| Dimension | did:X | did:Y |
|-----------|-------|-------|
| Registry Type | ... | ... |
| Trust Model | ... | ... |
| Create Cost | ... | ... |
| Resolution Latency | ... | ... |
| Key Rotation | ... | ... |
| PQ Ready | ... | ... |
| VC Support | ... | ... |
| DIDComm | ... | ... |
| Implementations | ... | ... |
| Production Use | ... | ... |

## Detailed Analysis
[Per-dimension side-by-side]

## Use Case Fit

| Use Case | did:X | did:Y | Notes |
|----------|-------|-------|-------|
| Enterprise Identity | Good/Partial/Poor | ... | ... |
| Education Credentials | ... | ... | ... |
| Healthcare | ... | ... | ... |
| IoT Devices | ... | ... | ... |
| Cross-border Finance | ... | ... | ... |

## Trade-offs Summary
[What you gain and lose with each choice]
```

## Important

- Present FACTS, not opinions. Do not recommend one over the other.
- If a method doesn't address a dimension, say "Not specified".
- Cite spec sections where possible.

## File Output

If running in Claude Code, save the output to:
`docs/analyses/{method-a}-vs-{method-b}-comparison.md`

## Specifications to Compare

[PASTE SPEC URLS OR TEXT FOR EACH METHOD HERE]
