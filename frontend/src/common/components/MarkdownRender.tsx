import ReactMarkdown from "react-markdown"
import '../../pages/Legal.css'

function MarkdownRender({ content }) {
	return <div className="prose prose-neutral max-w-none">
			<ReactMarkdown>{content}</ReactMarkdown>
		</div>
}

export default MarkdownRender