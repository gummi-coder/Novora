from dataclasses import dataclass

@dataclass
class PrivacyRules:
    min_n: int = 5
    min_segment_n: int = 5

RULES = PrivacyRules()
