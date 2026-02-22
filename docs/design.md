# Design

## Goal in one sentence

AI-powered tool that compares an alcohol label image against its application data and returns field-by-field match/mismatch results in under 5 seconds.

## Goal in a few sentences

- TTB agents review ~150,000 alcohol label applications per year. 
- Each review is largely manual: an agent visually compares a label image against application data to verify that fields match. 
- A simple review takes 5–10 minutes, and agents spend roughly half their day on what is essentially data entry verification.
- This prototype automates the comparison — upload a label image, provide the application data, get back match/mismatch results per field in under 5 seconds.

## Requirements

- **Under 5 seconds end-to-end** (🟢 REQUIRED FOR MVP)
  
    - A previous scanning vendor pilot was abandoned at 30–40 seconds per label.
    - *"If we can't get results back in about 5 seconds, nobody's going to use it."*
    
- **Usable by non-technical staff** (🟢 REQUIRED FOR MVP)
    - Half the review team is over 50. Large targets, high contrast, obvious flow.
    - *"We need something my mother could figure out—she's 73 and just learned to video call her grandkids last year, if that gives you a benchmark. Half our team is over 50. Clean, obvious, no hunting for buttons."*
    
- **Strict matching for the government warning** (🟢 REQUIRED FOR MVP)
    - Legally mandated exact text. "GOVERNMENT WARNING" must be all caps and bold. Character-level verification.
    - *"The warning statement check is actually trickier than it sounds. It has to be exact. Like, word-for-word, and the 'GOVERNMENT WARNING:' part has to be in all caps and bold."*
    
- **Fuzzy matching for subjective fields** (🟢 REQUIRED FOR MVP)
  
    - Brand names need case- and whitespace-insensitive comparison. Flag formatting differences, don't reject.
    - *"The thing about label review is there's nuance. You can't just pattern match everything. Like, I had one last week where the brand name was 'STONE'S THROW' on the label but 'Stone's Throw' in the application. Technically a mismatch? Sure. But it's obviously the same thing. You need judgment."*
    
- **Batch upload support** (🔵 FUTURE ITERATION)
    - Importers submit 200–300 labels at once.
    - *"If there was some way to handle batch uploads, that would be huge. Janet from our Seattle office has been asking about this for years."*
    
- **Works within network constraints** (🔵 FUTURE ITERATION)
    - Ensure that all endpoints and services cooperate with network firewall.
    - *"Our network blocks outbound traffic to a lot of domains, so keep that in mind if you're thinking about cloud APIs."*
    
- **Robust image handling** (🔵 FUTURE ITERATION)
    - Support text extraction from imperfect photos.
    - *"It would be amazing if the tool could handle images that aren't perfectly shot. I've seen labels that are photographed at weird angles, or the lighting is bad, or there's glare on the bottle. Right now if an agent can't read the label they just reject it and ask for a better image."*
    
    ## Assumptions
    
    - Application data is already available (from the COLA system or pre-entered). The prototype does not include a data-entry form nor an option to upload an image.
    - It's okay that it's not within the TTB network. The prototype runs externally on Vercel, outside TTB's network. Firewall restrictions apply to their production network, not to this deployment. Production path would use Azure OpenAI Service within TTB's existing Azure perimeter.
    - No integration with the COLA system.
    - Should match TTB's design and aesthetic.
    - A divese set of 10 alcohol label applications is okay for the MVP.
    - It's okay that it was only tested on the latest version of Google Chrome and Safari on a desktop (no mobile testing).
    - The site is publicly accessible with no login gate. An alert has been configured on the Anthropic API to flag unexpected volume spikes.

## Decisions

### Label Extraction Solutions Considered

| Solution | Pros | Cons | Estimated Latency |
|---|---|---|---|
| **Cloud Vision LLM** | Single API call does extraction, semantic understanding, and returns structured fields. | Potentially not "smart" enough; a lack of ability to deal with edge cases. | ~2–4s |
| **Cloud OCR + Cloud LLM call** | Separate API calls (OCR followed by LLM to understand) means more control | Takes longer, could be overengineered. | 3–6s (combined) |
| **Self-hosted Vision LLM** | No cloud dependency. Same single-call extraction + understanding as cloud vision. No per-request API cost. | Requires GPU infrastructure (A100-class). Large model weights (7B–72B params). Ops burden: updates, scaling, uptime. Slower than cloud APIs without high-end hardware. | 3–10s (hardware-dependent) |
| **Region detection + per-field verification** | Crop label into regions (warning, brand, ABV, etc.) first, then run targeted checks on each crop. Could improve accuracy by isolating each field. | Adds a detection step — need object detection or a first-pass vision call to locate regions. Multiple downstream calls (one per field) multiply latency. More failure modes (mis-crop cascades) and more complexity. | 4–9s (detection + N field calls) |

**Chosen: Cloud Vision LLM.** It's the solution most likely to meet the <5 second requirement and has the lowest complexity.

- If accuracy problems, region detection + per field verification is recommended next.
- If latency problems, resizing/compressing images before upload is recommended next.

### Cloud Vision Model Comparison

| Model | Input $/1M | Output $/1M | TTFT | Output Speed | Vision (DocVQA) |
|---|---|---|---|---|---|
| **Claude Haiku 4.5** | $1.00 | $5.00 | 0.53s | 110.6 tok/s | — |
| **Claude Sonnet 4.6** | $3.00 | $15.00 | 0.66s | 59.6 tok/s | 93.4% |
| **Claude Opus 4.6** | $5.00 | $25.00 | 1.73s | 72.5 tok/s | 93.0% |
| **GPT-5 Nano** | $0.05 | $0.40 | ~98s (reasoning) | — | — |
| **GPT-5.2** | $1.75 | $14.00 | Sub-second | 36.5 tok/s | 86.5% (MMMU) |

**Chosen: Claude 4.5 Haiku.** Without knowing much yet about the nuances of label identification, I (perhaps naïvely) expect all models to be able to do the job. Since Haiku is the fastest, it was chosen.

### Tech Stack Chosen

**Stack:** Next.js (App Router) + TypeScript, Tailwind CSS + shadcn/ui, deployed to Vercel.

**Rationale**:

- I am familiar with the Next.js, TypeScript, and Tailwind stack and there is ample LLM training data on these technologies.
- Vercel was chosen over Railway, AWS, and other deployment platforms because of its smooth developer experience and speed to delivery.
- Theme is based on TTB.gov's use of the [U.S. Web Design System (USWDS)](https://designsystem.digital.gov/). See [theme.md](theme.md) for full color/typography reference and shadcn/ui token mapping.

**Code Quality Guardrails**:

AI-assisted development can introduce subtle architectural drift, unused code, and inconsistent patterns. To maintain code quality as the codebase evolves, a 10-check static analysis system runs automatically on every commit (via pre-commit hook) and in CI. Checks include type safety, linting, dependency boundaries, dead code detection, copy-paste detection, and design guard validation. Design guards are structured comments at the top of each module that declare its role, boundaries, and invariants — giving both human reviewers and AI agents clear constraints on what a module should and should not do. See [agent-guards.md](agent-guards.md) for the full specification.
