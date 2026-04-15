Using the context already loaded, analyze the following DID method specification and produce a structured self-assessment JSON.

## Instructions

1. Read the specification carefully.
2. For each requirement (R1-R22), determine the status based ONLY on what the spec explicitly states.
3. For each feature and crypto algorithm, mark true/false/null based on spec evidence.
4. Be conservative: if the spec is silent on a topic, use "not-assessed" or null — never assume.
5. Include a brief "approach" description and link to the relevant spec section as "evidence".

## Output Format

Return ONLY valid JSON matching this schema:

```json
{
  "method": "did:example",
  "specUrl": "https://...",
  "repoUrl": "https://github.com/...",
  "blockchain": "Chain name or null",
  "registryType": "blockchain | web | peer | ledger | generative | hybrid | other",
  "assessed": true,
  "requirements": {
    "R1": {
      "status": "met | partial | not-met | not-applicable | not-assessed",
      "approach": "Brief description of how this is addressed",
      "evidence": "URL to relevant spec section",
      "verified": false
    }
  },
  "feat": {
    "create": true | false | null,
    "read": true | false | null,
    "update": true | false | null,
    "deactivate": true | false | null,
    "keyRotation": true | false | null,
    "didLog": true | false | null,
    "recovery": true | false | null,
    "multiSig": true | false | null,
    "vc": true | false | null,
    "sd": true | false | null,
    "didcomm": true | false | null,
    "resolver": true | false | null,
    "jsonld": true | false | null,
    "privacy": true | false | null
  },
  "crypto": {
    "ed25519": true | false | null,
    "secp256k1": true | false | null,
    "p256": true | false | null,
    "bls": true | false | null,
    "pq": true | false | null
  },
  "submittedBy": { "name": "LLM-assisted assessment" },
  "submittedAt": "ISO-8601 timestamp"
}
```

Include ALL 22 requirements (R1-R22) in the output, even those marked "not-assessed".

## Important

- Mark `"verified": false` on all requirements — this is an LLM-assisted draft, not a verified assessment.
- Do not invent capabilities. If the spec is unclear, use "not-assessed" or null.
- Include the spec section URL in "evidence" whenever possible.

## File Output

If running in Claude Code, save the output to:
`public/data/assessments/{method-name}.json`

## Specification to Assess

[PASTE YOUR SPEC URL OR TEXT HERE]
