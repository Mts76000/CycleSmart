"use client";

import Script from "next/script";

export function BuyMeACoffeeButton() {
  return (
    <Script
      src="https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js"
      strategy="lazyOnload"
      data-name="bmc-button"
      data-slug="mlamote"
      data-color="#FFDD00"
      data-emoji=""
      data-font="Cookie"
      data-text="Buy me a coffee"
      data-outline-color="#000000"
      data-font-color="#000000"
      data-coffee-color="#ffffff"
    />
  );
}
