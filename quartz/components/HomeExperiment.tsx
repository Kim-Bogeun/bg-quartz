import { Date, getDate } from "./Date"
import { byDateAndAlphabetical } from "./PageList"
import { QuartzComponent, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"
import style from "./styles/homeExperiment.scss"

// @ts-ignore
import beforeScript from "./scripts/home-experiment-prescript.inline"
// @ts-ignore
import afterScript from "./scripts/home-experiment.inline"

type Cover = {
  src: string
  alt: string
  fit?: "cover" | "contain"
}

const covers: Record<string, Cover> = {
  "Playground/폭죽과-풍선들": {
    src: "./static/ab-covers/teambaby.webp",
    alt: "TEAM BABY 앨범 커버",
  },
  "Playground/Fluid-Words": {
    src: "./static/ab-covers/pretext.webp",
    alt: "검은 배경 위 글자로 그린 사람의 옆모습",
  },
  "Basis/프롬프트-엔지니어링과-CS146s_1": {
    src: "./static/ab-covers/cs146s.webp",
    alt: "CS146S The Modern Software Developer 강의 표지",
  },
  "Causality/Structural-Causal-Model/03.-Backdoor-Criterion": {
    src: "./Files/no-confounding.png",
    alt: "교란이 없는 인과 그래프",
    fit: "contain",
  },
  "Causality/Structural-Causal-Model/02.-Intervention,-Identification": {
    src: "./Files/Intervention-in-Graph.png",
    alt: "인과 그래프에서의 개입",
    fit: "contain",
  },
  "AI/Contextual-Bandit-용어-정리": {
    src: "./static/ab-covers/contextual-bandit.webp",
    alt: "상황에 따라 행동을 고르는 Contextual Bandit 삽화",
  },
}

const HomeExperiment: QuartzComponent = ({ allFiles, fileData, cfg }: QuartzComponentProps) => {
  if (fileData.slug !== "index") return null

  const pages = allFiles
    .filter((page) => page.slug !== "index")
    .sort(byDateAndAlphabetical(cfg))
    .slice(0, 6)

  const tagLink = (tag: string) => (
    <a class="internal tag-link" href={resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)}>
      {tag}
    </a>
  )

  return (
    <section class="home-experiment" data-experiment-id="home_layout_v1">
      <div class="home-variant home-variant-a" data-variant="A">
        <h3>Recent Posts</h3>
        <ul class="recent-ul">
          {pages.map((page, index) => {
            const title = page.frontmatter?.title ?? "Untitled"
            const href = resolveRelative(fileData.slug!, page.slug!)

            return (
              <li class="recent-li">
                <div class="section">
                  <div class="desc">
                    <h3>
                      <a
                        href={href}
                        class="internal home-article-link"
                        data-article-slug={page.slug}
                        data-article-title={title}
                        data-position={index + 1}
                      >
                        {title}
                      </a>
                    </h3>
                  </div>
                  {page.dates && (
                    <p class="meta">
                      <Date date={getDate(cfg, page)!} locale={cfg.locale} />
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <div class="home-variant home-variant-b" data-variant="B">
        <div class="gallery-heading">
          <h3>Recent Posts</h3>
        </div>
        <div class="note-gallery">
          {pages.map((page, index) => {
            const title = page.frontmatter?.title ?? "Untitled"
            const href = resolveRelative(fileData.slug!, page.slug!)
            const cover = covers[page.slug!]

            return (
              <article class="note-card">
                <a
                  href={href}
                  class="internal home-article-link note-card-link"
                  data-article-slug={page.slug}
                  data-article-title={title}
                  data-position={index + 1}
                  aria-label={`${title} 읽기`}
                >
                  <span class={`note-card-media${cover?.fit === "contain" ? " is-contain" : ""}`}>
                    {cover ? (
                      <img
                        src={cover.src}
                        alt={cover.alt}
                        loading={index < 2 ? "eager" : "lazy"}
                        decoding="async"
                      />
                    ) : (
                      <span class="note-card-fallback" aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    )}
                  </span>
                  <span class="note-card-copy">
                    <span class="note-card-title">{title}</span>
                    {page.dates && (
                      <span class="note-card-date">
                        <Date date={getDate(cfg, page)!} locale={cfg.locale} />
                      </span>
                    )}
                  </span>
                </a>
              </article>
            )
          })}
        </div>
      </div>

      <section class="home-information">
        <h3>Interests</h3>
        <ul>
          <li>
            Causality in AI: {tagLink("Causality")} {tagLink("PO")} {tagLink("SCM")} {tagLink("AI")}
          </li>
          <li>
            Learning under Distribution Shift: {tagLink("Domain_Generalization")}{" "}
            {tagLink("Transportability")}
          </li>
          <li>
            etc.: {tagLink("CS")} {tagLink("Upskilling")} {tagLink("etc")}
          </li>
        </ul>

        <blockquote class="callout" data-callout="tip">
          <div class="callout-title">
            <div class="callout-icon" aria-hidden="true" />
            <div class="callout-title-inner">
              <p>안내</p>
            </div>
          </div>
          <div class="callout-content">
            <div class="callout-content-inner">
              <p>공부하며 배운 개념을 정리하고 제 방식대로 설명하는 글을 모아둔 곳입니다.</p>
              <p>
                공부한 내용을 쉽게 풀어 쓰려고 노력하지만, 설명 과정에서 다소 틀린 부분이나 부정확한
                부분이 있을 수 있습니다.
              </p>
              <p>발견하신다면 언제든 알려주시면 반영하겠습니다. 감사합니다.</p>
            </div>
          </div>
        </blockquote>
      </section>
    </section>
  )
}

HomeExperiment.css = style
HomeExperiment.beforeDOMLoaded = beforeScript
HomeExperiment.afterDOMLoaded = afterScript

export default () => HomeExperiment
