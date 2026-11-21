import io
import logging
from typing import List, Optional, Tuple

from PIL import Image, ImageDraw, ImageEnhance, ImageOps

logger = logging.getLogger("nyayshield.vision.image_prep")


def extract_dual_views(
    image_bytes: bytes,
    mime_type: str = "image/jpeg",
    user_annotation: Optional[List[int]] = None,
) -> Tuple[bytes, str, Optional[bytes]]:
    """
    Single-Call Dual-Image Preprocessor:
    1. Applies EXIF orientation transposition (ImageOps.exif_transpose) so pixel coordinates
       match the browser canvas 1:1.
    2. When user_annotation [ymin, xmin, ymax, xmax] (0-1000) is present:
       - Extracts an UNMARKED 20%-padded native-resolution macro crop from native_img.
       - Applies ImageOps.autocontrast + ImageEnhance.Sharpness(1.4) on the macro crop ONLY
         to accentuate fine fracture physics (stress whitening, boss shear, micro-cracks).
       - Resizes an overview copy to max 1600px and flattens a 4px #EF4444 red reticle
         onto the overview copy for global chassis context.
    Returns: (overview_bytes, overview_mime, macro_crop_bytes_or_none)
    """
    try:
        with Image.open(io.BytesIO(image_bytes)) as img:
            native_img = ImageOps.exif_transpose(img)
            if native_img.mode != "RGB":
                native_img = native_img.convert("RGB")

            nat_w, nat_h = native_img.size
            if nat_w <= 2 or nat_h <= 2:
                out = io.BytesIO()
                native_img.save(out, format="JPEG", quality=92)
                return out.getvalue(), "image/jpeg", None

            macro_crop_bytes: Optional[bytes] = None
            if user_annotation and len(user_annotation) == 4:
                ymin, xmin, ymax, xmax = user_annotation
                cy1 = max(0, min(nat_h - 1, int(round((ymin / 1000.0) * nat_h))))
                cx1 = max(0, min(nat_w - 1, int(round((xmin / 1000.0) * nat_w))))
                cy2 = max(cy1 + 2, min(nat_h, int(round((ymax / 1000.0) * nat_h))))
                cx2 = max(cx1 + 2, min(nat_w, int(round((xmax / 1000.0) * nat_w))))

                pad_y = int(round((cy2 - cy1) * 0.20))
                pad_x = int(round((cx2 - cx1) * 0.20))

                crop_box = (
                    max(0, cx1 - pad_x),
                    max(0, cy1 - pad_y),
                    min(nat_w, cx2 + pad_x),
                    min(nat_h, cy2 + pad_y),
                )
                macro_img = native_img.crop(crop_box)
                # Macro-only optical enhancement: preserve global overview colors untouched
                macro_img = ImageOps.autocontrast(macro_img, cutoff=1)
                macro_img = ImageEnhance.Sharpness(macro_img).enhance(1.4)

                macro_buf = io.BytesIO()
                macro_img.save(macro_buf, format="JPEG", quality=95)
                macro_crop_bytes = macro_buf.getvalue()

            overview_img = native_img.copy()
            max_dim = max(nat_w, nat_h)
            if max_dim > 1600:
                scale = 1600.0 / max_dim
                new_size = (max(1, int(round(nat_w * scale))), max(1, int(round(nat_h * scale))))
                overview_img = overview_img.resize(new_size, Image.Resampling.LANCZOS)

            ov_w, ov_h = overview_img.size
            if user_annotation and len(user_annotation) == 4:
                ymin, xmin, ymax, xmax = user_annotation
                x0 = max(0, min(ov_w - 1, int(round((xmin / 1000.0) * ov_w))))
                y0 = max(0, min(ov_h - 1, int(round((ymin / 1000.0) * ov_h))))
                x1 = max(x0 + 2, min(ov_w - 1, int(round((xmax / 1000.0) * ov_w))))
                y1 = max(y0 + 2, min(ov_h - 1, int(round((ymax / 1000.0) * ov_h))))
                draw = ImageDraw.Draw(overview_img)
                draw.rectangle([x0, y0, x1, y1], outline="#EF4444", width=4)

            out = io.BytesIO()
            overview_img.save(out, format="JPEG", quality=92)
            return out.getvalue(), "image/jpeg", macro_crop_bytes
    except Exception as e:
        logger.debug(f"Image preprocessing skipped ({e}); sending original bytes.")
        return image_bytes, mime_type, None
