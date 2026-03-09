"""
5-pass Claude AI pipeline for resume generation.
Each pass is an async httpx call via the Anthropic AsyncAnthropic client.
"""
import asyncio
import json
import logging

import anthropic
from django.conf import settings

logger = logging.getLogger(__name__)

# ── Prompts ───────────────────────────────────────────────────────────────────

PASS1_SYSTEM = (
    "Given this professional profile JSON and job description, rewrite the resume tailored to the JD. "
    "Emphasize matching skills, rewrite bullets with metrics where possible. "
    "Return JSON only with this exact structure: "
    "{ \"name\": \"from profile\", \"headline\": \"from profile\", "
    "\"contact\": {\"email\": \"\", \"phone\": \"\", \"location\": \"\", \"linkedin\": \"\", \"github\": \"\"}, "
    "\"summary\": \"\", "
    "\"experience\": [{\"company\": \"\", \"title\": \"\", \"dates\": \"\", \"bullets\": []}], "
    "\"education\": [{\"school\": \"\", \"degree\": \"\", \"dates\": \"\"}], "
    "\"skills\": [] }. "
    "Copy name, headline, and contact exactly from the profile — do not modify them."
)

PASS2_SYSTEM = (
    "Optimize this resume JSON for ATS systems. Match keyword density to the JD, "
    "use standard section headers, remove any formatting ATS can't parse. "
    "Preserve the name, headline, and contact fields exactly as-is. "
    "Return same JSON structure."
)

PASS3_SYSTEM = (
    "Rewrite this resume at humanization level {level}/5. "
    "1 = formal/corporate, 5 = natural/conversational with varied sentence structure. "
    "Preserve the name, headline, and contact fields exactly as-is. "
    "Return same JSON structure."
)

PASS4_SYSTEM = (
    "Add subtle strategic imperfections to make this resume appear hand-written. "
    "Vary one date format slightly, soften one bullet, add one slightly informal phrase. "
    "Do not make it worse — just less AI-perfect. "
    "Preserve the name, headline, and contact fields exactly as-is. "
    "Return same JSON structure."
)

PASS5_SYSTEM = (
    "Given this resume and the original job description, return JSON only: "
    "{ ats_score: 0-100, human_score: 0-100, keyword_match: 0-100 }"
)

# ── Helpers ───────────────────────────────────────────────────────────────────

def _strip_fences(text: str) -> str:
    text = text.strip()
    if text.startswith('```'):
        text = text.split('\n', 1)[1] if '\n' in text else text[3:]
        text = text.rsplit('```', 1)[0].strip()
    return text


async def _claude(client: anthropic.AsyncAnthropic, system: str, content: str, max_tokens: int = 4096) -> dict:
    message = await client.messages.create(
        model='claude-sonnet-4-6',
        max_tokens=max_tokens,
        system=system,
        messages=[{'role': 'user', 'content': content}],
    )
    return json.loads(_strip_fences(message.content[0].text))


# ── Pipeline ──────────────────────────────────────────────────────────────────

async def _pipeline_async(
    profile_data: dict,
    job_description: str,
    humanization_level: int,
    imperfection_mode: bool,
) -> tuple[dict, dict]:
    client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

    # Pass 1 — Generate
    logger.info('Pipeline pass 1: generate')
    resume = await _claude(
        client, PASS1_SYSTEM,
        f"Profile:\n{json.dumps(profile_data)}\n\nJob Description:\n{job_description}",
    )

    # Pass 2 — ATS Optimize
    logger.info('Pipeline pass 2: ATS optimize')
    resume = await _claude(
        client, PASS2_SYSTEM,
        f"Resume:\n{json.dumps(resume)}\n\nJob Description:\n{job_description}",
    )

    # Pass 3 — Humanize
    logger.info('Pipeline pass 3: humanize (level %s)', humanization_level)
    resume = await _claude(
        client,
        PASS3_SYSTEM.format(level=humanization_level),
        json.dumps(resume),
    )

    # Pass 4 — Imperfection (optional)
    if imperfection_mode:
        logger.info('Pipeline pass 4: imperfection mode')
        resume = await _claude(client, PASS4_SYSTEM, json.dumps(resume))

    # Pass 5 — Score
    logger.info('Pipeline pass 5: scoring')
    scores = await _claude(
        client, PASS5_SYSTEM,
        f"Resume:\n{json.dumps(resume)}\n\nJob Description:\n{job_description}",
        max_tokens=256,
    )

    # Always guarantee header fields from profile (handles null, missing, or empty values)
    if not resume.get('name'):
        resume['name'] = profile_data.get('name', '')
    if not resume.get('headline'):
        resume['headline'] = profile_data.get('headline', '')
    if not resume.get('contact') or not any(resume['contact'].values()):
        resume['contact'] = profile_data.get('contact', {})

    return resume, scores


def run_pipeline(
    profile_data: dict,
    job_description: str,
    humanization_level: int,
    imperfection_mode: bool,
) -> tuple[dict, dict]:
    """Sync entry point — runs the async pipeline in a new event loop."""
    return asyncio.run(_pipeline_async(profile_data, job_description, humanization_level, imperfection_mode))
