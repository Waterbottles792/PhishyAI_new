"""QR code decoder for extracting data from QR code images."""

import logging
from typing import List, Optional
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class QRDecodeResult:
    """Result of QR code decoding."""
    data: str
    type: str  # "url", "text", "other"
    raw_bytes: Optional[bytes] = None


def decode_qr_image(image_bytes: bytes) -> List[QRDecodeResult]:
    """
    Decode QR codes from image bytes.

    Uses pyzbar + Pillow to decode QR codes.

    Args:
        image_bytes: Raw image file bytes

    Returns:
        List of decoded QR code results
    """
    try:
        from PIL import Image
        from pyzbar.pyzbar import decode
        import io

        image = Image.open(io.BytesIO(image_bytes))

        # Convert to RGB if needed (pyzbar works best with RGB/grayscale)
        if image.mode not in ("RGB", "L"):
            image = image.convert("RGB")

        decoded_objects = decode(image)

        results = []
        for obj in decoded_objects:
            data = obj.data.decode("utf-8", errors="replace")
            # Determine type
            data_lower = data.lower().strip()
            if data_lower.startswith(("http://", "https://", "www.")):
                qr_type = "url"
            else:
                qr_type = "text"

            results.append(QRDecodeResult(
                data=data,
                type=qr_type,
                raw_bytes=obj.data,
            ))

        return results

    except ImportError as e:
        logger.error(f"Required package not installed: {e}. Install pyzbar and Pillow.")
        raise RuntimeError(
            "QR decoding requires pyzbar and Pillow. "
            "Install with: pip install pyzbar Pillow  "
            "Also install system lib: sudo apt-get install libzbar0"
        )
    except Exception as e:
        logger.error(f"QR decoding failed: {e}")
        raise
