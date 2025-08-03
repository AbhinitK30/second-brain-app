import React from "react"
import { AlertTriangle } from "lucide-react"

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 font-medium">Failed to render PDF preview</p>
          <p className="text-red-500 text-sm mt-1">Please try refreshing the page</p>
        </div>
      )
    }
    return this.props.children
  }
}
