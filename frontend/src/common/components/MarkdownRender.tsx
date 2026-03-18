import ReactMarkdown from "react-markdown"
import '../../pages/Legal.css'

function MarkdownRender({ content }) {
	return <div className="markdown-content">
			<ReactMarkdown>{content}</ReactMarkdown>
		</div>
}

export default MarkdownRender