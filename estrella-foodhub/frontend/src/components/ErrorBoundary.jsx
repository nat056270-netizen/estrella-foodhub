import { Component } from 'react';
import { ErrorState } from './AsyncState';
export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error, info) { console.error('Workspace render error', error, info); }
  render() {
    if (this.state.failed) return <div className="min-h-screen flex items-center justify-center p-5"><div className="card"><ErrorState message="The workspace couldn’t be displayed. Reload to reconnect to your data." onRetry={() => window.location.reload()} /></div></div>;
    return this.props.children;
  }
}
