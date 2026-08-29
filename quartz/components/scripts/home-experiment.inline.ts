import { Metric, onCLS, onINP, onLCP } from "web-vitals"

type Assignment = {
  variant: "A" | "B"
  isPreview: boolean
}

type ClickContext = {
  experiment_id: string
  variant: "A" | "B"
  exposure_id: string
  exposed_at: number
  article_path: string
  article_title: string
  slot: string
  position: number
  clicked_at: number
}

type ExposureContext = {
  experiment_id: string
  variant: "A" | "B"
  exposure_id: string
  exposed_at: number
}

const experimentId = "home_layout_v1"
const engagementSeconds = 30
const engagementScrollRatio = 0.5
let currentHomeExposure: ExposureContext | undefined
let pendingHomeInpExposure: ExposureContext | undefined

function sendAnalyticsEvent(name: string, params: Record<string, unknown>) {
  const analyticsWindow = window as typeof window & {
    gtag?: (...args: unknown[]) => void
    abAnalyticsQueue?: Array<[string, Record<string, unknown>]>
  }
  const isDebug = new URLSearchParams(location.search).get("ab_debug") === "1"
  const eventParams = isDebug ? { ...params, debug_mode: true, traffic_type: "internal" } : params
  if (analyticsWindow.gtag) {
    analyticsWindow.gtag("event", name, eventParams)
  } else {
    analyticsWindow.abAnalyticsQueue = analyticsWindow.abAnalyticsQueue ?? []
    analyticsWindow.abAnalyticsQueue.push([name, eventParams])
  }
}

function getAssignment(): Assignment {
  const searchParams = new URLSearchParams(location.search)
  const forced = searchParams.get("variant")?.toUpperCase()
  const isForced = forced === "A" || forced === "B"
  const isDebug = searchParams.get("ab_debug") === "1"
  const isProduction = location.hostname === "bogeun.pages.dev"
  const isPreview = !isDebug && (isForced || !isProduction)

  const cookieName = "ab_home_layout_v1"
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
  return { variant, isPreview }
}

function createExposure(variant: "A" | "B"): ExposureContext {
  return {
    experiment_id: experimentId,
    variant,
    exposure_id: crypto.randomUUID(),
    exposed_at: Date.now(),
  }
}

function reportHomeWebVital(metric: Metric) {
  const exposure =
    currentHomeExposure ?? (metric.name === "INP" ? pendingHomeInpExposure : undefined)
  if (!exposure) return

  sendAnalyticsEvent("home_web_vital", {
    ...exposure,
    metric_name: metric.name,
    metric_value: metric.value,
    metric_delta: metric.delta,
    metric_id: metric.id,
    metric_rating: metric.rating,
    navigation_type: metric.navigationType,
  })

  if (metric.name === "INP") pendingHomeInpExposure = undefined
}

onCLS(reportHomeWebVital)
onINP(reportHomeWebVital)
onLCP(reportHomeWebVital)

window.addEventListener("error", () => {
  if (!currentHomeExposure) return
  sendAnalyticsEvent("home_client_error", {
    ...currentHomeExposure,
    error_type: "javascript_error",
  })
})

window.addEventListener("unhandledrejection", () => {
  if (!currentHomeExposure) return
  sendAnalyticsEvent("home_client_error", {
    ...currentHomeExposure,
    error_type: "unhandled_rejection",
  })
})

function setupHomeExperiment() {
  const home = document.querySelector<HTMLElement>(".home-experiment")
  if (!home) return

  const assignment = getAssignment()
  document.documentElement.dataset.homeVariant = assignment.variant
  document.documentElement.dataset.homeExperimentPreview = String(assignment.isPreview)

  if (!assignment.isPreview) {
    currentHomeExposure = createExposure(assignment.variant)
    sessionStorage.setItem("ab_home_exposure_v1", JSON.stringify(currentHomeExposure))
    sendAnalyticsEvent("experiment_exposure", currentHomeExposure)
  }

  const clickHandler = (event: Event) => {
    if (!(event.target instanceof Element)) return
    const link = event.target.closest<HTMLElement>(".home-article-link")
    if (!link || assignment.isPreview) return

    const context: ClickContext = {
      ...currentHomeExposure!,
      article_path: `/${link.dataset.articleSlug ?? ""}`,
      article_title: link.dataset.articleTitle ?? "",
      slot: `recent_${link.dataset.position ?? ""}`,
      position: Number(link.dataset.position),
      clicked_at: Date.now(),
    }

    if (new URLSearchParams(location.search).get("ab_debug") === "1") {
      const debugLink = link as HTMLAnchorElement
      const debugUrl = new URL(debugLink.href)
      debugUrl.searchParams.set("ab_debug", "1")
      debugLink.href = debugUrl.toString()
    }

    pendingHomeInpExposure = currentHomeExposure
    sessionStorage.setItem("ab_home_article_click_v1", JSON.stringify(context))
    sendAnalyticsEvent("home_article_click", context)
  }

  home.addEventListener("click", clickHandler)
  window.addCleanup(() => home.removeEventListener("click", clickHandler))
}

