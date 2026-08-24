const cookieName = "ab_home_layout_v1"
const searchParams = new URLSearchParams(location.search)
const forced = searchParams.get("variant")?.toUpperCase()
const isForced = forced === "A" || forced === "B"
const isDebug = searchParams.get("ab_debug") === "1"
const isProduction = location.hostname === "bogeun.pages.dev"
const isPreview = !isDebug && (isForced || !isProduction)
const cookieVariant = document.cookie
  .split(";")
  .map((value) => value.trim())
  .find((value) => value.startsWith(cookieName + "="))
  ?.split("=")[1]
const variant: "A" | "B" = isForced
  ? (forced as "A" | "B")
  : cookieVariant === "A" || cookieVariant === "B"
    ? cookieVariant
    : crypto.getRandomValues(new Uint8Array(1))[0] < 128
      ? "A"
      : "B"

if (!isPreview && !isForced && cookieVariant !== "A" && cookieVariant !== "B") {
  document.cookie = `${cookieName}=${variant}; Max-Age=7776000; Path=/; SameSite=Lax`
}

document.documentElement.dataset.homeVariant = variant
document.documentElement.dataset.homeExperimentPreview = String(isPreview)
document.documentElement.dataset.homeExperimentDebug = String(isDebug)
document.documentElement.dataset.homeExperimentId = "home_layout_v1"
