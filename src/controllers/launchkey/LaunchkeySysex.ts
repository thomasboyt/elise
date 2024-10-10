// https://fael-downloads-prod.focusrite.com/customer/prod/downloads/launchkey_mk4_programmer_s_reference_guide_v2_en.pdf
// https://fael-downloads-prod.focusrite.com/customer/prod/downloads/launchkey_mk4_mini_37_user_guide_v1.1_pdf-en.pdf
// https://fael-downloads-prod.focusrite.com/customer/prod/downloads/launchkey_mk4_49_user_guide_v1.1_pdf-en.pdf

import { getSysExPrefix, LaunchkeySkuType } from './LaunchkeyConstants';

function textToAscii(text: string): number[] {
  const ascii = [];
  for (let charIdx = 0; charIdx < text.length; charIdx += 1) {
    ascii.push(text.charCodeAt(charIdx));
  }
  return ascii;
}

export const launchkeySysexMessageFactories = {
  enableDawMode() {
    return [159, 12, 127];
  },
  disableDawMode() {
    return [159, 12, 0];
  },
  setRgb(
    sku: LaunchkeySkuType,
    padId: number,
    r: number,
    g: number,
    b: number,
  ) {
    // Page 16: RGB colour
    return [...getSysExPrefix(sku), 1, 67, padId, r, g, b, 247];
  },
  configureDisplay(sku: LaunchkeySkuType, target: number, config: number) {
    // Page 17: Setting displays
    // Page 18: Config
    // F0h 00h 20h 29h 02h 14h 04h <target> <config> F7h
    return [...getSysExPrefix(sku), 4, target, config, 247];
  },
  setDisplayText(
    sku: LaunchkeySkuType,
    target: number,
    field: number,
    text: string,
  ) {
    // Page 19: Setting text
    // F0h 00h 20h 29h 02h 14h 06h <target> <field> <text…> F7h
    const textAsciiValues = textToAscii(text);
    return [...getSysExPrefix(sku), 6, target, field, ...textAsciiValues, 247];
  },
  setDisplayBitmap(sku: LaunchkeySkuType, target: number, bitmapData: number) {
    // Page 20: Bitmap
    return [...getSysExPrefix(sku), 9, target, bitmapData, 127];
  },
};
