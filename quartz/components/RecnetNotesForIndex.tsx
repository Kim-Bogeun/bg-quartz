// RecentNotesForIndex.tsx
import { QuartzComponent, QuartzComponentProps } from "./types"
import RecentNotes from "./RecentNotes"
 
const RecentNotesForIndex: QuartzComponent = ({ fileData, ...props }: QuartzComponentProps) => {
  return fileData.slug === "index" ? (
    <RecentNotes
      title="Recent Posts"
      limit={5}
      showTags={true}
      linkToMore="/all-posts"
      {...props}
    />
  ) : null
}
 
export default RecentNotesForIndex