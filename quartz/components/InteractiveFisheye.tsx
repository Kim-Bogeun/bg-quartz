// @ts-ignore
import script from "./scripts/interactive-fisheye.inline"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const InteractiveFisheye: QuartzComponent = (props: QuartzComponentProps) => {
  return null
}

InteractiveFisheye.afterDOMLoaded = script

export default (() => InteractiveFisheye) satisfies QuartzComponentConstructor
