# THis is AI Generated Code.

import re
from typing import List, Optional, Dict, Pattern
from dataclasses import dataclass


@dataclass
class MarkdownImage:
    alt: str
    url: str
    title: Optional[str] = None
    raw: Optional[str] = None


class MarkdownImageExtractor:
    """
    Utility class for extracting and manipulating images from Markdown content.
    """

    # Inline image: ![alt](url "title")
    INLINE_IMG_PATTERN: Pattern = re.compile(
        r'!\[(?P<alt>[^\]]*)\]\(\s*(?P<url>[^)\s]+)(?:\s+"(?P<title>[^"]*)")?\s*\)'
    )

    # Reference image: ![alt][id]
    REF_IMG_PATTERN: Pattern = re.compile(
        r'!\[(?P<alt>[^\]]*)\]\[(?P<id>[^\]]+)\]'
    )

    # Reference definition: [id]: url "title"
    REF_DEF_PATTERN: Pattern = re.compile(
        r'^\[(?P<id>[^\]]+)\]:\s*(?P<url>\S+)(?:\s+"(?P<title>[^"]*)")?',
        re.MULTILINE
    )

    def __init__(self, markdown: str):
        self.markdown = markdown
        self._ref_map = self._parse_reference_definitions()

    # -------------------------
    # Core parsing
    # -------------------------

    def set_markdown(self, markdown: str) -> None:
        """Set the Markdown content."""
        self.markdown = markdown

    def _parse_reference_definitions(self) -> Dict[str, Dict]:
        """Parse reference-style image definitions."""
        ref_map = {}
        for match in self.REF_DEF_PATTERN.finditer(self.markdown):
            ref_id = match.group("id").strip()
            ref_map[ref_id] = {
                "url": match.group("url"),
                "title": match.group("title"),
            }
        return ref_map

    # -------------------------
    # Extraction methods
    # -------------------------

    def extract_all_images(self) -> List[MarkdownImage]:
        """Extract all images (inline + reference)."""
        images = []

        # Inline images
        for match in self.INLINE_IMG_PATTERN.finditer(self.markdown):
            images.append(
                MarkdownImage(
                    alt=match.group("alt"),
                    url=match.group("url"),
                    title=match.group("title"),
                    raw=match.group(0),
                )
            )

        # Reference images
        for match in self.REF_IMG_PATTERN.finditer(self.markdown):
            ref_id = match.group("id").strip()
            ref_data = self._ref_map.get(ref_id)

            if ref_data:
                images.append(
                    MarkdownImage(
                        alt=match.group("alt"),
                        url=ref_data["url"],
                        title=ref_data.get("title"),
                        raw=match.group(0),
                    )
                )

        return images

    # -------------------------
    # Filtering methods
    # -------------------------

    def find_by_alt_exact(self, alt_text: str) -> List[MarkdownImage]:
        return [
            img for img in self.extract_all_images()
            if img.alt == alt_text
        ]

    def find_by_alt_contains(self, keyword: str) -> List[MarkdownImage]:
        return [
            img for img in self.extract_all_images()
            if keyword.lower() in img.alt.lower()
        ]

    def find_by_alt_regex(self, pattern: str) -> List[MarkdownImage]:
        regex = re.compile(pattern)
        return [
            img for img in self.extract_all_images()
            if regex.search(img.alt)
        ]

    # -------------------------
    # Utility methods
    # -------------------------

    def get_all_urls(self) -> List[str]:
        return [img.url for img in self.extract_all_images()]

    def deduplicate_images(self) -> List[MarkdownImage]:
        seen = set()
        unique = []

        for img in self.extract_all_images():
            if img.url not in seen:
                seen.add(img.url)
                unique.append(img)

        return unique

    def replace_image_url(self, old_url: str, new_url: str) -> str:
        """Replace all occurrences of an image URL."""
        return self.markdown.replace(old_url, new_url)

    def remove_images(self) -> str:
        """Remove all image markdown."""
        content = self.INLINE_IMG_PATTERN.sub('', self.markdown)
        content = self.REF_IMG_PATTERN.sub('', content)
        return content

    def to_dict(self) -> List[Dict]:
        """Convert extracted images to dictionaries."""
        return [
            {
                "alt": img.alt,
                "url": img.url,
                "title": img.title
            }
            for img in self.extract_all_images()
        ]