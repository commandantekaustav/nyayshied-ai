import { ClaimAnalysisResponse } from '../types/claim';
import { GOLDEN_CASE_DATA } from '../data/goldenCase';

const API_BASE_URL = 'http://localhost:8000';

export async function analyzeClaimAPI(
  deviceImageFile: File | null,
  invoiceFile: File | null,
  walkInQuoteInr: number,
  useGoldenCase: boolean = false
): Promise<ClaimAnalysisResponse> {
  // If user requested Golden Case, or if no custom image was uploaded, return instant high-fidelity Golden Case
  if (useGoldenCase || !deviceImageFile) {
    console.info('⚡ Using Golden Case #001 offline engine.');
    // Dynamic recalculation for quote input
    const fairCost = 2500;
    const multiplier = Number((walkInQuoteInr / fairCost).toFixed(2));
    const excess = Math.max(0, walkInQuoteInr - fairCost);

    return {
      ...GOLDEN_CASE_DATA,
      pricing: {
        ...GOLDEN_CASE_DATA.pricing,
        walk_in_quote_inr: walkInQuoteInr,
        price_gouging_multiplier: multiplier,
        excess_unjustified_inr: excess,
        gouging_severity: multiplier >= 3.5 ? 'EXTREME_GOUGING' : multiplier >= 2.0 ? 'SIGNIFICANT_GOUGING' : 'MODERATE_MARKUP',
      },
    };
  }

  // Live Backend Call
  try {
    const formData = new FormData();
    formData.append('device_image', deviceImageFile);
    if (invoiceFile) {
      formData.append('invoice_file', invoiceFile);
    }
    formData.append('walk_in_quote_inr', walkInQuoteInr.toString());

    const url = `${API_BASE_URL}/api/analyze-claim?use_golden_case=${useGoldenCase ? 'true' : 'false'}`;
    
    // 8-second timeout for responsive UX
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const data: ClaimAnalysisResponse = await response.json();
    return data;
  } catch (error) {
    console.warn('Backend call failed or unreachable, falling back to local Golden Case #001:', error);
    // Dynamic fallback with custom quote
    const fairCost = 2500;
    const multiplier = Number((walkInQuoteInr / fairCost).toFixed(2));
    const excess = Math.max(0, walkInQuoteInr - fairCost);

    return {
      ...GOLDEN_CASE_DATA,
      pricing: {
        ...GOLDEN_CASE_DATA.pricing,
        walk_in_quote_inr: walkInQuoteInr,
        price_gouging_multiplier: multiplier,
        excess_unjustified_inr: excess,
        gouging_severity: multiplier >= 3.5 ? 'EXTREME_GOUGING' : 'SIGNIFICANT_GOUGING',
      },
    };
  }
}