function setupArticleEngagement() {
  if (document.body.dataset.slug === "index") return

  const rawContext = sessionStorage.getItem("ab_home_article_click_v1")
  if (!rawContext) return

  let context: ClickContext
  try {
    context = JSON.parse(rawContext) as ClickContext
  } catch {
    sessionStorage.removeItem("ab_home_article_click_v1")
    return
  }

  if (context.article_path.replace(/^\//, "") !== document.body.dataset.slug) return

  let elapsed = false
  let scrolled = false
  let sent = false

  const maybeSend = () => {
    if (sent || !elapsed || !scrolled) return
    sent = true
    sessionStorage.removeItem("ab_home_article_click_v1")
    sendAnalyticsEvent("article_engaged_from_home", {
      ...context,
      engagement_seconds: engagementSeconds,
      scroll_ratio: engagementScrollRatio,
    })
  }

  const checkScroll = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight
    scrolled = scrollable <= 0 || window.scrollY / scrollable >= engagementScrollRatio
    maybeSend()
  }

  const timer = window.setTimeout(() => {
    elapsed = true
    maybeSend()
  }, engagementSeconds * 1000)

  window.addEventListener("scroll", checkScroll, { passive: true })
  checkScroll()
  window.addCleanup(() => {
    window.clearTimeout(timer)
    window.removeEventListener("scroll", checkScroll)
  })
}

function setupGlobalArticleEngagement() {
  const slug = document.body.dataset.slug
  const article = document.querySelector<HTMLElement>("article.popover-hint")
  const title = document.querySelector<HTMLElement>("h1.article-title")?.textContent?.trim()
  const hasContentMetadata = document.querySelector(".content-meta") !== null

  if (!slug || slug === "index" || !article || !title || !hasContentMetadata) return

  let accumulatedActiveMs = 0
  let activeStartedAt = document.visibilityState === "visible" ? performance.now() : undefined
  let scrolled = false
  let sent = false

  const activeTimeMs = () =>
    accumulatedActiveMs + (activeStartedAt === undefined ? 0 : performance.now() - activeStartedAt)

  const maybeSend = () => {
    if (sent || !scrolled || activeTimeMs() < engagementSeconds * 1000) return
    sent = true

    const tags = Array.from(document.querySelectorAll<HTMLElement>("a.tag-link"))
      .map((tag) => tag.textContent?.trim().replace(/^#/, ""))
      .filter((tag): tag is string => Boolean(tag))

    sendAnalyticsEvent("article_engaged", {
      article_path: `/${slug}`,
      article_title: title,
      content_category: slug.split("/")[0] ?? "",
      content_tags: tags.join("|"),
      engagement_seconds: engagementSeconds,
      scroll_ratio: engagementScrollRatio,
      active_time_measurement: "page_visibility",
    })
  }

  const checkArticleScroll = () => {
    const articleTop = article.getBoundingClientRect().top + window.scrollY
    const viewedArticleHeight = window.scrollY + window.innerHeight - articleTop
    scrolled =
      article.scrollHeight <= 0 ||
      viewedArticleHeight / article.scrollHeight >= engagementScrollRatio
    maybeSend()
  }

  const updateActiveTime = () => {
    const now = performance.now()
    if (document.visibilityState === "visible") {
      activeStartedAt ??= now
    } else if (activeStartedAt !== undefined) {
      accumulatedActiveMs += now - activeStartedAt
      activeStartedAt = undefined
    }
    maybeSend()
  }

  const activeTimer = window.setInterval(maybeSend, 1000)
  window.addEventListener("scroll", checkArticleScroll, { passive: true })
  document.addEventListener("visibilitychange", updateActiveTime)
  checkArticleScroll()

  window.addCleanup(() => {
    window.clearInterval(activeTimer)
    window.removeEventListener("scroll", checkArticleScroll)
    document.removeEventListener("visibilitychange", updateActiveTime)
  })
}

document.addEventListener("nav", () => {
  currentHomeExposure = undefined
  setupHomeExperiment()
  setupArticleEngagement()
  setupGlobalArticleEngagement()
})
