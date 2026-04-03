// @ts-ignore
import script from "./scripts/interactive-balloon.inline"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const InteractiveBalloon: QuartzComponent = (props: QuartzComponentProps) => {
  return null
}

InteractiveBalloon.afterDOMLoaded = script

export default (() => InteractiveBalloon) satisfies QuartzComponentConstructor